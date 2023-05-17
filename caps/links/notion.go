package links

import (
	"fmt"
	"os"
	"ratatoskr/client"
	"ratatoskr/repos"
	"ratatoskr/types"
	"regexp"
	"strings"
)

type Notion struct {
	admin  string
	notion *client.Notion
}

func NewNotion() *Notion {
	admin := os.Getenv("TELEGRAM_ADMIN")

	notion := client.NewNotion()

	return &Notion{admin, notion}
}

func (c Notion) Check(req *types.RequestMessage) float32 {

	if !getFeatureIsEnabled("notion") {
		return 1
	}
	if req.UserName != c.admin {
		return 1
	}
	if containsLink(req.Message) {
		return 1
	}
	return 0
}

func (c Notion) Execute(req *types.RequestMessage) (types.ResponseMessage, error) {
	r := regexp.MustCompile(`(http|https)://[^\s]+`)
	link := r.FindString(req.Message)

	context := []types.StoredMessage{}

	// Add the user message to the context
	um := repos.NewStoredMessage(
		repos.User,
		req.Message,
	)
	context = append(context, *um)

	// Get the website content in chunks
	chunks, err := client.ExtractBodyFromWebsite(link)
	if err != nil {
		return types.ResponseMessage{}, err
	}

	summary := getSummaryForChunks(chunks)

	sm := repos.NewStoredMessage(
		repos.System,
		fmt.Sprintf(`Website body text: %s`, chunks),
	)
	context = append(context, *sm)

	// Get context

	result, err := c.notion.AddLinkToTodaysPage(link, summary)
	if err != nil {
		return types.ResponseMessage{}, err
	}

	responseText := fmt.Sprintf(`**I have added the following [here](%s) to your journal in Notion:**
	
	%s
	
	%s`, result.URL, summary, link)

	res := types.ResponseMessage{
		ChatID:          req.ChatID,
		Message:         strings.TrimSpace(responseText),
		ShortTermMemory: context,
	}
	return res, nil
}
