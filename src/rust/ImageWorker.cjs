/**
 * @typedef {Object} terrainMapMsg
 * @property {("int" | "short" | "byte")} type - The type of the data ("int", "short", or "byte").
 * @property {number} res - The resolution of the data.
 * @property {number} channels - The number of channels.
 * @property {number} worldSize - The size of the world.
 * @property {Array<Uint8Array | Uint16Array | Uint32Array>} data - An array of typed arrays (Uint8Array, Uint16Array, Uint32Array).
 */

/**
 * @typedef {Object} msgType
 * @property {terrainMapMsg} heightMapObj
 * @property {terrainMapMsg} splatMapObj
 * @property {any} config
 * @property {any} chunkInfo
 */

/** @type {typeof import('./TerrainMap').default} */
let TerrainMap;
/** @type {typeof import('./MapConfig').Vector} */
let Vector;
let importPromise = [
	import('./TerrainMap.js').then((module) => {
		TerrainMap = module.default;
	}),
	import('./MapConfig.js').then((module) => {
		Vector = module.Vector;
	}),
];

/** @param {any} msg */
self.onmessage = (msg) => {
	Promise.all(importPromise).then(() => {
		/** @type {msgType} */
		const { heightMapObj, splatMapObj, config, chunkInfo } = msg.data;
		const heightMap = new TerrainMap(heightMapObj.data, heightMapObj.channels, heightMapObj.type, heightMapObj.worldSize);
		const splatMap = new TerrainMap(splatMapObj.data, splatMapObj.channels, splatMapObj.type, splatMapObj.worldSize);

		const chunk = render_chunk(heightMap, splatMap, config, chunkInfo);

		self.postMessage(chunk, /** @type {any} */ (undefined), [chunk.buffer]);
	});
};

/**
 * @typedef chunk_type
 * @property {{ x: number; y: number; }} offset
 * @property {{ x: number; y: number; }} start
 * @property {{ x: number; y: number; }} end
 * @property {{ x: number; y: number; }} size
 */

/**
 *
 * @param {import('./TerrainMap').default} heightMap
 * @param {import('./TerrainMap').default} splatMap
 * @param {import('./MapConfig').MapConfig} config
 * @param {chunk_type} chunkInfo
 * @returns
 */
const render_chunk = (heightMap, splatMap, config, chunkInfo) => {
	const imgData = new Uint8ClampedArray(new ArrayBuffer(Uint8ClampedArray.BYTES_PER_ELEMENT * (chunkInfo.size.x * chunkInfo.size.y * 4)));
	let imgDataPos = 0;

	for (let x = chunkInfo.start.x; x < chunkInfo.end.x; x++) {
		for (let y = chunkInfo.start.y; y < chunkInfo.end.y; y++) {
			let terrainHeight = heightMap.get(x, y);
			let sun = Math.max(Vector.Dot(heightMap.getNormal(x, y), config.SunDirection), 0);

			let pixel = Vector.Lerp(config.StartColor, config.GravelColor, splatMap.getNormalized(x, y, 7) * config.GravelColor.m);
			pixel = Vector.Lerp(pixel, config.PebbleColor, splatMap.getNormalized(x, y, 6) * config.PebbleColor.m);
			pixel = Vector.Lerp(pixel, config.RockColor, splatMap.getNormalized(x, y, 3) * config.RockColor.m);
			pixel = Vector.Lerp(pixel, config.DirtColor, splatMap.getNormalized(x, y, 0) * config.DirtColor.m);
			pixel = Vector.Lerp(pixel, config.GrassColor, splatMap.getNormalized(x, y, 4) * config.GrassColor.m);
			pixel = Vector.Lerp(pixel, config.ForestColor, splatMap.getNormalized(x, y, 5) * config.ForestColor.m);
			pixel = Vector.Lerp(pixel, config.SandColor, splatMap.getNormalized(x, y, 2) * config.SandColor.m);
			pixel = Vector.Lerp(pixel, config.SnowColor, splatMap.getNormalized(x, y, 1) * config.SnowColor.m);

			if (terrainHeight < config.OceanWaterLevel) {
				let waterDepth = config.OceanWaterLevel - terrainHeight;
				pixel = Vector.Lerp(pixel, config.WaterColor, Math.max(0, Math.min(0.5 + waterDepth / 5.0, 1)));
				pixel = Vector.Lerp(pixel, config.OffShoreColor, Math.max(0, Math.min(waterDepth / 50, 1)));
				sun = config.SunPower;
			}

			//sun
			pixel = Vector.Addition(pixel, Vector.Multiply(pixel, (sun - config.SunPower) * config.SunPower));

			//contrast ig?
			pixel = Vector.Addition(Vector.Multiply(Vector.Substraction(pixel, config.Half), config.Contrast), config.Half);
			//Brightness
			pixel = Vector.Multiply(pixel, config.Brightness);

			imgData[imgDataPos++] = pixel.x * 255;
			imgData[imgDataPos++] = pixel.y * 255;
			imgData[imgDataPos++] = pixel.z * 255;
			imgData[imgDataPos++] = pixel.m * 255;
		}
	}
	return imgData;
};
