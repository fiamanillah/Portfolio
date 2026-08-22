package guestbook

import (
	"encoding/json"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
)

var fileMutex sync.RWMutex

type GuestbookState int

const (
	StateViewing GuestbookState = iota
	StateEnteringName
	StateEnteringMessage
)

type GuestbookEntry struct {
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type GuestbookModel struct {
	State        GuestbookState
	Entries      []GuestbookEntry
	NameInput    textinput.Model
	MsgInput     textinput.Model
	FilePath     string
	ErrorMsg     string
	ScrollOffset int
}

func NewGuestbookModel(filePath string) GuestbookModel {
	nameIn := textinput.New()
	nameIn.Placeholder = "Your Name"
	nameIn.CharLimit = 30
	nameIn.Width = 30

	msgIn := textinput.New()
	msgIn.Placeholder = "Write a message..."
	msgIn.CharLimit = 100
	msgIn.Width = 50

	gm := GuestbookModel{
		State:     StateViewing,
		NameInput: nameIn,
		MsgInput:  msgIn,
		FilePath:  filePath,
	}
	gm.LoadEntries()
	return gm
}

func (gm *GuestbookModel) LoadEntries() {
	fileMutex.RLock()
	defer fileMutex.RUnlock()

	if _, err := os.Stat(gm.FilePath); os.IsNotExist(err) {
		gm.Entries = []GuestbookEntry{
			{Name: "Fi Amanillah", Message: "Welcome to my SSH portfolio guestbook! Feel free to leave a note.", Timestamp: time.Now()},
		}
		go func() {
			fileMutex.Lock()
			defer fileMutex.Unlock()
			data, _ := json.MarshalIndent(gm.Entries, "", "  ")
			_ = os.WriteFile(gm.FilePath, data, 0644)
		}()
		return
	}

	data, err := os.ReadFile(gm.FilePath)
	if err != nil {
		gm.ErrorMsg = "Could not load guestbook: " + err.Error()
		return
	}

	var entries []GuestbookEntry
	if err := json.Unmarshal(data, &entries); err != nil {
		gm.ErrorMsg = "Error parsing guestbook data"
		return
	}
	gm.Entries = entries
}

func (gm *GuestbookModel) SaveEntries() {
	data, err := json.MarshalIndent(gm.Entries, "", "  ")
	if err != nil {
		gm.ErrorMsg = "Failed to marshal entries"
		return
	}
	_ = os.WriteFile(gm.FilePath, data, 0644)
}

func (gm *GuestbookModel) AddEntry() {
	name := strings.TrimSpace(gm.NameInput.Value())
	msg := strings.TrimSpace(gm.MsgInput.Value())
	if name == "" || msg == "" {
		return
	}

	entry := GuestbookEntry{
		Name:      name,
		Message:   msg,
		Timestamp: time.Now(),
	}

	fileMutex.Lock()
	defer fileMutex.Unlock()

	// Re-read latest on disk before prepending to prevent overwriting other users
	if data, err := os.ReadFile(gm.FilePath); err == nil {
		var latest []GuestbookEntry
		if err := json.Unmarshal(data, &latest); err == nil {
			gm.Entries = latest
		}
	}

	// Prepend to show latest first
	gm.Entries = append([]GuestbookEntry{entry}, gm.Entries...)
	gm.SaveEntries()

	// Reset inputs
	gm.NameInput.SetValue("")
	gm.MsgInput.SetValue("")
}
