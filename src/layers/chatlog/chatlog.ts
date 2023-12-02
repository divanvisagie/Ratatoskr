import yaml from 'js-yaml';
import { mkdirSync, existsSync } from 'fs';
import { RequestMessage } from "../../types";
import { Layer } from "../layer";
import { MessageRepository } from '../../repositories/message';

export const createChatlogLayer = (next: Layer, messageRepository: MessageRepository): Layer => {
    return {
        passThru: async (message: RequestMessage) => {

            const response = await next.passThru(message);

            await messageRepository.writeRequestMessage(message);
            await messageRepository.writeResponseMessage(message.userId, response);

            return response;
        }
    };
}

export type ChatlogLayer = ReturnType<typeof createChatlogLayer>
