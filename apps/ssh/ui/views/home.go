package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

// innerWidth returns the safe content width for rendering inside the container.
// Delegates to the shared styles helper.
func innerWidth(width int) int {
	return styles.ContentWidth(width)
}

// DrawHome renders the Welcome/Home tab content.
func DrawHome(width int) string {
	var sb strings.Builder
	iw := innerWidth(width)
	ci := styles.ContentIndent

	// ── SSH-session style welcome banner ──────────────────────────
	prompt := styles.StyleHighlight.Render("visitor") +
		styles.StyleFaint.Render("@") +
		styles.StyleTitle.Render("portfolio") +
		styles.StyleFaint.Render(":") +
		styles.StyleGreen.Render("~") +
		styles.StyleFaint.Render("$")

	divLine := styles.StyleFaint.Render(strings.Repeat("─", iw-2))

	sb.WriteString("\n")

	// whoami command
	sb.WriteString(ci)
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("whoami"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(styles.StyleHighlight.Render("Fi Amanillah"))
	sb.WriteString("  ")
	sb.WriteString(styles.StyleFaint.Render("// Full-Stack Developer"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(divLine)
	sb.WriteString("\n\n")

	// cat profile.json command
	sb.WriteString(ci)
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("cat profile.json"))
	sb.WriteString("\n")

	type kv struct{ k, v string }
	fields := []kv{
		{"location", `"Dhaka, Bangladesh"`},
		{"role", `"Full-Stack Developer"`},
		{"experience", `"1+ Years"`},
		{"specialty", `"Backend & DevOps"`},
		{"company", `"Softvence Agency"`},
		{"email", `"fi@amanillah.com"`},
		{"status", `"open to opportunities"`},
	}

	// Calculate max key length for alignment
	maxKeyLen := 0
	for _, f := range fields {
		if len(f.k) > maxKeyLen {
			maxKeyLen = len(f.k)
		}
	}

	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render("{"))
	sb.WriteString("\n")
	for i, f := range fields {
		comma := ","
		if i == len(fields)-1 {
			comma = ""
		}
		// Pad key to align values
		paddedKey := f.k + strings.Repeat(" ", maxKeyLen-len(f.k))
		line := fmt.Sprintf("  %s%s %s%s",
			styles.StyleKey.Render(`"`+paddedKey+`"`),
			styles.StyleFaint.Render(":"),
			styles.StyleGreen.Render(f.v),
			styles.StyleFaint.Render(comma),
		)
		sb.WriteString(ci)
		sb.WriteString(line)
		sb.WriteString("\n")
	}
	sb.WriteString(ci)
	sb.WriteString(styles.StyleFaint.Render("}"))
	sb.WriteString("\n\n")

	// ls links/ command
	sb.WriteString(ci)
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("ls links/"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(divLine)
	sb.WriteString("\n")

	links := []struct{ icon, label, value string }{
		{"[github]  ", "GitHub", "github.com/fiamanillah"},
		{"[linkedin]", "LinkedIn", "linkedin.com/in/fi-amanillah"},
		{"[facebook]", "Facebook", "facebook.com/fiamanillah.b2"},
		{"[website] ", "Website", "amanillah.com"},
		{"[email]   ", "Email", "fi@amanillah.com"},
	}
	for _, l := range links {
		sb.WriteString(fmt.Sprintf("%s%s  %s\n",
			ci,
			styles.StyleMuted.Render(l.icon),
			styles.StyleBody.Render(l.value),
		))
	}
	sb.WriteString("\n")

	// ── Tech stack badges ─────────────────────────────────────────
	sb.WriteString(ci)
	sb.WriteString(prompt)
	sb.WriteString(" ")
	sb.WriteString(styles.StyleBody.Render("cat stack.txt"))
	sb.WriteString("\n")
	sb.WriteString(ci)
	sb.WriteString(divLine)
	sb.WriteString("\n")

	stacks := []struct {
		name  string
		style lipgloss.Style
	}{
		{"TypeScript", styles.StyleBadgePrimary},
		{"React", styles.StyleBadgePrimary},
		{"Node.js", styles.StyleBadgeGreen},
		{"Nest.js", styles.StyleBadgeAccent},
		{"PostgreSQL", styles.StyleBadgeGold},
		{"Docker", styles.StyleBadgePrimary},
		{"Redis", styles.StyleBadgeGold},
		{"AWS", styles.StyleBadgeAccent},
	}

	var badgeLine strings.Builder
	badgeLine.WriteString(ci)
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
	sb.WriteString(ci)
	sb.WriteString(avail)
	sb.WriteString("\n")

	return sb.String()
}
