import { Capability } from "../../capabilities/capability";
import { RequestMessage, ResponseMessage } from "../../types";
import { Layer } from "../layer";

export const createSelector = (capabilities: Capability[]): Layer => {
	return {
		passThru: async (message: RequestMessage): Promise<ResponseMessage> => {
			let score = 0;
			let bestCapability: Capability | undefined;
			for (const capability of capabilities) {
				const capabilityScore = capability.check(message);
				if (capabilityScore > score) {
					score = capabilityScore;
					bestCapability = capability;
				}
			}
			if (bestCapability) {
				return await bestCapability.process(message);
			}
			return {
				text: `No capability found for message: ${message.text}`
			};
		}
	};
}

export type SelectorLayer = ReturnType<typeof createSelector>;
