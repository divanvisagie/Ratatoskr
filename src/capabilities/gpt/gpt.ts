import { RequestMessage } from "../../types";
import { Capability } from "../capability";

export const createGptCapability = (): Capability => {
	return {
		check: (message: RequestMessage) => {
			if (message.text.startsWith("gpt")) {
				return 1;
			}
			return 0;
		},
		process: (message: RequestMessage) => {
			return {
				text: `gpt: ${message.text}`
			};
		}
	};
}

export type GptCapability = ReturnType<typeof createGptCapability>;
