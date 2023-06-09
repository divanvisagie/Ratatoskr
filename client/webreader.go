package client

import (
	"fmt"
	"strings"
	"sync"

	"ratatoskr/utils"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
)

// Shorten text to a specific amount of tokens
func shorten(text string, limit int) string {
	words, err := utils.Tokenize(text)
	if err != nil {
		words = strings.Fields(text)
	}

	if len(words) > limit {
		// Split the input string into words using the Fields function from the strings package

		// Return the length of the resulting slice
		cut := words[:limit]
		return strings.Join(cut, "")
	}

	return strings.Join(words, " ")
}

func trimText(text string, limit int) string {
	trimmed := strings.TrimSpace(text)
	trimmed = shorten(trimmed, limit)

	return trimmed
}
func ExtractBodyFromWebsite(url string) (string, error) {
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

	return trimText(bodyText, 500), nil
}
