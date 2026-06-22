package views

import (
	"fmt"
	"strings"

	"portfolio-ssh/guestbook"
	"portfolio-ssh/ui/styles"

	"github.com/charmbracelet/lipgloss"
)

// DrawGuestbook renders the guestbook list or signature form.
func DrawGuestbook(gm *guestbook.GuestbookModel, width int) string {
	var sb strings.Builder
	iw := innerWidth(width)

	// ── Section header ─────────────────────────────────────────────
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(styles.StyleTitleLarge.Render("GUESTBOOK"))
	sb.WriteString("\n")
	sb.WriteString(" ")
	sb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", iw-2)))
	sb.WriteString("\n\n")

	if gm.State == guestbook.StateViewing {
		// ── Controls ──────────────────────────────────────────────
		controls := []struct{ key, action string }{
			{"s", "Sign"},
			{"r", "Reload"},
			{"↑/↓", "Scroll"},
		}
		var ctrlParts []string
		for _, c := range controls {
			ctrlParts = append(ctrlParts,
				styles.StyleBadgePrimary.Render(c.key)+" "+styles.StyleMuted.Render(c.action),
			)
		}
		sb.WriteString(" ")
		sb.WriteString(strings.Join(ctrlParts, "   "))
		sb.WriteString("\n\n")

		// ── Error message ─────────────────────────────────────────
		if gm.ErrorMsg != "" {
			sb.WriteString(" ")
			sb.WriteString(styles.StyleError.Render("! "+gm.ErrorMsg))
			sb.WriteString("\n\n")
		}

		// ── Empty state ───────────────────────────────────────────
		if len(gm.Entries) == 0 {
			emptyW := iw - 4
			if emptyW > 70 {
				emptyW = 70
			}
			emptyBox := lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(styles.ColorBorderDim).
				Width(emptyW).
				Padding(1, 2).
				Render(
					styles.StyleMuted.Render("No messages yet — be the first to leave your mark!") + "\n" +
						styles.StyleFaint.Render("Press 's' to sign the guestbook"),
				)
			sb.WriteString(" ")
			sb.WriteString(emptyBox)
			sb.WriteString("\n")
			return sb.String()
		}

		// ── Entry count ───────────────────────────────────────────
		countStr := fmt.Sprintf("%d message", len(gm.Entries))
		if len(gm.Entries) != 1 {
			countStr += "s"
		}
		sb.WriteString(" ")
		sb.WriteString(styles.StyleMuted.Render("◈ "+countStr))
		sb.WriteString("\n\n")

		// ── Entry boxes ───────────────────────────────────────────
		// entryW + 1(left border) + 2(PaddingLeft) must fit in iw
		// entryW = iw - 4
		entryW := iw - 4
		if entryW > 76 {
			entryW = 76
		}

		visible := 0
		for i, entry := range gm.Entries {
			if i < gm.ScrollOffset {
				continue
			}
			if visible >= 5 {
				break
			}
			visible++

			dateStr := entry.Timestamp.Format("Jan 02, 2006  15:04")

			// Alternating left-border colors for visual rhythm
			var borderColor lipgloss.Color
			if i%2 == 0 {
				borderColor = styles.ColorBorderActive
			} else {
				borderColor = styles.ColorSecondary
			}

			nameStr := styles.StyleHighlight.Render("✦ " + entry.Name)
			dateStrFmt := styles.StyleMuted.Render("  " + dateStr)
			msgStr := styles.StyleBody.Render(entry.Message)

			entryBox := lipgloss.NewStyle().
				Border(lipgloss.NormalBorder(), false, false, false, true).
				BorderForeground(borderColor).
				PaddingLeft(1).
				Width(entryW).
				Render(nameStr + dateStrFmt + "\n" + msgStr)

			sb.WriteString(" ")
			sb.WriteString(entryBox)
			sb.WriteString("\n\n")
		}

		// ── Scroll indicator ──────────────────────────────────────
		if len(gm.Entries) > 5 {
			total := len(gm.Entries)
			showing := min(gm.ScrollOffset+5, total)
			sb.WriteString(fmt.Sprintf(" %s\n",
				styles.StyleFaint.Render(fmt.Sprintf(
					"Showing %d-%d of %d  ·  use Up/Down to scroll",
					gm.ScrollOffset+1, showing, total,
				)),
			))
		}

	} else {
		// ── Sign form ─────────────────────────────────────────────
		sb.WriteString(" ")
		sb.WriteString(styles.StyleBody.Render("Leave a message for visitors of this terminal."))
		sb.WriteString("\n")
		sb.WriteString(" ")
		sb.WriteString(styles.StyleMuted.Render("Press ESC to cancel  ·  ENTER to proceed"))
		sb.WriteString("\n\n")

		// formW + 2(border) must fit in iw
		formW := iw - 4
		if formW > 60 {
			formW = 60
		}
		if formW < 24 {
			formW = 24
		}

		var formSb strings.Builder

		formSb.WriteString(styles.StyleHighlight.Render("✦  SIGN THE GUESTBOOK"))
		formSb.WriteString("\n")
		formSb.WriteString(styles.StyleFaint.Render(strings.Repeat("─", formW-6)))
		formSb.WriteString("\n\n")

		// Name field
		nameLabel := styles.StyleMuted.Render("Name")
		if gm.State == guestbook.StateEnteringName {
			nameLabel = styles.StyleKey.Render("▸ Name  [active]")
		}
		formSb.WriteString(nameLabel)
		formSb.WriteString("\n")
		formSb.WriteString(gm.NameInput.View())
		formSb.WriteString("\n\n")

		// Message field
		msgLabel := styles.StyleMuted.Render("Message")
		if gm.State == guestbook.StateEnteringMessage {
			msgLabel = styles.StyleKey.Render("▸ Message  [active]")
		}
		formSb.WriteString(msgLabel)
		formSb.WriteString("\n")
		formSb.WriteString(gm.MsgInput.View())
		formSb.WriteString("\n\n")

		// Step indicator
		var stepStr string
		if gm.State == guestbook.StateEnteringName {
			stepStr = styles.StyleBadgePrimary.Render("Step 1/2") + "  " +
				styles.StyleMuted.Render("Enter your name, then press ENTER")
		} else {
			stepStr = styles.StyleBadgePrimary.Render("Step 2/2") + "  " +
				styles.StyleMuted.Render("Write your message, then press ENTER to submit")
		}
		formSb.WriteString(stepStr)

		formBox := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(styles.ColorPrimary).
			Width(formW).
			Padding(1, 2).
			Render(formSb.String())

		sb.WriteString(" ")
		sb.WriteString(formBox)
		sb.WriteString("\n")
	}

	return sb.String()
}
