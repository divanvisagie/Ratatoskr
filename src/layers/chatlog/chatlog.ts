import { RequestMessage } from "../../types";
import { createFileWithContent } from "../../utils/utils";
import { Layer } from "../layer";


const today = () => {
	const currentDate = new Date();
	const swedishDateString = currentDate.toLocaleDateString('sv-SE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	return swedishDateString.replace(/\//g, '-')
}

export const createChatlogLayer = (nextLayer: Layer): Layer => {
	return {
		passThru: async (message: RequestMessage) => {

			const path = `data/chatlog/${today()}.json`;
			await createFileWithContent(path, message.text)

			console.log(`Chatlog: ${message.text}`);
			return await nextLayer.passThru(message);
		}
	};
}

export type ChatlogLayer = ReturnType<typeof createChatlogLayer>;
