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
		Badge: "Frontend & Languages",
		Color: "cyan",
		Items: []SkillItem{
			{Title: "HTML / CSS / JS", Level: 5, Tags: []string{"Core Web", "DOM"}},
			{Title: "TypeScript / Go", Level: 4, Tags: []string{"Languages"}},
			{Title: "React / Next.js", Level: 4, Tags: []string{"SSR", "App Router"}},
			{Title: "Tailwind / Shadcn", Level: 4, Tags: []string{"Atomic CSS"}},
			{Title: "Redux / WebSockets", Level: 3, Tags: []string{"State", "Realtime"}},
		},
	},
	{
		Icon:  "◉",
		Title: "Backend",
		Badge: "Backend & Data Layer",
		Color: "indigo",
		Items: []SkillItem{
			{Title: "Node / Express", Level: 5, Tags: []string{"Runtime", "API"}},
			{Title: "Nest.js", Level: 4, Tags: []string{"Architecture"}},
			{Title: "PostgreSQL / MySQL", Level: 4, Tags: []string{"Relational"}},
			{Title: "MongoDB / Redis", Level: 4, Tags: []string{"NoSQL", "Cache"}},
			{Title: "Prisma / Mongoose", Level: 4, Tags: []string{"ORM", "Modeling"}},
		},
	},
	{
		Icon:  "✦",
		Title: "Infra",
		Badge: "Operational Flow",
		Color: "gold",
		Items: []SkillItem{
			{Title: "Docker / Nginx", Level: 4, Tags: []string{"Containers"}},
			{Title: "Linux / VPS", Level: 4, Tags: []string{"SysAdmin"}},
			{Title: "AWS / GCP / Git", Level: 3, Tags: []string{"Cloud", "CI/CD"}},
			{Title: "Proxmox / KVM", Level: 3, Tags: []string{"Hypervisor"}},
			{Title: "RabbitMQ / BullMQ", Level: 3, Tags: []string{"Msg Broker"}},
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
func levelLabel(level int) string {
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
	ci := styles.ContentIndent

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleTitleLarge.Render("SKILLS & TECH STACK"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleMuted.Render("Languages · Libraries · Databases · Infrastructure"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", iw-2)))
	sb.WriteString("\n\n")

	// ── Proficiency legend ─────────────────────────────────────────
	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render("Proficiency: "))
	sb.WriteString(styles.StyleHighlight.Render("█████"))
	sb.WriteString(styles.StyleFaint.Render(" Expert  "))
	sb.WriteString(styles.StyleHighlight.Render("████░"))
	sb.WriteString(styles.StyleFaint.Render(" Adv  "))
	sb.WriteString(styles.StyleHighlight.Render("███░░"))
	sb.WriteString(styles.StyleFaint.Render(" Mid"))
	sb.WriteString("\n\n")

	// ── Column layout ──────────────────────────────────────────────
	// Total rendered width for 3 side-by-side columns + indent:
	//   ci(2) + 3 * (colW + 2_border) = 3*colW + 8
	// Must fit in iw: 3*colW + 8 <= iw → colW <= (iw - 8) / 3
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
		colSb.WriteString(headerBadge)
		colSb.WriteString("\n")
		// Divider: colW - 2 because Padding(0,1) takes 2 chars from content area
		divW := colW - 2
		if divW < 4 {
			divW = 4
		}
		colSb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", divW)))
		colSb.WriteString("\n\n")

		for _, item := range section.Items {
			colSb.WriteString(lipgloss.NewStyle().
				Foreground(styles.ColorForeground).Bold(true).
				Render(item.Title))
			colSb.WriteString("\n")

			bar := skillBar(item.Level)
			colSb.WriteString(fmt.Sprintf(" %s %s\n",
				lipgloss.NewStyle().Foreground(borderColor).Render(bar),
				levelLabel(item.Level),
			))

			// Tags (one line)
			tagLine := " "
			for _, tag := range item.Tags {
				tagLine += styles.StyleBadge.Render(tag) + " "
			}
			colSb.WriteString(tagLine)
			colSb.WriteString("\n\n")
		}

		colStyle := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(borderColor).
			Padding(0, 1).
			Width(colW)

		columns = append(columns, colStyle.Render(colSb.String()))
	}

	// Layout: side-by-side if 3 columns + indent fit, otherwise stack
	if iw >= 3*(colW+2)+2 {
		joined := lipgloss.JoinHorizontal(lipgloss.Top, columns...)
		sb.WriteString(ci)
		sb.WriteString(joined)
		sb.WriteString("\n")
	} else {
		for _, col := range columns {
			sb.WriteString(ci)
			sb.WriteString(col)
			sb.WriteString("\n")
		}
	}

	// ── Tools row ─────────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.SectionDivider(iw-2, "TOOLS"))
	sb.WriteString("\n\n")

	tools := []string{
		"Git", "Vim", "Postman", "Prisma", "Drizzle",
		"RabbitMQ", "Jest", "Vitest", "Figma", "VSCode", "Bun",
	}
	toolLine := ci
	for _, t := range tools {
		toolLine += styles.StyleBadge.Render(t) + " "
	}
	sb.WriteString(toolLine)
	sb.WriteString("\n")

	return sb.String()
}
