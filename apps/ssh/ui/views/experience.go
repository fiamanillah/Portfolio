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
		Year:        "2024",
		Period:      "PRESENT · 6 MO",
		Company:     "Freelance / Self-Employed",
		Role:        "FULL-STACK DEVELOPER",
		Location:    "Dhaka, BD · Remote",
		Type:        "Contract",
		Description: "Developing custom web applications and REST APIs for clients across EdTech and e-commerce. Architecting Node.js backends with PostgreSQL, React frontends, and deploying on self-managed Linux VPS infrastructure.",
		Highlights: []string{
			"Delivered 3 production web apps with zero critical issues",
			"Reduced API response times 50% via query optimization & Redis",
			"Full Docker + Nginx + SSL deployment pipelines for all clients",
			"Real-time inventory dashboard using WebSockets",
		},
		Technologies: []string{"Node.js", "React", "PostgreSQL", "Redis", "Docker", "Nginx", "TypeScript", "Prisma"},
		Takeaway:     "Communication matters as much as code — understand the real problem before writing a line.",
		Stats:        []ExpStat{{"Apps Delivered", "3"}, {"API Speedup", "50%"}, {"Uptime", "99.9%"}},
	},
	{
		Year:        "2023",
		Period:      "2024 · 12 MO",
		Company:     "Personal Projects & OSS",
		Role:        "BACKEND ENGINEER (SELF-DIRECTED)",
		Location:    "Dhaka, BD · Local",
		Type:        "Self-Directed",
		Description: "Deep-dived into backend systems and infrastructure. Built several production-grade personal projects including a URL shortener with analytics, a task management API, and contributed to open-source Go libraries.",
		Highlights: []string{
			"URL shortener handling 10K+ redirects/day with Go & Redis",
			"Task API with JWT auth, rate limiting, 85% test coverage",
			"Contributed to 2 open-source Go libs (500+ combined stars)",
			"Set up Proxmox virtualization lab for homelab experiments",
		},
		Technologies: []string{"Go", "Redis", "PostgreSQL", "JWT", "Linux", "Proxmox", "Docker", "GitHub Actions"},
		Takeaway:     "Owning something end-to-end with full responsibility is the fastest way to grow.",
		Stats:        []ExpStat{{"Redirects/Day", "10K+"}, {"OSS Stars", "500+"}, {"Test Coverage", "85%"}},
	},
	{
		Year:        "2021",
		Period:      "2023 · 18 MO",
		Company:     "Frontend & Web Design Phase",
		Role:        "JUNIOR WEB DEVELOPER",
		Location:    "Dhaka, BD · Remote",
		Type:        "Freelance",
		Description: "Started career building responsive websites and landing pages. Transitioned from HTML/CSS to React and Next.js while mastering performance, accessibility, and web standards.",
		Highlights: []string{
			"Shipped 15+ landing pages for local SMBs",
			"Achieved 90+ Lighthouse scores across all client projects",
			"Learned React ecosystem and shipped first Next.js app",
			"Reduced average page load time to under 1.5s",
		},
		Technologies: []string{"HTML/CSS", "JavaScript", "React", "Next.js", "Figma", "Tailwind", "Vercel", "GSAP"},
		Takeaway:     "A strong frontend foundation makes you a much better backend engineer.",
		Stats:        []ExpStat{{"Sites Shipped", "15+"}, {"Lighthouse Score", "90+"}, {"Avg Load Time", "<1.5s"}},
	},
}

func GetExperiencesLength() int {
	return len(Experiences)
}

// DrawExperience renders the work history with expand/collapse.
func DrawExperience(selectedIndex int, expandedIndex int, width int) string {
	var sb strings.Builder
	iw := innerWidth(width)

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(styles.StyleTitleLarge.Render("PROFESSIONAL TIMELINE"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(styles.StyleMuted.Render("j/k or Up/Down: navigate  ·  ENTER: expand/collapse"))
	sb.WriteString("\n")
	sb.WriteString(" ")
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

		sb.WriteString(fmt.Sprintf(" %s%s  %s  %s\n",
			arrow, yearPart, companyStyle.Render(exp.Company), typeTag,
		))
		sb.WriteString(fmt.Sprintf("    %s  %s\n",
			styles.StyleAccent.Render(exp.Role),
			styles.StyleMuted.Render("· "+exp.Location),
		))
		sb.WriteString(fmt.Sprintf("    %s\n", styles.StyleFaint.Render(exp.Period)))

		if isExpanded {
			// ── Expanded detail box ───────────────────────────────
			// boxW: must satisfy  boxW + 2(border) + 2(left indent " ")  <= iw
			// i.e.  boxW <= iw - 4
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

			sb.WriteString("\n  ")
			sb.WriteString(detailBox)
			sb.WriteString("\n")
		} else {
			sb.WriteString("    ")
			sb.WriteString(styles.StyleFaint.Render("[ ENTER to expand ]"))
			sb.WriteString("\n")
		}

		// Separator between entries
		if i < len(Experiences)-1 {
			sb.WriteString(" ")
			sb.WriteString(styles.StyleFaint.Render(strings.Repeat("╌", iw-2)))
			sb.WriteString("\n")
		}
		sb.WriteString("\n")
	}

	return sb.String()
}
