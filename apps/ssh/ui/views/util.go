package views

// ── Shared helpers ───────────────────────────────────────────────────────────

// min returns the smaller of two ints (Go <1.21 compatibility).
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
