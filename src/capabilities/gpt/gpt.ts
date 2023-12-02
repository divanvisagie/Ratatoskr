import { LogItem, MessageRepository } from "../../repositories/message";
import { RequestMessage } from "../../types";
import { Capability } from "../capability";
import OpenAI from 'openai'

const systemPrompt = `
	Ratatoskr is an EI (Extended Intelligence) written in Go. 
	An extended intelligence is a software system 
	that utilises multiple Language Models, AI models, 
	NLP Functions and other capabilities to best serve 
	the user.

	As the response Model for Ratatoskr, you answer user questions as if you are the main
	brain of the system. 
	
	If a user asks about how you work or your code, 
	respond with the following link: https://github.com/divanvisagie/Ratatoskr
`;

const openAiToken = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: openAiToken
});

const callGpt = async (messages: LogItem[]): Promise<string> => {
	const params = {
		messages: messages,
		model: 'gpt-4',
	};

	const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params as any);
	return chatCompletion.choices[0].message.content || 'No result';
}


export const createGptCapability = (messageRepository: MessageRepository): Capability => {
	return {
		check: (_message: RequestMessage) => {
			return 0.9;
		},
		process: async (message: RequestMessage) => {
			console.log(`calling gpt with token ${openAiToken}`);

			const existingMessages = await messageRepository.readMessages(message.userId);
			const messages: LogItem[] = [{
				role: 'system',
				content: systemPrompt
			}, ...existingMessages, {
				role: 'user',
				content: message.text
			}];

			console.log('calling with context', messages);

			const ans = await callGpt(messages);
			return {
				text: ans
			};
		}
	};
}

export type GptCapability = ReturnType<typeof createGptCapability>;
