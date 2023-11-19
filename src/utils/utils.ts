import fs from 'fs';


export const createFileWithContent = async (path: string, content: string) => {
	const target = Bun.file(path);
	await Bun.write(target, content)
}

