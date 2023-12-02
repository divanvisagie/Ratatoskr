import { RequestMessage } from "../../types"
import { Layer } from "../layer"

const adminId = process.env.TELEGRAM_ADMIN_ID

export const createSecurityLayer = (nextLayer: Layer): Layer => {
	return {
		passThru: async (message: RequestMessage) => {
			console.log('checking security', message.userId, adminId)
			if (message.userId.toString() == adminId) {
				return await nextLayer.passThru(message)
			}
			return {
				text: 'You are not authorized to use this bot'
			}
		}
	}
}

export type SecurityLayer = ReturnType<typeof createSecurityLayer>
