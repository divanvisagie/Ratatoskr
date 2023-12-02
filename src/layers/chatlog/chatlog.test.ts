import { describe, it, expect, beforeAll } from "bun:test"
import { unlink } from "node:fs/promises";
import { createChatlogLayer } from "./chatlog"
import { join } from "node:path";

const mockLayer = {
	passThru: async (message: any) => {
		return {
			text: "Mock response message" 
		}
	}
}

const today = () => {
	const currentDate = new Date();
	const swedishDateString = currentDate.toLocaleDateString('sv-SE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	return swedishDateString.replace(/\//g, '-')
}

const getDirectory = () => {
	const path = `data/chatlog/${today()}.json`;
	const directory = join(process.cwd(), path);
	return directory
}

describe("chatlog layer", () => {
	const layer = createChatlogLayer(mockLayer);

	beforeAll(async () => {
		try {
			const path = getDirectory();
			await unlink(path);
		} catch (e) {
			console.log(e);
		}
	})

	it("should create a data file for today if it does not exist", async () => {
		const path = getDirectory()

		const preHandle = Bun.file(path);
		expect(await preHandle.exists()).toBe(false);

		const response = await layer.passThru({ text: "Hello" });

		expect(response.text).toBe("Hello");

		const postHandle = Bun.file(path);
		const fileExistsAfterPassThru = await postHandle.exists();
		expect(fileExistsAfterPassThru).toBe(true);
	})

	it("should write request and response message to file", async () => {
		const _response = await layer.passThru({ text: "Hello" });

	
		const path = getDirectory();
		const postHandle = Bun.file(path);
		const fileExistsAfterPassThru = await postHandle.exists();
		expect(fileExistsAfterPassThru).toBe(true);
	})
})

