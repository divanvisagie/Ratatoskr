import yaml from 'js-yaml';
import { mkdirSync, existsSync } from 'fs';
import { RequestMessage } from "../../types";
import { Layer } from "../layer";

type LogItem = {
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

const createFileWithYAMLContent = async (path: string, data: LogItem) => {
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

export const createChatlogLayer = (next: Layer): Layer => {
    return {
        passThru: async (message: RequestMessage) => {
            const path = `data/chatlog/${message.userId}/${today()}.yaml`;

            console.log(`Chatlog - Request: ${message.text}`);
            await createFileWithYAMLContent(path,
                { role: 'user', content: message.text }
            );

            const response = await next.passThru(message);
            console.log(`Chatlog - Response: ${response.text}`);
            await createFileWithYAMLContent(path,
                { role: 'assistant', content: response.text }
            );

            return response;
        }
    };
}

export type ChatlogLayer = ReturnType<typeof createChatlogLayer>
