import protobuf from 'protobufjs/light.js';
import { createCanvas, createImageData } from 'canvas';

import TerrainMap from './TerrainMap.js';
import TextMap from './TextMap.js';
import { currentMapConfig, MapConfig } from './MapConfig.js';
import { WorkerThreadPool } from '../workerManager.js';

const TERRAIN_MAPS = {
	terrain: {
		dataType: 'short',
		channels: 1,
	},
	height: {
		dataType: 'short',
		channels: 1,
	},
	water: {
		dataType: 'short',
		channels: 1,
	},
	splat: {
		dataType: 'byte',
		channels: 8,
	},
	topology: {
		dataType: 'int',
		channels: 1,
	},
	biome: {
		dataType: 'byte',
		channels: 4,
	},
	alpha: {
		dataType: 'byte',
		channels: 1,
	},
};

const Message = protobuf.Message,
	Type = protobuf.Type,
	Field = protobuf.Field;

/**
 * @extends {Message<VectorData_C>}
 */
export class VectorData_C extends Message {
	/** @type {number} */
	x;
	/** @type {number} */
	y;
	/** @type {number} */
	z;
}

/**
 * @extends {Message<PathData_C>}
 */
export class PathData_C extends Message {
	/** @type {string} */
	name;
	/** @type {boolean} */
	spline;
	/** @type {boolean} */
	start;
	/** @type {boolean} */
	end;
	/** @type {number} */
	width;
	/** @type {number} */
	innerPadding;
	/** @type {number} */
	outerPadding;
	/** @type {number} */
	innerFade;
	/** @type {number} */
	outerFade;
	/** @type {number} */
	randomScale;
	/** @type {number} */
	meshOffset;
	/** @type {number} */
	terrainOffset;
	/** @type {number} */
	splat;
	/** @type {number} */
	topology;
	/** @type {VectorData_C[]} */
	nodes;
}

/**
 * @extends {Message<PrefabData_C>}
 */
export class PrefabData_C extends Message {
	/** @type {string} */
	category;
	/** @type {number} */
	id;
	/** @type {VectorData_C} */
	position;
	/** @type {VectorData_C} */
	rotation;
	/** @type {VectorData_C} */
	scale;
}

/**
 * @extends {Message<MapData_C>}
 */
export class MapData_C extends Message {
	/** @type {string} */
	name;
	/** @type {Uint8Array} */
	data;
}

const VectorData = new Type('VectorData').add(new Field('x', 1, 'float')).add(new Field('y', 2, 'float')).add(new Field('z', 3, 'float'));

const PathData = new Type('PathData')
	.add(new Field('name', 1, 'string', 'optional'))
	.add(new Field('spline', 2, 'bool', 'optional'))
	.add(new Field('start', 3, 'bool', 'optional'))
	.add(new Field('end', 4, 'bool', 'optional'))
	.add(new Field('width', 5, 'float', 'optional'))
	.add(new Field('innerPadding', 6, 'float', 'optional'))
	.add(new Field('outerPadding', 7, 'float', 'optional'))
	.add(new Field('innerFade', 8, 'float', 'optional'))
	.add(new Field('outerFade', 9, 'float', 'optional'))
	.add(new Field('randomScale', 10, 'float', 'optional'))
	.add(new Field('meshOffset', 11, 'float', 'optional'))
	.add(new Field('terrainOffset', 12, 'float', 'optional'))
	.add(new Field('splat', 13, 'int32', 'optional'))
	.add(new Field('topology', 14, 'int32', 'optional'))
	.add(new Field('nodes', 15, 'VectorData', 'repeated'));

const PrefabData = new Type('PrefabData')
	.add(new Field('category', 1, 'string'))
	.add(new Field('id', 2, 'uint32'))
	.add(new Field('position', 3, 'VectorData'))
	.add(new Field('rotation', 4, 'VectorData'))
	.add(new Field('scale', 5, 'VectorData'));

const MapData = new Type('MapData').add(new Field('name', 1, 'string')).add(new Field('data', 2, 'bytes'));

