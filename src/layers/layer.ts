import { RequestMessage, ResponseMessage } from "../types"

export type Layer = {
	passThru: (message: RequestMessage) => ResponseMessage 
}
