import { RequestMessage, ResponseMessage } from "../../types";
import { Layer } from "../layer";

export const createGatewayLayer = (nextLayer: Layer): Layer => {
	return {
		passThru: (message: RequestMessage): ResponseMessage => {
			return nextLayer.passThru(message);
		}
	};
}

export type GatewayLayer = ReturnType<typeof createGatewayLayer>;
