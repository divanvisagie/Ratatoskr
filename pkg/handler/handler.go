package handler

import (
	"fmt"
	caps "ratatoskr/pkg/capabilities"
	"ratatoskr/pkg/layers"
	"ratatoskr/pkg/repos"
	"ratatoskr/pkg/types"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type Handler struct {
	bot          *tgbotapi.BotAPI
	gatewayLayer layers.Layer
}

func NewHandler(bot *tgbotapi.BotAPI) *Handler {
	memRepo := repos.NewMessageRepository()

	caps := []types.Capability{
		caps.NewMemoryDump(memRepo),
		caps.NewMemoryWipe(memRepo),
		caps.NewChatGPT(),
	}

	//build up the layers
	capabilityLayer := layers.NewCapabilitySelector(caps)
	memoryLayer := layers.NewMemoryLayer(memRepo, capabilityLayer)
	securityLayer := layers.NewSecurity(memoryLayer)

	return &Handler{bot: bot, gatewayLayer: securityLayer}
}

func (h *Handler) HandleTelegramMessages(update tgbotapi.Update) {

	if update.Message != nil {
		// check if a photo was sent with the message and retreive it
		// if update.Message.Photo != nil {
		// 	photo := update.Message.Photo
		// 	photoID := photo[0].FileID
		// 	photoFile, err := h.bot.GetFile(tgbotapi.FileConfig{FileID: photoID})
		// 	if err != nil {
		// 		log.Println(err)
		// 	}
		// 	fmt.Printf("Photo file: %+v\n", photoFile)
		// 	// photoBytes, err := h.bot.GetFileDirectURL(photoFile.FilePath)
		// 	// if err != nil {
		// 	// 	log.Println(err)
		// 	// }
		//
		// }

		if update.Message.Text == "/menu" {
			options := []string{
				"Clear memory",
				"Memory dump",
			}
			sendFullMenu(h.bot, update.Message.Chat.ID, options)
			return
		}

		//simulate typing
		typingMsg := tgbotapi.NewChatAction(update.Message.Chat.ID, tgbotapi.ChatTyping)
		h.bot.Send(typingMsg)

		//pass through the gateway layer
		req := &types.RequestMessage{
			ChatID:   update.Message.Chat.ID,
			Message:  update.Message.Text,
			UserName: update.Message.From.UserName,
		}

		fmt.Printf("Passing through gateway\n")
		res, err := h.gatewayLayer.PassThrough(req)
		if err != nil {
			fmt.Println(err)
			msg := tgbotapi.NewMessage(res.ChatID, "Error while processing message")
			msg.ReplyToMessageID = update.Message.MessageID

			h.bot.Send(msg)
		}
		fmt.Printf("Returning from gateway\n")

		if res.Bytes != nil {
			now := time.Now()
			timestamp := now.UnixMilli()
			key := fmt.Sprintf("%d", timestamp)
			csvFile := tgbotapi.FileBytes{Name: key + ".csv", Bytes: res.Bytes}
			msg := tgbotapi.NewDocument(res.ChatID, csvFile)
			h.bot.Send(msg)
			//TODO
		} else {
			// Respond to the user
			msg := tgbotapi.NewMessage(res.ChatID, res.Message)
			msg.ParseMode = "markdown"
			h.bot.Send(msg)
		}
	}
}

// Function to send custom keyboard with menu options
func sendFullMenu(bot *tgbotapi.BotAPI, chatID int64, options []string) {
	msg := tgbotapi.NewMessage(chatID, "Select an option:")

	msg.ReplyMarkup = tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("Clear memory"),
			tgbotapi.NewKeyboardButton("Memory dump"),
		),
	)
	bot.Send(msg)
}
