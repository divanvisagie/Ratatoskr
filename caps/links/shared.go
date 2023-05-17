package links

import (
	client "ratatoskr/client"
	"regexp"
	"strings"
)

func getFeatureIsEnabled(feature string) bool {
	feaureMap := map[string]bool{
		"notion":  false,
		"link":    true,
		"chatGpt": true,
	}
	return feaureMap[feature]
}

func getSummaryForChunk(chunk string) string {
	systemPrompt := strings.TrimSpace(`Ratatoskr, is an EI (Extended Intelligence). 
	An extended intelligence is a software system 
	that utilises multiple Language Models, AI models, 
	NLP Functions and other capabilities to best serve 
	the user.

	You are part of the link processing module, whose job it is to take a
	link and return a summary of the content that will provide good keywords
	when searching for it since the link and the summary may be stored in
	Notion for the user. You will be provided with a chunk of text that has been extracted from the body of the
	webpage and you will need to summarise it. The body is extracted directly from the html body of the website by the system

	Use the body returned by the system and your existing knowledge of the site where possible 
	to provide the best summary. Tell the user what the link is 
	about and what can be learned from it. Remember to highlight any stand 
	out points that may contain unexpected conclusions or information.`)

	summary := client.NewOpenAIClient().AddSystemMessage(systemPrompt).AddUserMessage(chunk).Complete()
	return summary
}

func containsLink(message string) bool {
	//check if message contains a link
	r := regexp.MustCompile(`(http|https)://`)
	return r.MatchString(message)
}

func getSummaryForChunks(chunks []string) string {
	summary := ""
	for _, chunk := range chunks {
		chunkSummary := getSummaryForChunk(chunk)

		summary += chunkSummary
	}
	return summary
}

func extractLinkFromMessage(message string) string {
	r := regexp.MustCompile(`(http|https)://[^\s]+`)
	link := r.FindString(message)
	return link
}
