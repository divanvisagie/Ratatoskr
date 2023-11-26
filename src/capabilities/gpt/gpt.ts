import { RequestMessage } from "../../types";
import { Capability } from "../capability";
import OpenAI from 'openai'
import { ClientOptions } from 'openai'

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

const openAiToken = process.env.OPENAI_TOKEN;

const openai = new OpenAI({
	apiKey: openAiToken
});

const callGpt = async (prompt: string): Promise<string> => {
	const messages = [{
		role: 'system',
		content: systemPrompt
	}, {
		role: 'user',
		content: prompt
	}
	]
	const params: OpenAI.Chat.ChatCompletionCreateParams = {
		messages: [{ role: 'user', content: 'Say this is a test' }],
		model: 'gpt-3.5-turbo',
	}; 

	const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
	return chatCompletion.choices[0].message.content || 'No result' ;
}


export const createGptCapability = (): Capability => {
	return {
		check: (_message: RequestMessage) => {
			return 0.9;
		},
		process: (message: RequestMessage) => {
			console.log(`calling gpt with token ${openAiToken}`);
			return {
				text: `gpt: ${message.text}`
			};
		}
	};
}

export type GptCapability = ReturnType<typeof createGptCapability>;
