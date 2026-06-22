package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

// innerWidth returns the safe content width for rendering inside the container.
// Container: Width(m.width-2), Padding(0,2) → inner = (m.width-2) - 4 = m.width-6.
// Views receive m.width, so inner = width-6.
func innerWidth(width int) int {
	w := width - 6
	if w > 90 {
		w = 90
	}
	if w < 24 {
		w = 24
	}
	return w
}

// DrawHome renders the Welcome/Home tab content.
func DrawHome(width int) string {
	var sb strings.Builder
	iw := innerWidth(width)

	// ── SSH-session style welcome banner ──────────────────────────
	// This gives an authentic terminal feel that matches the SSH theme.
	prompt := styles.StyleHighlight.Render("visitor") +
		styles.StyleFaint.Render("@") +
		styles.StyleTitle.Render("portfolio") +
		styles.StyleFaint.Render(":") +
		styles.StyleGreen.Render("~") +
		styles.StyleFaint.Render("$")

	divLine := styles.StyleFaint.Render(strings.Repeat("─", iw-2))

	sb.WriteString("\n")

	// whoami command
	sb.WriteString(" ")
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("whoami"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(styles.StyleHighlight.Render("Fi Amanillah"))
	sb.WriteString("  ")
	sb.WriteString(styles.StyleFaint.Render("// Junior Full-Stack Developer"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(divLine)
	sb.WriteString("\n\n")

	// cat profile.json command
	sb.WriteString(" ")
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("cat profile.json"))
	sb.WriteString("\n")

	fields := []struct{ k, v string }{
		{"location  ", `"Dhaka, Bangladesh"`},
		{"role      ", `"Full-Stack Developer"`},
		{"experience", `"1+ Years"`},
		{"focus     ", `"Backend  ·  Cloud  ·  Clean UIs"`},
		{"contact   ", `"fi@amanillah.dev"`},
		{"status    ", `"open to opportunities"`},
	}

	sb.WriteString(" ")
	sb.WriteString(styles.StyleFaint.Render("{"))
	sb.WriteString("\n")
	for i, f := range fields {
		comma := ","
		if i == len(fields)-1 {
			comma = ""
		}
		line := fmt.Sprintf("   %s%s %s%s",
			styles.StyleKey.Render(`"`+f.k+`"`),
			styles.StyleFaint.Render(":"),
			styles.StyleGreen.Render(f.v),
			styles.StyleFaint.Render(comma),
		)
		sb.WriteString(" ")
		sb.WriteString(line)
		sb.WriteString("\n")
	}
	sb.WriteString(" ")
	sb.WriteString(styles.StyleFaint.Render("}"))
	sb.WriteString("\n\n")

	// ls links/ command
	sb.WriteString(" ")
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("ls links/"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(divLine)
	sb.WriteString("\n")

	links := []struct{ icon, label, value string }{
		{"[github]  ", "GitHub", "github.com/fiamanillah"},
		{"[linkedin]", "LinkedIn", "linkedin.com/in/fiamanillah"},
		{"[website] ", "Website", "amanillah.dev"},
		{"[email]   ", "Email", "fi@amanillah.dev"},
	}
	for _, l := range links {
		sb.WriteString(fmt.Sprintf(" %s  %s\n",
			styles.StyleMuted.Render(l.icon),
			styles.StyleBody.Render(l.value),
		))
	}
	sb.WriteString("\n")

	// ── Tech stack badges ─────────────────────────────────────────
	sb.WriteString(" ")
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("cat stack.txt"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(divLine)
	sb.WriteString("\n")

	stacks := []struct {
		name  string
		style lipgloss.Style
	}{
		{"TypeScript", styles.StyleBadgePrimary},
		{"Go", styles.StyleBadgeAccent},
		{"React", styles.StyleBadgePrimary},
		{"Node.js", styles.StyleBadgeGreen},
		{"PostgreSQL", styles.StyleBadgeGold},
		{"Docker", styles.StyleBadgePrimary},
		{"Linux", styles.StyleBadgeAccent},
		{"Redis", styles.StyleBadgeGold},
	}

	var badgeLine strings.Builder
	badgeLine.WriteString(" ")
	for _, s := range stacks {
		badgeLine.WriteString(s.style.Render(s.name))
		badgeLine.WriteString(" ")
	}
	sb.WriteString(badgeLine.String())
	sb.WriteString("\n\n")

	// ── Status indicator ──────────────────────────────────────────
	avail := lipgloss.NewStyle().
		Foreground(styles.ColorGreen).
		Bold(true).
		Render("●  Available for freelance & full-time positions")
	sb.WriteString(" ")
	sb.WriteString(avail)
	sb.WriteString("\n")

	return sb.String()
}
