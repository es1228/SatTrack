export const splitIntoLineChunks = (str: string, chunkSize = 3) => {
	const lines = str.split(/\r?\n/);
	const chunks = [];

	for (let i = 0; i < lines.length; i += chunkSize) {
		const chunk = lines.slice(i, i + chunkSize).join("\n");
		chunks.push(chunk);
	}

	return chunks;
};
