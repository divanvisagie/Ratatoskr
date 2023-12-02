import { startBot } from "./telegram"
import { createGatewayLayer } from "./layers/gateway/gateway"
import { Capability } from "./capabilities/capability"
import { createSelector } from "./layers/capabilitySelector/selector"
import { createGptCapability } from "./capabilities/gpt/gpt"
import { createSecurityLayer } from "./layers/security/security"
import { createChatlogLayer } from "./layers/chatlog/chatlog"
import { createMessageRepository } from "./repositories/message"

const token = process.env.TELEGRAM_BOT_TOKEN


const messageRepository = createMessageRepository()

console.log(`using bot token ${token}`)
const capabilities: Capability[] = [
	createGptCapability(messageRepository)
]
const capabilitySelectorLayer = createSelector(capabilities)
const chatlogLayer = createChatlogLayer(capabilitySelectorLayer, messageRepository)
const securityLayer = createSecurityLayer(chatlogLayer)
const gatewayLayer = createGatewayLayer(securityLayer)

if (token) {
	startBot({
		token,
		gatewayLayer	
	})
} else {
	console.error(`Could not start because the telegram bot token is missing`)
}
