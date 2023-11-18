import { RequestMessage, ResponseMessage } from "../../types";
import { Layer } from "../layer";

export const createGatewayLayer = (): Layer => {
	return {
		passThru: (message: RequestMessage): ResponseMessage => {
			return {
				text: `Response from gateway layer`
			};
		}
	};
}

export type GatewayLayer = ReturnType<typeof createGatewayLayer>;
