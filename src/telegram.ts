import TelegramBot from 'node-telegram-bot-api'
import { Layer } from './layers/layer'
import { RequestMessage } from './types'

export type BotParams = {
	token: string
	gatewayLayer: Layer
}

export const startBot = ({ token, gatewayLayer }: BotParams) => {
	const bot = new TelegramBot(token, { polling: true });

	// Matches "/echo [whatever]"
	bot.onText(/\/echo (.+)/, (msg, match) => {
		// 'msg' is the received Message from Telegram
		// 'match' is the result of executing the regexp above on the text content
		// of the message

		const chatId = msg.chat.id;
		const resp = match ? match[1] : 'nothing to capture' // the captured "whatever"

		// send back the matched "whatever" to the chat
		bot.sendMessage(chatId, resp);
	});

	// Listen for any kind of message. There are different kinds of
	// messages.
	bot.on('message', async (msg) => {
		const chatId = msg.chat.id;

		console.log('From user', msg.from?.username, msg.from?.id)

		if (msg.from) {
			const message: RequestMessage = {
				userId: msg.from.id,
				text: msg.text?.toString() || ''
			}

			const response = await gatewayLayer.passThru(message)

			// send a message to the chat acknowledging receipt of their message
			bot.sendMessage(chatId, response.text);
		}
	});

}
