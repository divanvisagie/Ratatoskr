package links

import (
	client "ratatoskr/client"
	"ratatoskr/repos"
	"ratatoskr/types"
	"strings"
)

type LinkProcessor struct {
	repo *repos.Message
}

func NewLinkProcessor(repo *repos.Message) *LinkProcessor {
	return &LinkProcessor{repo}
}

func (c LinkProcessor) Check(req *types.RequestMessage) float32 {
	if !getFeatureIsEnabled("link") {
		return 0
	}
	if containsLink(req.Message) {
		return 1
	}
	return 0
}

func (c LinkProcessor) Execute(req *types.RequestMessage) (types.ResponseMessage, error) {
	link := extractLinkFromMessage(req.Message)

	chunks, err := client.ExtractBodyFromWebsite(link)
	if err != nil {
		return types.ResponseMessage{}, err
	}

	summary := getSummaryForChunks(chunks)

	res := types.ResponseMessage{
		ChatID:  req.ChatID,
		Message: strings.TrimSpace(summary),
	}
	return res, nil
}
