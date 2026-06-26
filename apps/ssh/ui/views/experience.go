package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

// Experience data structures
type Experience struct {
	Year         string
	Period       string
	Company      string
	Role         string
	Location     string
	Type         string
	Description  string
	Highlights   []string
	Technologies []string
	Takeaway     string
	Stats        []ExpStat
}

type ExpStat struct {
	Label string
	Value string
}

var Experiences = []Experience{
	{
		Year:        "2025",
		Period:      "PRESENT // 14 MO",
		Company:     "Softvence Agency",
		Role:        "FULL STACK DEVELOPER",
		Location:    "Dhaka, BD · Remote-Friendly",
		Type:        "Full-Time",
		Description: "Architected type-safe backend systems with TypeScript, Express.js, and Prisma ORM, integrated with React.js frontends to deliver responsive, high-performance applications.",
		Highlights: []string{
			"Decoupled intensive background tasks (email, AI) using RabbitMQ message brokers",
			"Improved DB query latency and API response times with Redis caching",
			"Built granular RBAC, real-time WebSockets, and Stripe/Paystack billing",
			"Containerized multi-service environments with Docker on VPS with AWS S3/MinIO",
		},
		Technologies: []string{"TypeScript", "Express.js", "Prisma", "PostgreSQL", "Redis", "RabbitMQ", "WebSockets", "Stripe", "Paystack", "Docker", "AWS S3", "MinIO", "Linux VPS"},
		Takeaway:     "Mastered decoupling intensive background jobs and optimizing database access patterns for scalability and real-time reliability.",
		Stats:        []ExpStat{{"Background Queues", "RabbitMQ"}, {"Billing", "Stripe/Paystack"}, {"Storage", "AWS S3/MinIO"}},
	},
}

func GetExperiencesLength() int {
	return len(Experiences)
}

// DrawExperience renders the work history with expand/collapse.
func DrawExperience(selectedIndex int, expandedIndex int, width int) string {
	var sb strings.Builder
	iw := innerWidth(width)
	ci := styles.ContentIndent

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleTitleLarge.Render("PROFESSIONAL TIMELINE"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleMuted.Render("j/k or Up/Down: navigate  ·  ENTER: expand/collapse"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", iw-2)))
	sb.WriteString("\n\n")

	for i, exp := range Experiences {
		isSelected := i == selectedIndex
		isExpanded := i == expandedIndex

		// ── Entry header ──────────────────────────────────────────
		var arrow string
		if isSelected && isExpanded {
			arrow = styles.StyleHighlight.Render("▾ ")
		} else if isSelected {
			arrow = styles.StyleHighlight.Render("▸ ")
		} else {
			arrow = "  "
		}

		yearPart := styles.StyleHighlight.Render(fmt.Sprintf("[%s]", exp.Year))

		var typeTag string
		switch exp.Type {
		case "Full-Time":
			typeTag = styles.StyleBadgeGreen.Render(exp.Type)
		case "Contract":
			typeTag = styles.StyleBadgeAccent.Render(exp.Type)
		case "Self-Directed":
			typeTag = styles.StyleBadgeGold.Render(exp.Type)
		default:
			typeTag = styles.StyleBadge.Render(exp.Type)
		}

		var companyStyle lipgloss.Style
		if isSelected {
			companyStyle = lipgloss.NewStyle().Foreground(styles.ColorPrimaryLight).Underline(true).Bold(true)
		} else {
			companyStyle = lipgloss.NewStyle().Foreground(styles.ColorForeground).Bold(true)
		}

		sb.WriteString(fmt.Sprintf("%s%s%s  %s  %s\n",
			ci, arrow, yearPart, companyStyle.Render(exp.Company), typeTag,
		))
		sb.WriteString(fmt.Sprintf("%s    %s  %s\n",
			ci,
			styles.StyleAccent.Render(exp.Role),
			styles.StyleMuted.Render("· "+exp.Location),
		))
		sb.WriteString(fmt.Sprintf("%s    %s\n", ci, styles.StyleFaint.Render(exp.Period)))

		if isExpanded {
			// ── Expanded detail box ───────────────────────────────
			boxW := iw - 6
			if boxW > 80 {
				boxW = 80
			}
			if boxW < 20 {
				boxW = 20
			}

			var detSb strings.Builder

			// Description
			detSb.WriteString("\n")
			detSb.WriteString(styles.StyleBody.Render(exp.Description))
			detSb.WriteString("\n\n")

			// Highlights
			detSb.WriteString(styles.StyleKey.Render("HIGHLIGHTS"))
			detSb.WriteString("\n")
			for _, h := range exp.Highlights {
				detSb.WriteString(fmt.Sprintf(" %s  %s\n",
					lipgloss.NewStyle().Foreground(styles.ColorPrimary).Render("◈"),
					styles.StyleBody.Render(h),
				))
			}
			detSb.WriteString("\n")

			// Impact stats
			detSb.WriteString(styles.StyleKey.Render("IMPACT"))
			detSb.WriteString("\n")
			var statParts []string
			for _, s := range exp.Stats {
				statParts = append(statParts, fmt.Sprintf("%s %s",
					styles.StyleHighlight.Render(s.Value),
					styles.StyleMuted.Render(s.Label),
				))
			}
			detSb.WriteString(" ")
			detSb.WriteString(strings.Join(statParts, "   ·   "))
			detSb.WriteString("\n\n")

			// Technologies
			detSb.WriteString(styles.StyleKey.Render("TECHNOLOGIES"))
			detSb.WriteString("\n ")
			for j, tech := range exp.Technologies {
				if j > 0 && j%5 == 0 {
					detSb.WriteString("\n ")
				}
				detSb.WriteString(styles.StyleBadge.Render(tech))
				detSb.WriteString(" ")
			}
			detSb.WriteString("\n\n")

			// Key takeaway
			takeaway := lipgloss.NewStyle().
				Border(lipgloss.NormalBorder(), false, false, false, true).
				BorderForeground(styles.ColorPrimary).
				PaddingLeft(1).
				Foreground(styles.ColorSubtle).
				Italic(true).
				Render(styles.StyleKey.Render("TAKEAWAY") + "\n\"" + exp.Takeaway + "\"")
			detSb.WriteString(takeaway)
			detSb.WriteString("\n")

			detailBox := lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(styles.ColorBorderActive).
				Width(boxW).
				Padding(0, 1).
				Render(detSb.String())

			sb.WriteString("\n")
			sb.WriteString(ci)
			sb.WriteString("  ")
			sb.WriteString(detailBox)
			sb.WriteString("\n")
		} else {
			sb.WriteString(ci)
			sb.WriteString("    ")
			sb.WriteString(styles.StyleFaint.Render("[ ENTER to expand ]"))
			sb.WriteString("\n")
		}

		// Separator between entries
		if i < len(Experiences)-1 {
			sb.WriteString(ci)
			sb.WriteString(styles.StyleFaint.Render(strings.Repeat("╌", iw-2)))
			sb.WriteString("\n")
		}
		sb.WriteString("\n")
	}

	return sb.String()
}
