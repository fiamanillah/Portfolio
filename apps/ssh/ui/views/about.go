package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

// DrawAbout renders the Biography and Philosophy tab content.
func DrawAbout(width int) string {
	var sb strings.Builder
	iw := innerWidth(width)
	ci := styles.ContentIndent

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleTitleLarge.Render("ABOUT ME"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", iw-2)))
	sb.WriteString("\n\n")

	// ── Bio ──────────────────────────────────────────────────────
	bioLines := []string{
		"I'm a Full-Stack Developer specializing in building scalable MERN",
		"stack, Nest.js, and Next.js applications. I bridge the gap between",
		"complex event-driven backend architectures and clean, responsive",
		"frontend design.",
		"",
		"Currently focused on high-performance REST APIs, real-time WebSockets",
		"integration, message queues (RabbitMQ, Redis), and DevOps pipeline",
		"containerization with Docker.",
		"",
		"My philosophy: write code that's readable first, then fast, then",
		"complete. Every system I touch becomes more maintainable than I",
		"found it.",
	}
	for _, line := range bioLines {
		if line == "" {
			sb.WriteString("\n")
		} else {
			sb.WriteString(ci)
			sb.WriteString(styles.StyleBody.Render(line))
			sb.WriteString("\n")
		}
	}
	sb.WriteString("\n")

	// ── Stats row ──────────────────────────────────────────────────
	sb.WriteString(ci)
	sb.WriteString(styles.SectionDivider(iw-2, "AT A GLANCE"))
	sb.WriteString("\n\n")

	stats := []struct{ value, label string }{
		{"1+", "Years Exp."},
		{"1", "Company"},
		{"13+", "Technologies"},
		{"5+", "Stack Areas"},
	}

	// Each card: Width(cardW) + 2 border chars = cardW+2 visual width
	// 4 cards side by side + spaces between = needs to fit in iw
	// Safe formula: 4*(cardW+2) + 3 gaps <= iw
	cardW := (iw - 3) / 4 - 2
	if cardW < 10 {
		cardW = 10
	}
	if cardW > 18 {
		cardW = 18
	}

	var statCards []string
	for _, s := range stats {
		card := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(styles.ColorBorder).
			Width(cardW).
			Padding(0, 1).
			Render(
				styles.StyleHighlight.Render(s.value) + "\n" +
					styles.StyleMuted.Render(s.label),
			)
		statCards = append(statCards, card)
	}
	statsRow := lipgloss.JoinHorizontal(lipgloss.Top, statCards...)
	sb.WriteString(ci)
	sb.WriteString(statsRow)
	sb.WriteString("\n\n")

	// ── Philosophy cards ───────────────────────────────────────────
	sb.WriteString(ci)
	sb.WriteString(styles.SectionDivider(iw-2, "PHILOSOPHY"))
	sb.WriteString("\n\n")

	philosophy := []struct {
		icon, title, desc string
		borderColor       lipgloss.Color
		titleStyle        lipgloss.Style
	}{
		{
			"◈", "Brutal Simplicity",
			"Kill every abstraction that doesn't earn its place. Complexity is a bug.",
			styles.ColorPrimary, styles.StyleHighlight,
		},
		{
			"◉", "Performance by Default",
			"Cache aggressively, query efficiently. A slow system is a broken system.",
			styles.ColorSecondary, styles.StyleAccent,
		},
		{
			"✦", "Ship, Then Iterate",
			"Bias towards shipping. Perfectionism kills velocity. Learn from production.",
			styles.ColorGold, styles.StyleGold,
		},
	}

	// cardW: must fit in iw with 2 border chars + indent
	phCardW := iw - 4
	if phCardW > 76 {
		phCardW = 76
	}

	for _, p := range philosophy {
		titleLine := p.titleStyle.Render(p.icon + "  " + p.title)
		descLine := styles.StyleBody.Render(p.desc)

		card := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(p.borderColor).
			Width(phCardW).
			Padding(0, 1).
			Render(titleLine + "\n" + descLine)

		sb.WriteString(ci)
		sb.WriteString(card)
		sb.WriteString("\n")
	}

	sb.WriteString("\n")

	// ── Credentials ────────────────────────────────────────────────
	sb.WriteString(ci)
	sb.WriteString(styles.SectionDivider(iw-2, "CREDENTIALS"))
	sb.WriteString("\n\n")

	credentials := []struct{ year, title, detail string }{
		{"2025", "Full Stack Developer — Softvence Agency", "TypeScript · Express · Prisma · PostgreSQL · Redis · RabbitMQ · Docker"},
		{"2023", "Self-Taught Full-Stack Developer", "Node.js · React · PostgreSQL · Docker · Go"},
		{"2022", "Linux & VPS Server Administration", "Nginx · SSL · Process Management"},
		{"2021", "Web Development Fundamentals", "HTML · CSS · JavaScript · REST APIs"},
	}

	for _, c := range credentials {
		yearStr := lipgloss.NewStyle().Foreground(styles.ColorPrimary).Bold(true).Render(c.year)
		titleStr := lipgloss.NewStyle().Bold(true).Foreground(styles.ColorForeground).Render(c.title)
		sb.WriteString(fmt.Sprintf("%s%s  %s\n", ci, yearStr, titleStr))
		sb.WriteString(fmt.Sprintf("%s      %s\n\n", ci, styles.StyleMuted.Render(c.detail)))
	}

	return sb.String()
}
