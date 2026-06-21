package main

import (
	"fmt"
	"strings"

	"portfolio-ssh/guestbook"
	"portfolio-ssh/ui/styles"
	"portfolio-ssh/ui/views"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ─── Model ────────────────────────────────────────────────────────────────────

type model struct {
	activeTab   int
	width       int
	height      int
	expSelected int
	expExpanded int
	guestbook   guestbook.GuestbookModel
	quitting    bool
}

func initialModel(guestbookFile string) model {
	gm := guestbook.NewGuestbookModel(guestbookFile)
	return model{
		activeTab:   0,
		width:       80,
		height:      24,
		expSelected: 0,
		expExpanded: -1,
		guestbook:   gm,
		quitting:    false,
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

// ─── Update ───────────────────────────────────────────────────────────────────

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		// Global quit (only when not in guestbook input)
		if m.guestbook.State == guestbook.StateViewing {
			switch msg.String() {
			case "q", "ctrl+c":
				m.quitting = true
				return m, tea.Quit
			}
		} else {
			if msg.Type == tea.KeyEsc {
				m.guestbook.State = guestbook.StateViewing
				m.guestbook.NameInput.Blur()
				m.guestbook.MsgInput.Blur()
				return m, nil
			}
		}

		// Guestbook form input handling
		if m.activeTab == 4 && m.guestbook.State != guestbook.StateViewing {
			switch m.guestbook.State {
			case guestbook.StateEnteringName:
				if msg.Type == tea.KeyEnter {
					nameVal := strings.TrimSpace(m.guestbook.NameInput.Value())
					if nameVal != "" {
						m.guestbook.State = guestbook.StateEnteringMessage
						m.guestbook.NameInput.Blur()
						m.guestbook.MsgInput.Focus()
					}
					return m, nil
				}
				m.guestbook.NameInput, cmd = m.guestbook.NameInput.Update(msg)
				return m, cmd

			case guestbook.StateEnteringMessage:
				if msg.Type == tea.KeyEnter {
					msgVal := strings.TrimSpace(m.guestbook.MsgInput.Value())
					if msgVal != "" {
						m.guestbook.AddEntry()
						m.guestbook.State = guestbook.StateViewing
						m.guestbook.MsgInput.Blur()
					}
					return m, nil
				}
				m.guestbook.MsgInput, cmd = m.guestbook.MsgInput.Update(msg)
				return m, cmd
			}
		}

		// Standard navigation
		switch msg.String() {
		case "1":
			m.activeTab = 0
		case "2":
			m.activeTab = 1
		case "3":
			m.activeTab = 2
		case "4":
			m.activeTab = 3
		case "5":
			m.activeTab = 4

		case "tab":
			m.activeTab = (m.activeTab + 1) % 5
		case "shift+tab":
			m.activeTab = (m.activeTab - 1 + 5) % 5

		case "up", "k":
			if m.activeTab == 2 {
				if m.expSelected > 0 {
					m.expSelected--
				}
			} else if m.activeTab == 4 {
				if m.guestbook.ScrollOffset > 0 {
					m.guestbook.ScrollOffset--
				}
			}

		case "down", "j":
			if m.activeTab == 2 {
				if m.expSelected < views.GetExperiencesLength()-1 {
					m.expSelected++
				}
			} else if m.activeTab == 4 {
				if m.guestbook.ScrollOffset < len(m.guestbook.Entries)-1 {
					m.guestbook.ScrollOffset++
				}
			}

		case "enter":
			if m.activeTab == 2 {
				if m.expExpanded == m.expSelected {
					m.expExpanded = -1
				} else {
					m.expExpanded = m.expSelected
				}
			}

		case "s":
			if m.activeTab == 4 && m.guestbook.State == guestbook.StateViewing {
				m.guestbook.State = guestbook.StateEnteringName
				m.guestbook.NameInput.Focus()
				return m, textinput.Blink
			}

		case "r":
			if m.activeTab == 4 && m.guestbook.State == guestbook.StateViewing {
				m.guestbook.LoadEntries()
			}
		}
	}

	return m, nil
}

// ─── View ─────────────────────────────────────────────────────────────────────

func (m model) View() string {
	if m.quitting {
		return lipgloss.NewStyle().
			Foreground(styles.ColorPrimary).
			Bold(true).
			Render("\n  ◈  Thanks for visiting! Come back anytime.\n\n")
	}

	if m.width < 45 || m.height < 12 {
		return fmt.Sprintf(
			"\n  %s\n  Terminal too small: %dx%d  (min 45x12)\n",
			styles.StyleError.Render("! Resize your terminal"),
			m.width, m.height,
		)
	}

	var sb strings.Builder

	// ── 1. Header bar ────────────────────────────────────────────
	// Full-width two-tone bar: brand left, info right, fill center
	leftBrand := styles.StyleHeader.Render(" FI AMANILLAH ")
	rightInfo := styles.StyleHeaderDim.Render(fmt.Sprintf(" SSH Portfolio · %dx%d ", m.width, m.height))
	fillNeeded := m.width - lipgloss.Width(leftBrand) - lipgloss.Width(rightInfo)
	if fillNeeded < 0 {
		fillNeeded = 0
	}
	centerFill := lipgloss.NewStyle().Background(styles.ColorBorderDim).Render(strings.Repeat(" ", fillNeeded))
	sb.WriteString(leftBrand + centerFill + rightInfo + "\n")

	// ── 2. Tab bar ────────────────────────────────────────────────
	// Keep labels short so all 5 tabs fit comfortably on 80-col terminals.
	// Format: "[N] Label" with Padding(0,1) — total per tab ~10-14 chars → ~60 chars total, safe.
	tabDefs := []struct{ num, label string }{
		{"1", "Home"},
		{"2", "About"},
		{"3", "Work"},
		{"4", "Skills"},
		{"5", "Guestbook"},
	}

	var renderedTabs []string
	for i, t := range tabDefs {
		label := fmt.Sprintf("[%s] %s", t.num, t.label)
		if i == m.activeTab {
			renderedTabs = append(renderedTabs, styles.StyleTabActive.Render(label))
		} else {
			renderedTabs = append(renderedTabs, styles.StyleTabInactive.Render(label))
		}
	}

	tabsJoined := lipgloss.JoinHorizontal(lipgloss.Bottom, renderedTabs...)
	tabWidth := lipgloss.Width(tabsJoined)
	gapWidth := m.width - tabWidth - 2 // -2 for left margin of content box
	if gapWidth < 0 {
		gapWidth = 0
	}
	tabGap := styles.StyleTabGap.Render(strings.Repeat("─", gapWidth))
	tabRow := lipgloss.JoinHorizontal(lipgloss.Bottom, tabsJoined, tabGap)
	sb.WriteString(tabRow + "\n")

	// ── 3. Content body ───────────────────────────────────────────
	var body string
	switch m.activeTab {
	case 0:
		body = views.DrawHome(m.width)
	case 1:
		body = views.DrawAbout(m.width)
	case 2:
		body = views.DrawExperience(m.expSelected, m.expExpanded, m.width)
	case 3:
		body = views.DrawSkills(m.width)
	case 4:
		body = views.DrawGuestbook(&m.guestbook, m.width)
	}

	// Overhead line count (exact):
	//   1  header
	//   1  tab row
	//   2  container border (top + bottom) — lipgloss Border adds 1 line each side
	//   2  footer (top-border line + content line)
	// ──────
	//   6  total overhead  →  contentHeight = height - 6
	//
	// The container Padding(0,2) does NOT add lines, only columns, so it doesn't
	// affect the vertical count.
	const overheadLines = 6
	contentHeight := m.height - overheadLines
	if contentHeight < 4 {
		contentHeight = 4
	}

	// Container width: m.width-2 leaves 1 char margin on each side.
	// Inner content area = (m.width-2) - 2*horizontalPadding(2) = m.width-6.
	// Views receive m.width and derive contentWidth = m.width - 6 to match.
	containerW := m.width - 2

	var containerStyle lipgloss.Style
	if m.activeTab == 0 {
		containerStyle = styles.StyleContainerGlow
	} else {
		containerStyle = styles.StyleContainerActive
	}

	contentBox := containerStyle.
		Height(contentHeight).
		Width(containerW).
		Render(body)

	sb.WriteString(contentBox + "\n")

	// ── 4. Footer ─────────────────────────────────────────────────
	var footerLeft string
	switch {
	case m.activeTab == 4 && m.guestbook.State != guestbook.StateViewing:
		footerLeft = " ESC: Cancel  ENTER: Next/Submit"
	case m.activeTab == 2:
		footerLeft = " j/k or Up/Down: navigate  ENTER: expand"
	case m.activeTab == 4:
		footerLeft = " s: Sign  r: Reload  Up/Down: Scroll"
	default:
		footerLeft = " Tab/Shift-Tab: navigate  1-5: jump"
	}
	footerRight := " q: Quit"

	footerW := m.width - 2
	footerRightW := lipgloss.Width(footerRight)
	footerLeftW := footerW - footerRightW - 2 // -2 for footer padding
	if footerLeftW < 0 {
		footerLeftW = 0
	}

	footerContent := lipgloss.JoinHorizontal(lipgloss.Center,
		lipgloss.NewStyle().Foreground(styles.ColorMuted).Width(footerLeftW).Render(footerLeft),
		lipgloss.NewStyle().Foreground(styles.ColorPrimary).Bold(true).Render(footerRight),
	)

	sb.WriteString(styles.StyleFooter.Width(footerW).Render(footerContent) + "\n")

	return sb.String()
}
