package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	wishbubbletea "github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"
)

func main() {
	// CLI Flags
	sshMode := flag.Bool("ssh", false, "run as SSH server instead of local CLI")
	port := flag.Int("port", 2222, "port to listen on (for SSH server mode)")
	host := flag.String("host", "127.0.0.1", "host to listen on (for SSH server mode)")
	gbFile := flag.String("guestbook", "guestbook.json", "path to guestbook JSON file")
	flag.Parse()

	// Ensure absolute path for guestbook
	absGbPath, err := filepath.Abs(*gbFile)
	if err != nil {
		fmt.Printf("Error resolving guestbook path: %v\n", err)
		os.Exit(1)
	}

	if !*sshMode {
		// Local CLI Mode
		p := tea.NewProgram(initialModel(absGbPath), tea.WithAltScreen())
		if _, err := p.Run(); err != nil {
			fmt.Printf("Error running TUI: %v\n", err)
			os.Exit(1)
		}
		return
	}

	// SSH Server Mode
	addr := net.JoinHostPort(*host, fmt.Sprintf("%d", *port))

	// Ensure .ssh dir exists in current working dir for key storage
	_ = os.MkdirAll(".ssh", 0700)
	keyPath := filepath.Join(".ssh", "id_ed25519")

	s, err := wish.NewServer(
		wish.WithAddress(addr),
		wish.WithHostKeyPath(keyPath),
		wish.WithMiddleware(
			wishbubbletea.Middleware(func(s ssh.Session) (tea.Model, []tea.ProgramOption) {
				pty, _, active := s.Pty()
				if !active {
					fmt.Fprintf(s, "error: active terminal required\n")
					return nil, nil
				}

				m := initialModel(absGbPath)
				m.width = pty.Window.Width
				m.height = pty.Window.Height

				return m, []tea.ProgramOption{
					tea.WithAltScreen(),
				}
			}),
			logging.Middleware(),
		),
	)
	if err != nil {
		log.Fatal("Could not start SSH server", "err", err)
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	log.Info("Starting SSH portfolio server", "address", addr, "guestbook", absGbPath)
	go func() {
		if err = s.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			log.Error("Could not listen and serve", "err", err)
			done <- nil
		}
	}()

	<-done
	log.Info("Stopping SSH server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		log.Error("Could not shutdown server gracefully", "err", err)
	}
	log.Info("Server stopped successfully")
}
