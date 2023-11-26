import { RequestMessage, ResponseMessage } from "../types"

export type Capability = {
	check: (message: RequestMessage) => number
	process: (message: RequestMessage) => Promise<ResponseMessage>
}