export const WorldData_pb = new Type('WorldData')
	.add(VectorData)
	.add(MapData)
	.add(PathData)
	.add(PrefabData)
	.add(new Field('size', 1, 'uint32'))
	.add(new Field('maps', 2, 'MapData', 'repeated'))
	.add(new Field('prefabs', 3, 'PrefabData', 'repeated'))
	.add(new Field('paths', 4, 'PathData', 'repeated'));

/**
 *
 * @category WorldData
 * @hideconstructor
 */
export class WorldData {
	/** @type {number} */
	size;
	/** @type {MapData_C[]} */
	maps;
	/** @type {PrefabData_C[]} */
	prefabs;
	/** @type {PathData_C[]} */
	paths;

	/**
	 * @param {number} size
	 */
	constructor(size) {
		this.size = size;
		this.maps = [];
		this.prefabs = [];
		this.paths = [];
	}

	/**
	 *
	 * @param {Uint8Array | protobuf.Reader} reader
	 * @param {number | undefined} [length]
	 */
	static decode = (reader, length) => {
		try {
			/** @type {*} */
			const decoded = WorldData_pb.decode(reader, length);
			const newClass = new WorldData(0);
			newClass.size = decoded.size;
			newClass.maps = decoded.maps;
			newClass.prefabs = decoded.prefabs;
			newClass.paths = decoded.paths;
			return newClass;
		} catch (error) {
			throw 'Error when decoding map';
		}
	};

	/**
	 *
	 * @param {protobuf.Message<{}> | {[k: string]: any;}} message
	 * @param {protobuf.Writer | undefined} [writer]
	 * @returns
	 */
	static encode = (message, writer) => {
		/** @type {*} */
		return WorldData_pb.encode(message, writer);
	};

	/**
	 *
	 * @param {string} mapName
	 * @param {TerrainMap | TextMap} map
	 */
	addMap(mapName, map) {
		let newMap = new MapData_C();
		newMap.name = mapName;
		newMap.data = map.getDst();

		this.maps.push(newMap);
	}

	/**
	 *
	 * @param {string} mapName
	 * @param {TerrainMap | TextMap} map
	 */
	setMap(mapName, map) {
		let findMap = this.maps.find((x) => x.name == mapName);
		if (findMap != undefined) {
			findMap.data = map.getDst();
		} else {
			this.addMap(mapName, map);
		}
	}

	/**
	 *
	 * @param {string | number} map
	 * @param {number | undefined} channels
	 * @param {"byte" | "short" | "int" | undefined} dataType
	 * @returns {TerrainMap | undefined}
	 */
	getMapAsTerrain(map, channels = undefined, dataType = undefined) {
		if (this.maps == undefined) {
			return undefined;
		}

		/** @type {MapData_C | undefined} */
		let mapData;
		/** @type {TerrainMap | undefined} */
		let terrainMap;

		if (typeof map == 'number') {
			mapData = this.maps[map];
		} else if (typeof map == 'string') {
			mapData = this.maps.find((x) => x.name == map);
		}

		if (mapData == undefined) return undefined;

		if (channels != undefined && dataType != undefined) {
			terrainMap = new TerrainMap(mapData.data, channels, dataType, this.size);
		} else {
			if (map in TERRAIN_MAPS) {
				let mapInfo = TERRAIN_MAPS[map];
				terrainMap = new TerrainMap(mapData.data, mapInfo.channels, mapInfo.dataType, this.size);
			}
		}

		return terrainMap;
	}

	/**
	 *
	 * @param {string} map
	 * @param {number} [res]
	 * @returns
	 */
	createEmptyTerrainMap(map, res) {
		if (res == undefined) {
			if (['terrain', 'height', 'water'].includes(map)) {
				if (this.size < 3072) {
					res = 2049;
				} else {
					res = 4097;
				}
			} else {
				//all other maps
				if (this.size <= 2048) {
					res = 1024;
				} else {
					res = 2048;
				}
			}
		}

		let mapInfo = TERRAIN_MAPS[map];
		if (mapInfo != undefined) {
			let size = res * res * mapInfo.channels;
			if (mapInfo.dataType == 'short') {
				size *= 2;
			} else if (mapInfo.dataType == 'int') {
				size *= 4;
			}

			return new TerrainMap(new Uint8Array(new ArrayBuffer(size)), mapInfo.channels, mapInfo.dataType, this.size);
		}
	}

