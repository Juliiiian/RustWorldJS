/** @typedef {import('./TerrainMap.js').default} TerrainMap_type */
/** @typedef {import('./MapConfig.js').Vector} Vector_type */
/** @typedef {import('./MapConfig.js').MapConfig} MapConfig_type */

/**
 * @typedef chunk_type
 * @property {{ x: number; y: number; }} offset
 * @property {{ x: number; y: number; }} start
 * @property {{ x: number; y: number; }} end
 * @property {{ x: number; y: number; }} size
 */

/** @type {Vector_type} */
let Vector;
/** @type {MapConfig_type} */
let MapConfig;
/** @type {TerrainMap_type} */
let TerrainMap;

let importPromise = [
	import('./TerrainMap.js').then((x) => {
		//@ts-ignore
		TerrainMap = x.default;
	}),
	import('./MapConfig.js').then((x) => {
		//@ts-ignore
		Vector = x.Vector;
		//@ts-ignore
		MapConfig = x.MapConfig;
	}),
];

/**
 *
 * @param {any} msg
 */
self.onmessage = (msg) => {
	Promise.all(importPromise).then(() => {
		const { heightMap, splatMap, config, chunkInfo } = msg.data;
		Object.setPrototypeOf(heightMap, TerrainMap.prototype);
		Object.setPrototypeOf(splatMap, TerrainMap.prototype);

		const chunk = render_chunk(heightMap, splatMap, config, chunkInfo);

		self.postMessage(chunk, /** @type {any} */ (undefined), [chunk.buffer]);
	});
};

/**
 *
 * @param {TerrainMap_type} heightMap
 * @param {TerrainMap_type} splatMap
 * @param {MapConfig} config
 * @param {chunk_type} chunkInfo
 * @returns
 */
const render_chunk = (heightMap, splatMap, config, chunkInfo) => {
	const imgData = new Uint8ClampedArray(new ArrayBuffer(Uint8ClampedArray.BYTES_PER_ELEMENT * (chunkInfo.size.x * chunkInfo.size.y * 4)));
	let imgDataPos = 0;

	for (let y = chunkInfo.start.y; y < chunkInfo.end.y; y++) {
		for (let x = chunkInfo.start.x; x < chunkInfo.end.x; x++) {
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
