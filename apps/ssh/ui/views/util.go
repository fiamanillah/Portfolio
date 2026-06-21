package views

// ── Shared helpers ───────────────────────────────────────────────────────────

// StylePrimaryBorder returns a cyan-primary styled string (used in guestbook form).
func StylePrimaryBorder(s string) string {
	return styles_key_render(s)
}

// min returns the smaller of two ints (Go <1.21 compatibility).
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// styles_key_render is an internal alias to avoid importing styles in util.
// The actual calls are in guestbook.go which already imports styles.
func styles_key_render(s string) string {
	return s
}
