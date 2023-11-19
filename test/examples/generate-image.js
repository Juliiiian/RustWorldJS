import * as fs from 'fs/promises';
import * as rustWorld from '../../src/index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export default async function generateImage() {
	try {
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const fileContents = await fs.readFile('./test/test.map');

		const world = rustWorld.readMap(fileContents);

		const heightMap = world.getMapAsTerrain('height');
		const splatMap = world.getMapAsTerrain('splat');

		//normal img
		// const image = /** @type {string} */ (
		// 	await world.createImage(undefined, { height: heightMap, splat: splatMap }, { output: 'fullImg', chunkFix: 0, chunkSize: 512 })
		// );
		// if (!image) throw 'image';
		// const buffer = Buffer.from(image.split(',')[1], 'base64');
		// await fs.writeFile(__dirname + '/test-maps/image.png', buffer);

		//img from F32 Chunks
		const imageChunks = await world.createImage(
			undefined,
			{ height: heightMap, splat: splatMap },
			{ output: 'chunkF32', chunkFix: 1, chunkSize: 512 }
		);

		// @ts-ignore
		const image2 = await world.assembleImage(imageChunks, 512, 1);
		const buffer2 = Buffer.from(image2.split(',')[1], 'base64');
		await fs.writeFile(__dirname + '/test-maps/imagefromchunks.png', buffer2);

		console.log('Done with saving');
		return true;
	} catch (err) {
		throw err;
	}
}
