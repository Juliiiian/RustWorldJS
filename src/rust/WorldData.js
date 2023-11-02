import protobuf from 'protobufjs/light.js';
import { createCanvas } from 'canvas';

import TerrainMap from './TerrainMap.js';
import TextMap from './TextMap.js';
import { Vector, currentMapConfig, MapConfig } from './render-map/config.js';

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
		/** @type {*} */
		const decoded = WorldData_pb.decode(reader, length);
		const newClass = new WorldData(0);
		newClass.size = decoded.size;
		newClass.maps = decoded.maps;
		newClass.prefabs = decoded.prefabs;
		newClass.paths = decoded.paths;
		return newClass;
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
	 *
	 * @param {MapConfig} [config]
	 */
	async createImage(config) {
		if (!config) config = currentMapConfig;

		const canvas = createCanvas(this.size, this.size);
		const ctx = canvas.getContext('2d');

		let heightMap = this.getMapAsTerrain('height');
		let biomeMap = this.getMapAsTerrain('biome');
		let splatMap = this.getMapAsTerrain('splat');

		if (!heightMap || !biomeMap || !splatMap) return;

		const setImageData = (image, i, r, g, b, a) => {
			image.data[i + 0] = r;
			image.data[i + 1] = g;
			image.data[i + 2] = b;
			image.data[i + 3] = a * 255;
		};

		let imageData = ctx.createImageData(this.size, this.size);

		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				let i = (x * this.size + y) * 4;

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

				setImageData(imageData, i, pixel.x * 255, pixel.y * 255, pixel.z * 255, pixel.m);
			}
		}

		ctx.putImageData(imageData, 0, 0);
		return canvas.toDataURL();
	}
}
