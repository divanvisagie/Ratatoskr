package client

import (
	"fmt"
	"strings"
	"sync"

	"ratatoskr/utils"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
)

// break text into chunks of 500 tokens
func breakText(text string) []string {
	tokens, err := utils.Tokenize(text)
	if err != nil {
		tokens = strings.Fields(text)
	}

	chunks := []string{}
	for i := 0; i < len(tokens); i += 500 {
		end := i + 500
		if end > len(tokens) {
			end = len(tokens)
		}
		chunks = append(chunks, strings.Join(tokens[i:end], ""))
	}
	return chunks
}

func ExtractBodyFromWebsite(url string) ([]string, error) {
	// Sync code since this is intended to be a single user system
	wg := new(sync.WaitGroup)
	wg.Add(1)

	c := colly.NewCollector()

	bodyText := "None"
	c.OnHTML("body", func(e *colly.HTMLElement) {

		// Remove script tags
		e.DOM.Find("script").Each(func(i int, s *goquery.Selection) {
			s.Remove()
		})

		bodyText = e.Text
		e.DOM.Find("main").Each(func(i int, s *goquery.Selection) {
			fmt.Println(s.Text())
			bodyText = s.Text()
		})

		fmt.Println(bodyText)
		wg.Done()
	})
	c.OnError(func(r *colly.Response, err error) {
		fmt.Println("Request URL:", r.Request.URL, "failed with response:", r, "\nError:", err)
		wg.Done()
	})
	c.Visit(url)

	wg.Wait()

	return breakText(bodyText), nil
}
