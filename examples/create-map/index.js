import * as fs from 'fs';
import * as rustWorld from '../../src/index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

fs.readFile(__dirname + '/../../test/test.map', async function (err, fileContents) {
	let world = rustWorld.readMap(fileContents);

	const start = new Date().getTime();

	const image = await world.createImage();

	console.log(`Image creation time: ${(new Date().getTime() - start) / 1000} seconds`);

	if (!image) throw 'image';

	const buffer = Buffer.from(image.split(',')[1], 'base64');
	fs.writeFileSync(__dirname + '/image.png', buffer);
	console.log('Done with saving');
});