	/**
	 *
	 * @param {string | number} map
	 * @returns
	 */
	getMapAsText(map) {
		if (this.maps == undefined) {
			return undefined;
		}

		/** @type {MapData_C | undefined} */
		let mapData;

		if (typeof map == 'number') {
			mapData = this.maps[map];
		} else if (typeof map == 'string') {
			mapData = this.maps.find((x) => x.name == map);
		}

		if (mapData != undefined) {
			return new TextMap(mapData.data);
		}
	}

	/**
	 * When options are fullImg it will return a string of the full img, if its chunkF32 you get a array of F32 Array buffers
	 * @param {MapConfig | undefined} config color config
	 * @param {{height?: TerrainMap, biom?: TerrainMap, splat?: TerrainMap}} terrainMaps
	 * @param {{output: 'fullImg' | 'chunkF32', chunkFix: number, chunkSize: number, worker: string | boolean}} [options] default is fullImg
	 */
	async createImage(config, terrainMaps, options) {
		if (!config) config = currentMapConfig;
		if (!options) options = { output: 'fullImg', chunkFix: 0, chunkSize: 512, worker: false }; //set default or maybe throw err?

		let heightMap = terrainMaps.height ? terrainMaps.height : this.getMapAsTerrain('height');
		let splatMap = terrainMaps.splat ? terrainMaps.splat : this.getMapAsTerrain('splat');
		// let biomeMap = terrainMaps.biom ? terrainMaps.biom : this.getMapAsTerrain('biome');

		if (!heightMap || !splatMap) return;

		/** @type {Array<Uint8Array | Uint16Array | Uint32Array>} */
		let heightMapBuffer = [];
		/** @type {Array<Uint8Array | Uint16Array | Uint32Array>} */
		let splatMapBuffer = [];

		//check if SharedArrayBuffer is available
		const SharedArrayBufferAvailable = typeof SharedArrayBuffer !== 'undefined';

		heightMapBuffer.push(heightMap.getData(0, SharedArrayBufferAvailable));

		for (let i = 0; i < splatMap.channels; i++) {
			splatMapBuffer.push(splatMap.getData(i, SharedArrayBufferAvailable));
		}

		const heightMapObj = {
			type: heightMap.type,
			res: heightMap.res,
			channels: heightMap.channels,
			worldSize: heightMap.worldSize,
			data: heightMapBuffer,
		};

		const splatMapObj = {
			type: splatMap.type,
			res: splatMap.res,
			channels: splatMap.channels,
			worldSize: splatMap.worldSize,
			data: splatMapBuffer,
		};

		const img_size = this.size;
		const chunk_size = options.chunkSize;
		const chunks_per_row = Math.ceil(img_size / chunk_size);
		const chunk_amount = chunks_per_row * chunks_per_row;

		const thread_pool = new WorkerThreadPool(
			6,
			typeof options.worker == 'string' ? options.worker : new URL('./ImageWorker.js', import.meta.url)
		);
		let finished_workers = 0;

		let canvas;
		let ctx;

		if (options.output == 'fullImg') {
			canvas = createCanvas(this.size, this.size);
			ctx = canvas.getContext('2d');
		}

		/** @type {Float32Array[]} */
		let finalChunks = [];

		await new Promise((resolve) => {
			//at the start of the function is somehow not enough otherwise error on chunk end calc
			if (!options) options = { output: 'fullImg', chunkFix: 0, chunkSize: 512 };

			for (let i = 0; i < chunk_amount; i++) {
				const x_chunk_offset = Math.floor(i / chunks_per_row);
				const y_chunk_offset = i % chunks_per_row;

				// get the start of the chunk from map size perspective
				const x_chunk_start = x_chunk_offset * chunk_size;
				const y_chunk_start = y_chunk_offset * chunk_size;

				// get the end of the chunk from img size perspective
				// important chunks can be not fully so we need to look if it exceeds the img_size
				const x_chunk_end = x_chunk_start + chunk_size > img_size ? img_size : x_chunk_start + chunk_size + options.chunkFix;
				const y_chunk_end = y_chunk_start + chunk_size > img_size ? img_size : y_chunk_start + chunk_size + options.chunkFix;

				const x_chunk_size = x_chunk_end - x_chunk_start;
				const y_chunk_size = y_chunk_end - y_chunk_start;

				thread_pool.enqueue(
					{
						heightMapObj,
						splatMapObj,
						config,
						chunkInfo: {
							offset: {
								x: x_chunk_offset,
								y: y_chunk_offset,
							},
							start: {
								x: x_chunk_start,
								y: y_chunk_start,
							},
							end: {
								x: x_chunk_end,
								y: y_chunk_end,
							},
							size: {
								x: x_chunk_size,
								y: y_chunk_size,
							},
						},
						useFloatColors: options.output == 'chunkF32' ? true : false,
					},
					(/** @type {Uint8ClampedArray | Float32Array} */ data) => {
						if (options?.output == 'chunkF32') {
							finalChunks[i] = /** @type {Float32Array} */ (data);
						} else {
							//default is full img
							const x_chunk_start = x_chunk_offset * chunk_size;
							const y_chunk_start = y_chunk_offset * chunk_size;
							ctx.putImageData(
								createImageData(/** @type {Uint8ClampedArray} */ (data), y_chunk_size, x_chunk_size),
								y_chunk_start,
								x_chunk_start
							);
						}
						finished_workers++;
						if (!thread_pool.Busy && finished_workers == chunk_amount) {
							resolve(true);
						}
					}
				);
			}
		});

		thread_pool.terminate();

		if (options.output == 'chunkF32') {
			return finalChunks;
		} else if (options.output == 'fullImg') {
			// @ts-ignore since it has been set when its fullImg
			const image = canvas.toDataURL();
			return image;
		}
		return;
	}

