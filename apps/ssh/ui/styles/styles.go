package styles

import (
	"strings"
	"unicode/utf8"

	"github.com/charmbracelet/lipgloss"
)

// ─── Color System ─────────────────────────────────────────────────────────────
var (
	// Primary: Cyan family
	ColorPrimary      = lipgloss.Color("#06B6D4") // Cyan-500
	ColorPrimaryDark  = lipgloss.Color("#0891B2") // Cyan-600
	ColorPrimaryLight = lipgloss.Color("#67E8F9") // Cyan-300

	// Accents
	ColorSecondary = lipgloss.Color("#818CF8") // Indigo-400
	ColorAccent    = lipgloss.Color("#F472B6") // Pink-400
	ColorGold      = lipgloss.Color("#FBBF24") // Amber-400
	ColorGreen     = lipgloss.Color("#34D399") // Emerald-400
	ColorWarning   = lipgloss.Color("#FB923C") // Orange-400
	ColorError     = lipgloss.Color("#F87171") // Red-400

	// Neutrals / UI
	ColorForeground   = lipgloss.Color("#F0F9FF") // Cyan-50
	ColorSubtle       = lipgloss.Color("#CBD5E1") // Slate-300
	ColorMuted        = lipgloss.Color("#64748B") // Slate-500
	ColorFaint        = lipgloss.Color("#334155") // Slate-700
	ColorBackground   = lipgloss.Color("#020B14") // Near-black (deep navy)
	ColorBorder       = lipgloss.Color("#164E63") // Cyan-900
	ColorBorderActive = lipgloss.Color("#06B6D4") // Cyan-500
	ColorBorderDim    = lipgloss.Color("#1E3A4C") // dim cyan border
	ColorHighBorder   = lipgloss.Color("#22D3EE") // Cyan-400
)

// ─── Typography Styles ────────────────────────────────────────────────────────
var (
	StyleTitle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorPrimary)

	StyleTitleLarge = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorPrimaryLight)

	StyleSubtitle = lipgloss.NewStyle().
			Italic(true).
			Foreground(ColorMuted)

	StyleBody = lipgloss.NewStyle().
			Foreground(ColorSubtle)

	StyleMuted = lipgloss.NewStyle().
			Foreground(ColorMuted)

	StyleFaint = lipgloss.NewStyle().
			Foreground(ColorFaint)

	StyleHighlight = lipgloss.NewStyle().
			Foreground(ColorPrimaryLight).
			Bold(true)

	StyleAccent = lipgloss.NewStyle().
			Foreground(ColorSecondary).
			Bold(true)

	StyleGold = lipgloss.NewStyle().
			Foreground(ColorGold).
			Bold(true)

	StyleGreen = lipgloss.NewStyle().
			Foreground(ColorGreen)

	StyleError = lipgloss.NewStyle().
			Foreground(ColorError)
)

// ─── Header / Footer ─────────────────────────────────────────────────────────
var (
	StyleHeader = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorBackground).
			Background(ColorPrimary).
			Padding(0, 2)

	StyleHeaderDim = lipgloss.NewStyle().
			Foreground(ColorPrimaryLight).
			Background(ColorBorderDim).
			Padding(0, 2)

	// Footer has a top border only
	StyleFooter = lipgloss.NewStyle().
			Foreground(ColorMuted).
			Border(lipgloss.NormalBorder(), true, false, false, false).
			BorderForeground(ColorBorder).
			Padding(0, 1)
)

// ─── Tab Styles ──────────────────────────────────────────────────────────────
// Padding(0, 1) — compact so tabs don't overflow on 80-col terminals
var (
	StyleTabActive = lipgloss.NewStyle().
			Background(ColorPrimary).
			Foreground(ColorBackground).
			Bold(true).
			Padding(0, 1)

	StyleTabInactive = lipgloss.NewStyle().
				Background(ColorBorderDim).
				Foreground(lipgloss.Color("#94A3B8")).
				Padding(0, 1)

	StyleTabGap = lipgloss.NewStyle().
			Border(lipgloss.Border{Bottom: "─"}).
			BorderForeground(ColorBorder)
)

