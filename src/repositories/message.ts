import yaml from 'js-yaml';
import { mkdirSync, existsSync } from 'fs';
import { Layer } from "../layers/layer";
import { RequestMessage, ResponseMessage } from "../types";

export type LogItem = {
    role: string;
    content: string;
}

const today = () => {
    const currentDate = new Date();
    const swedishDateString = currentDate.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return swedishDateString.replace(/\//g, '-');
}


const writeMessageToStore = async (path: string, data: LogItem) => {
    try {
        const directory = path.substring(0, path.lastIndexOf('/'));

        // Ensure the directory exists
        if (!existsSync(directory)) {
            console.log('creating directory', path);
            mkdirSync(directory, { recursive: true });
        } else {
            console.log('this directory already existed', path);
        }

        let existingData: LogItem[] = []

        const handle = Bun.file(path);
        // Append to file if already exists
        if (existsSync(path)) {
            console.log('appending to file', path);
            // read existing content
            const existingContent = await handle.text();
            // parse existing content
            existingData = yaml.load(existingContent) as LogItem[];
            console.log('existing data is now', existingData);
        }
        existingData.push(data);

        // Serialize data to YAML and write to file
        const yamlContent = yaml.dump(existingData);
        await Bun.write(path, yamlContent);
    } catch (error) {
        console.error(error);
    }
}

export const createMessageRepository = () => {
	return {
		writeRequestMessage: async (message: RequestMessage) => {
			const path = `data/chatlog/${message.userId}/${today()}.yaml`;
			await writeMessageToStore(path, { role: 'user', content: message.text });	
		}, 
		writeResponseMessage: async (userId: number, message: ResponseMessage) => {
			const path = `data/chatlog/${userId}/${today()}.yaml`;
			await writeMessageToStore(path, { role: 'assistant', content: message.text });
		},
		readMessages: async (userId: number): Promise<LogItem[]> => {
			const path = `data/chatlog/${userId}/${today()}.yaml`;
			const handle = Bun.file(path);
			if (!existsSync(path)) {
				return [];
			}
			const existingContent = await handle.text();
			console.log('existing content is', existingContent);
			return yaml.load(existingContent) as LogItem[];
		}
	}
}

export type MessageRepository = ReturnType<typeof createMessageRepository>;