	/**
	 *
	 * @param {Float32Array[]} chunks
	 * @param {number} chunkSize
	 * @param {number} [chunkFix]
	 */
	async assembleImage(chunks, chunkSize, chunkFix) {
		if (!chunkFix) chunkFix = 0;
		const startTimer = new Date().getTime();

		const imgSize = this.size;

		const canvas = createCanvas(imgSize, imgSize);
		const ctx = canvas.getContext('2d');

		const chunk_size = chunkSize;
		const chunks_per_row = Math.ceil(imgSize / chunk_size);

		for (let i = 0; i < chunks.length; i++) {
			const x_chunk_offset = Math.floor(i / chunks_per_row);
			const y_chunk_offset = i % chunks_per_row;

			const x_chunk_start = x_chunk_offset * chunk_size;
			const y_chunk_start = y_chunk_offset * chunk_size;

			// get the end of the chunk from img size perspective
			// important chunks can be not fully so we need to look if it exceeds the img_size
			const x_chunk_end = x_chunk_start + chunk_size > imgSize ? imgSize : x_chunk_start + chunk_size + chunkFix;
			const y_chunk_end = y_chunk_start + chunk_size > imgSize ? imgSize : y_chunk_start + chunk_size + chunkFix;

			const x_chunk_size = x_chunk_end - x_chunk_start;
			const y_chunk_size = y_chunk_end - y_chunk_start;

			const convertedChunkData = new Uint8ClampedArray(
				new ArrayBuffer(Uint8ClampedArray.BYTES_PER_ELEMENT * (x_chunk_size * y_chunk_size * 4))
			);
			let convertedChunkIndex = 0;

			for (let j = 0; j < chunks[i].length; j = j + 3) {
				convertedChunkData[convertedChunkIndex++] = chunks[i][j] * 255;
				convertedChunkData[convertedChunkIndex++] = chunks[i][j + 1] * 255;
				convertedChunkData[convertedChunkIndex++] = chunks[i][j + 2] * 255;
				convertedChunkData[convertedChunkIndex++] = 255;
			}

			const imgData = createImageData(convertedChunkData, y_chunk_size, x_chunk_size);
			ctx.putImageData(imgData, y_chunk_start, x_chunk_start);
		}
		const image = canvas.toDataURL();
		return image;
	}
}
