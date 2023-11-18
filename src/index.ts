import { startBot } from "./telegram"
import { createGatewayLayer } from "./layers/gateway/gateway"

const token = process.env.TELEGRAM_BOT_TOKEN

console.log(`using bot token ${token}`)
const gatewayLayer = createGatewayLayer()

if (token) {
	startBot({
		token,
		gatewayLayer	
	})
} else {
	console.error(`Could not start because the telegram bot token is missing`)
}
