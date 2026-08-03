package learning

import (
	"encoding/json"
	"fmt"
	bolt "go.etcd.io/bbolt"
	"strings"
)

func importContentLibrary(database *bolt.DB) error {
	return database.Update(func(tx *bolt.Tx) error {
		words := tx.Bucket([]byte(wordsBucket))
		pronunciations := tx.Bucket([]byte(pronunciationsBucket))
		examples := tx.Bucket([]byte(examplesBucket))
		for level, items := range datasets {
			for _, item := range items {
				wordID := progressKey(level, item.ID)
				senses := []WordSense{}
				if len(item.Senses) > 0 {
					for _, sense := range item.Senses {
						senses = append(senses, WordSense{ID: wordID + ":" + sense.ID, Meaning: sense.Meaning, PartOfSpeech: item.Pos})
					}
				} else {
					senses = append(senses, WordSense{ID: wordID + ":sense:1", Meaning: item.Meaning, PartOfSpeech: item.Pos})
				}
				entry := WordEntry{ID: wordID, Text: item.Word, Meaning: item.Meaning, PartOfSpeech: item.Pos, Letter: item.Letter, Topic: item.Topic, Grade: item.Grade, Unit: item.Unit, Senses: senses}
				if err := putJSON(words, wordID, entry); err != nil {
					return err
				}
				if strings.TrimSpace(item.Phonetic) != "" {
					resource := Pronunciation{ID: wordID + ":pronunciation:default", WordID: wordID, Phonetic: item.Phonetic, Source: "legacy-dataset"}
					if err := putJSON(pronunciations, resource.ID, resource); err != nil {
						return err
					}
				}
				if len(item.Senses) > 0 {
					for i, sense := range item.Senses {
						if strings.TrimSpace(sense.Example) != "" && strings.TrimSpace(sense.ExampleTranslation) != "" {
							resource := ExampleSentence{ID: fmt.Sprintf("%s:example:%d", wordID, i+1), WordID: wordID, SenseID: wordID + ":" + sense.ID, Text: sense.Example, Translation: sense.ExampleTranslation, Source: "project-enrichment"}
							if err := putJSON(examples, resource.ID, resource); err != nil {
								return err
							}
						}
					}
				} else if strings.TrimSpace(item.Example) != "" && strings.TrimSpace(item.ExampleTranslation) != "" {
					resource := ExampleSentence{ID: wordID + ":example:1", WordID: wordID, SenseID: senses[0].ID, Text: item.Example, Translation: item.ExampleTranslation, Source: "project-enrichment"}
					if err := putJSON(examples, resource.ID, resource); err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
}
func putJSON(bucket *bolt.Bucket, key string, value any) error {
	if bucket == nil {
		return fmt.Errorf("content bucket missing for %s", key)
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return bucket.Put([]byte(key), raw)
}

type ContentLibraryStats struct {
	Words          int `json:"words"`
	Pronunciations int `json:"pronunciations"`
	Examples       int `json:"examples"`
	Articles       int `json:"articles"`
}

func contentLibraryStats(database *bolt.DB) (ContentLibraryStats, error) {
	result := ContentLibraryStats{}
	err := database.View(func(tx *bolt.Tx) error {
		counts := []struct {
			name   string
			target *int
		}{{wordsBucket, &result.Words}, {pronunciationsBucket, &result.Pronunciations}, {examplesBucket, &result.Examples}, {articlesBucket, &result.Articles}}
		for _, item := range counts {
			if bucket := tx.Bucket([]byte(item.name)); bucket != nil {
				*item.target = bucket.Stats().KeyN
			}
		}
		return nil
	})
	return result, err
}
