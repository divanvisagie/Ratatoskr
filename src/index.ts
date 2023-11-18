import { startBot } from "./telegram"
import { createGatewayLayer } from "./layers/gateway/gateway"
import { Capability } from "./capabilities/capability"
import { createSelector } from "./layers/capabilitySelector/selector"
import { createGptCapability } from "./capabilities/gpt/gpt"

const token = process.env.TELEGRAM_BOT_TOKEN

console.log(`using bot token ${token}`)
const capabilities: Capability[] = [
	createGptCapability()
]
const capabilitySelectorLayer = createSelector(capabilities)
const gatewayLayer = createGatewayLayer(capabilitySelectorLayer)

if (token) {
	startBot({
		token,
		gatewayLayer	
	})
} else {
	console.error(`Could not start because the telegram bot token is missing`)
}
