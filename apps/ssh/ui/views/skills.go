package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

type SkillItem struct {
	Title string
	Level int // 1-5
	Tags  []string
}

type SkillSection struct {
	Icon  string
	Title string
	Badge string
	Color string
	Items []SkillItem
}

var SkillSections = []SkillSection{
	{
		Icon:  "◈",
		Title: "Frontend",
		Badge: "UI & Languages",
		Color: "cyan",
		Items: []SkillItem{
			{Title: "HTML / CSS / JS", Level: 5, Tags: []string{"Core Web", "DOM"}},
			{Title: "TypeScript", Level: 4, Tags: []string{"Strict Mode"}},
			{Title: "React / Next.js", Level: 4, Tags: []string{"SSR", "App Router"}},
			{Title: "Tailwind / Shadcn", Level: 4, Tags: []string{"Atomic CSS"}},
			{Title: "Redux / Zustand", Level: 3, Tags: []string{"State Mgmt"}},
		},
	},
	{
		Icon:  "◉",
		Title: "Backend",
		Badge: "APIs & Data",
		Color: "indigo",
		Items: []SkillItem{
			{Title: "Node.js / Express", Level: 5, Tags: []string{"REST", "Runtime"}},
			{Title: "Nest.js", Level: 4, Tags: []string{"DI", "Arch"}},
			{Title: "Go", Level: 3, Tags: []string{"CLI", "Services"}},
			{Title: "PostgreSQL / MySQL", Level: 4, Tags: []string{"Relational"}},
			{Title: "MongoDB / Redis", Level: 4, Tags: []string{"NoSQL", "Cache"}},
		},
	},
	{
		Icon:  "✦",
		Title: "Infra",
		Badge: "Ops & Cloud",
		Color: "gold",
		Items: []SkillItem{
			{Title: "Docker / Nginx", Level: 4, Tags: []string{"Containers"}},
			{Title: "Linux / VPS", Level: 4, Tags: []string{"SysAdmin"}},
			{Title: "AWS / GCP", Level: 3, Tags: []string{"Cloud"}},
			{Title: "Proxmox / KVM", Level: 3, Tags: []string{"Hypervisor"}},
			{Title: "GitHub Actions", Level: 4, Tags: []string{"CI/CD"}},
		},
	},
}

// skillBar renders a compact █████ proficiency bar.
func skillBar(level int) string {
	const total = 5
	bar := ""
	for i := 0; i < total; i++ {
		if i < level {
			bar += "█"
		} else {
			bar += "░"
		}
	}
	return bar
}

// levelLabel returns a short proficiency label.
func levelLabel(level int, borderColor lipgloss.Color) string {
	switch level {
	case 5:
		return styles.StyleHighlight.Render("Expert")
	case 4:
		return styles.StyleGreen.Render("Advanced")
	case 3:
		return lipgloss.NewStyle().Foreground(styles.ColorGold).Render("Mid-Level")
	default:
		return styles.StyleMuted.Render("Learning")
	}
}

// DrawSkills renders the skills column layout.
func DrawSkills(width int) string {
	var sb strings.Builder
	iw := innerWidth(width)

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(" " + styles.StyleTitleLarge.Render("SKILLS & TECH STACK") + "\n")
	sb.WriteString(" " + styles.StyleMuted.Render("Languages · Libraries · Databases · Infrastructure") + "\n")
	sb.WriteString(" " + styles.StyleFaint.Render(strings.Repeat("─", iw-2)) + "\n\n")

	// ── Proficiency legend ─────────────────────────────────────────
	sb.WriteString(" " +
		styles.StyleFaint.Render("Proficiency: ") +
		styles.StyleHighlight.Render("█████") + styles.StyleFaint.Render(" Expert  ") +
		styles.StyleHighlight.Render("████░") + styles.StyleFaint.Render(" Advanced  ") +
		styles.StyleHighlight.Render("███░░") + styles.StyleFaint.Render(" Mid-Level") +
		"\n\n")

	// ── Column layout ──────────────────────────────────────────────
	// Each col: Width(colW) + 2 border chars = colW+2 rendered width
	// 3 cols: 3*(colW+2) must fit in iw (no extra margin prefix beyond the " " indent)
	// So: colW = (iw - 2 - 3*2) / 3  →  (iw - 8) / 3
	colW := (iw - 8) / 3
	if colW > 28 {
		colW = 28
	}
	if colW < 18 {
		colW = 18
	}

	var columns []string

	for _, section := range SkillSections {
		var colSb strings.Builder

		var headerBadge string
		var borderColor lipgloss.Color
		var iconStyle lipgloss.Style
		switch section.Color {
		case "indigo":
			headerBadge = styles.StyleBadgeAccent.Render(section.Badge)
			borderColor = styles.ColorSecondary
			iconStyle = styles.StyleAccent
		case "gold":
			headerBadge = styles.StyleBadgeGold.Render(section.Badge)
			borderColor = styles.ColorGold
			iconStyle = styles.StyleGold
		default:
			headerBadge = styles.StyleBadgePrimary.Render(section.Badge)
			borderColor = styles.ColorPrimary
			iconStyle = styles.StyleHighlight
		}

		colSb.WriteString(fmt.Sprintf("%s %s\n",
			iconStyle.Render(section.Icon),
			lipgloss.NewStyle().Foreground(borderColor).Bold(true).Render(section.Title),
		))
		colSb.WriteString(headerBadge + "\n")
		colSb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", colW)) + "\n\n")

		for _, item := range section.Items {
			colSb.WriteString(lipgloss.NewStyle().
				Foreground(styles.ColorForeground).Bold(true).
				Render(item.Title) + "\n")

			bar := skillBar(item.Level)
			colSb.WriteString(fmt.Sprintf(" %s %s\n",
				lipgloss.NewStyle().Foreground(borderColor).Render(bar),
				levelLabel(item.Level, borderColor),
			))

			// Tags (one line)
			tagLine := " "
			for _, tag := range item.Tags {
				tagLine += styles.StyleBadge.Render(tag) + " "
			}
			colSb.WriteString(tagLine + "\n\n")
		}

		colStyle := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(borderColor).
			Padding(0, 1).
			Width(colW)

		columns = append(columns, colStyle.Render(colSb.String()))
	}

	// Layout: side-by-side or stacked
	if iw >= 3*(colW+2)+2 {
		joined := lipgloss.JoinHorizontal(lipgloss.Top, columns...)
		sb.WriteString(" " + joined + "\n")
	} else {
		for _, col := range columns {
			sb.WriteString(" " + col + "\n")
		}
	}

	// ── Tools row ─────────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(" " + styles.SectionDivider(iw-2, "TOOLS") + "\n\n")

	tools := []string{
		"Git", "Vim", "Postman", "Prisma", "Drizzle",
		"RabbitMQ", "Jest", "Vitest", "Figma", "VSCode",
	}
	toolLine := " "
	for _, t := range tools {
		toolLine += styles.StyleBadge.Render(t) + " "
	}
	sb.WriteString(toolLine + "\n")

	return sb.String()
}