// ─── Container Styles ────────────────────────────────────────────────────────
var (
	StyleContainer = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Padding(0, 2)

	StyleContainerActive = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(ColorBorderActive).
				Padding(0, 2)

	StyleContainerGlow = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(ColorHighBorder).
				Padding(0, 2)

	StyleCard = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorderDim).
			Padding(0, 1)

	StyleCardActive = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorPrimary).
			Padding(0, 1)
)

// ─── Key / Value / Badge ─────────────────────────────────────────────────────
var (
	StyleKey = lipgloss.NewStyle().
			Foreground(ColorPrimary).
			Bold(true)

	StyleValue = lipgloss.NewStyle().
			Foreground(ColorForeground)

	StyleBadge = lipgloss.NewStyle().
			Background(ColorFaint).
			Foreground(ColorSubtle).
			Padding(0, 1).
			Bold(true)

	StyleBadgePrimary = lipgloss.NewStyle().
				Background(ColorPrimary).
				Foreground(ColorBackground).
				Padding(0, 1).
				Bold(true)

	StyleBadgeAccent = lipgloss.NewStyle().
				Background(ColorSecondary).
				Foreground(ColorBackground).
				Padding(0, 1).
				Bold(true)

	StyleBadgeGold = lipgloss.NewStyle().
				Background(ColorGold).
				Foreground(ColorBackground).
				Padding(0, 1).
				Bold(true)

	StyleBadgeGreen = lipgloss.NewStyle().
				Background(ColorGreen).
				Foreground(ColorBackground).
				Padding(0, 1).
				Bold(true)
)

// ─── Layout Constants ────────────────────────────────────────────────────────
const (
	// ContentIndent is the standard left margin for all view content.
	ContentIndent = "  "
	// ContainerPadding is the horizontal padding inside the main container.
	// Container: Width(m.width-2), Padding(0,2) → inner = (m.width-2) - 4.
	ContainerPadding = 6
)

// ContentWidth returns the safe content width for rendering inside the container.
// Views receive m.width, so inner = width - ContainerPadding.
func ContentWidth(width int) int {
	w := width - ContainerPadding
	if w > 90 {
		w = 90
	}
	if w < 24 {
		w = 24
	}
	return w
}

// ─── Section Header Helper ──────────────────────────────────────────────────
// SectionHeader renders a standardized section title + optional subtitle + divider.
func SectionHeader(title, subtitle string, width int) string {
	iw := ContentWidth(width + ContainerPadding) // adjust since we're receiving inner width
	var sb strings.Builder
	sb.WriteString("\n")
	sb.WriteString(ContentIndent)
	sb.WriteString(StyleTitleLarge.Render(title))
	sb.WriteString("\n")
	if subtitle != "" {
		sb.WriteString(ContentIndent)
		sb.WriteString(StyleMuted.Render(subtitle))
		sb.WriteString("\n")
	}
	sb.WriteString(ContentIndent)
	sb.WriteString(StyleFaint.Render(strings.Repeat("─", iw-2)))
	sb.WriteString("\n\n")
	return sb.String()
}

// ─── Section Divider Helper ──────────────────────────────────────────────────
// Uses utf8.RuneCountInString so multi-byte box-drawing chars count correctly.
func SectionDivider(width int, label string) string {
	if width < 10 {
		width = 10
	}
	dash := "─"
	if label == "" {
		return StyleFaint.Render(strings.Repeat(dash, width))
	}
	padded := " " + label + " "
	labelLen := utf8.RuneCountInString(padded)
	if labelLen >= width {
		return StyleMuted.Render(padded)
	}
	sides := (width - labelLen) / 2
	if sides < 1 {
		sides = 1
	}
	right := width - sides - labelLen
	if right < 0 {
		right = 0
	}
	return StyleFaint.Render(strings.Repeat(dash, sides)) +
		StyleMuted.Render(padded) +
		StyleFaint.Render(strings.Repeat(dash, right))
}
