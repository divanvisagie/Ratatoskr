import { RequestMessage, ResponseMessage } from "../../types";
import { Layer } from "../layer";

export const createGatewayLayer = (nextLayer: Layer): Layer => {
	return {
		passThru: async (message: RequestMessage): Promise<ResponseMessage> => {
			return await nextLayer.passThru(message);
		}
	};
}

export type GatewayLayer = ReturnType<typeof createGatewayLayer>;
