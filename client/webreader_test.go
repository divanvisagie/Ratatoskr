package client

import (
	"testing"
)

type TestPair struct {
	url    string
	chunks int
}

func TestExtractBodyFromWebsite(t *testing.T) {
	pairs := []TestPair{
		{url: "https://github.com/ThePrimeagen/aoc/blob/2022/src/bin/day6_2.rs", chunks: 13},
		{url: "https://github.com/dstotijn/go-notion", chunks: 5},
	}

	for _, pair := range pairs {
		chunks, err := ExtractBodyFromWebsite(pair.url)
		if err != nil {
			t.Errorf("Error while extracting body from website: %s", err)
		}

		if len(chunks) != pair.chunks {
			t.Errorf("Expected %d chunks for %s, got %d", pair.chunks, pair.url, len(chunks))
		}
	}
}
