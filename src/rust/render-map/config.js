/**
 * Used Vector3 from unity and modified it
 * https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs
 */
export class Vector {
	/** @type {number} */
	x;
	/** @type {number} */
	y;
	/** @type {number} */
	z;
	/** @type {number} */
	m;

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} [a]
	 */
	constructor(r, g, b, a) {
		this.x = r;
		this.y = g;
		this.z = b;

		// when alpha value is defined
		if (a) {
			this.m = a;
		} else {
			//set to one for no alpha val
			this.m = 1;
		}
	}

	/**
	 * @param {Vector} vector
	 */
	static log(vector) {
		console.log(`Vector: ${vector.x}, ${vector.y}, ${vector.z}, ${vector.m}`);
	}

	/**
	 * @param {Vector} start
	 * @param {Vector} end
	 * @param {number} t
	 * @returns {Vector}
	 */
	static Lerp(start, end, t) {
		//clamping between 0 - 1
		t = Math.max(0, Math.min(t, 1));
		return new Vector(
			start.x + (end.x - start.x) * t, // r
			start.y + (end.y - start.y) * t, // g
			start.z + (end.z - start.z) * t // b
		);
	}

	/**
	 * @param {Vector} vector
	 * @returns {number}
	 */
	static Magnitude(vector) {
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
	}

	/**
	 * @param {Vector} lhs
	 * @param {Vector} rhs
	 * @returns {number}
	 */
	static Dot(lhs, rhs) {
		return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
	}

	/**
	 * @param {Vector} lhs
	 * @param {Vector} rhs
	 * @returns {Vector}
	 */
	static Cross(lhs, rhs) {
		return new Vector(
			lhs.y * rhs.z - lhs.z * rhs.y, //
			lhs.z * rhs.x - lhs.x * rhs.z, //
			lhs.x * rhs.y - lhs.y * rhs.x
		);
	}

	/**
	 * set the vector to zero
	 */
	setZero() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}

	/**
	 *
	 * @param {Vector} lhs
	 * @param {Vector} rhs
	 */
	static Addition(lhs, rhs) {
		return new Vector(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
	}

	/**
	 *
	 * @param {Vector} lhs
	 * @param {Vector} rhs
	 */
	static Substraction(lhs, rhs) {
		return new Vector(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
	}

	/**
	 * @param {Vector} vector
	 * @param {number} d
	 */
	static Multiply(vector, d) {
		return new Vector(vector.x * d, vector.y * d, vector.z * d);
	}

	/**
	 * @param {Vector} vector
	 * @param {number} divider
	 */
	static Divide(vector, divider) {
		return new Vector(vector.x / divider, vector.y / divider, vector.z / divider);
	}

	/**
	 * @param {Vector} vector
	 * @returns
	 */
	static Normalize(vector) {
		/** @type {number} */
		let mag = Vector.Magnitude(vector);
		if (mag > Number.EPSILON) {
			vector = Vector.Divide(vector, mag);
		} else {
			vector.setZero();
		}
		return vector;
	}
}

/**
 * @typedef {Object} MapConfigType
 * @property {Vector} StartColor
 * @property {Vector} WaterColor
 * @property {Vector} GravelColor
 * @property {Vector} DirtColor
 * @property {Vector} SandColor
 * @property {Vector} GrassColor
 * @property {Vector} ForestColor
 * @property {Vector} RockColor
 * @property {Vector} SnowColor
 * @property {Vector} PebbleColor
 * @property {Vector} OffShoreColor
 * @property {Vector} SunDirection
 * @property {Vector} Half
 * @property {number} SunPower
 * @property {number} Brightness
 * @property {number} Contrast
 * @property {number} OceanWaterLevel
 * @property {number} [WaterOffset]
 */

export class MapConfig {
	/** @type {Vector} */
	StartColor;
	/** @type {Vector} */
	WaterColor;
	/** @type {Vector} */
	GravelColor;
	/** @type {Vector} */
	DirtColor;
	/** @type {Vector} */
	SandColor;
	/** @type {Vector} */
	GrassColor;
	/** @type {Vector} */
	ForestColor;
	/** @type {Vector} */
	RockColor;
	/** @type {Vector} */
	SnowColor;
	/** @type {Vector} */
	PebbleColor;
	/** @type {Vector} */
	OffShoreColor;
	/** @type {Vector} */
	SunDirection;
	/** @type {Vector} */
	Half;
	/** @type {number} */
	SunPower;
	/** @type {number} */
	Brightness;
	/** @type {number} */
	Contrast;
	/** @type {number} */
	OceanWaterLevel;
	/** @type {number} */
	WaterOffset;

	/**
	 * @param {MapConfigType} config
	 */
	constructor(config) {
		this.StartColor = config.StartColor instanceof Vector ? config.StartColor : currentMapConfig.StartColor;
		this.WaterColor = config.WaterColor instanceof Vector ? config.WaterColor : currentMapConfig.WaterColor;
		this.GravelColor = config.GravelColor instanceof Vector ? config.GravelColor : currentMapConfig.GravelColor;
		this.DirtColor = config.DirtColor instanceof Vector ? config.DirtColor : currentMapConfig.DirtColor;
		this.SandColor = config.SandColor instanceof Vector ? config.SandColor : currentMapConfig.SandColor;
		this.GrassColor = config.GrassColor instanceof Vector ? config.GrassColor : currentMapConfig.GrassColor;
		this.ForestColor = config.ForestColor instanceof Vector ? config.ForestColor : currentMapConfig.ForestColor;
		this.RockColor = config.RockColor instanceof Vector ? config.RockColor : currentMapConfig.RockColor;
		this.SnowColor = config.SnowColor instanceof Vector ? config.SnowColor : currentMapConfig.SnowColor;
		this.PebbleColor = config.PebbleColor instanceof Vector ? config.PebbleColor : currentMapConfig.PebbleColor;
		this.OffShoreColor = config.OffShoreColor instanceof Vector ? config.OffShoreColor : currentMapConfig.OffShoreColor;
		this.SunDirection = config.SunDirection instanceof Vector ? config.SunDirection : currentMapConfig.SunDirection;
		this.Half = config.Half instanceof Vector ? config.Half : currentMapConfig.Half;

		this.SunPower = typeof config.SunPower === 'number' ? config.SunPower : currentMapConfig.SunPower;
		this.Brightness = typeof config.Brightness === 'number' ? config.Brightness : currentMapConfig.Brightness;
		this.Contrast = typeof config.Contrast === 'number' ? config.Contrast : currentMapConfig.Contrast;
		this.OceanWaterLevel = typeof config.OceanWaterLevel === 'number' ? config.OceanWaterLevel : currentMapConfig.OceanWaterLevel;
		this.WaterOffset = typeof config.WaterOffset === 'number' ? config.WaterOffset : 0;

		this.SunPower /= 2; //to less sun
	}
}

export const oldMapConfig = new MapConfig({
	StartColor: new Vector(0.324313372, 0.397058845, 0.195609868),
	WaterColor: new Vector(0.269668937, 0.4205476, 0.5660378, 1),
	GravelColor: new Vector(0.139705867, 0.132621378, 0.114024632, 0.372),
	DirtColor: new Vector(0.322227329, 0.375, 0.228860289, 1),
	SandColor: new Vector(1, 0.8250507, 0.448529422, 1),
	GrassColor: new Vector(0.4509804, 0.5529412, 0.270588249, 1),
	ForestColor: new Vector(0.5529412, 0.440000027, 0.270588249, 1),
	RockColor: new Vector(0.42344287, 0.4852941, 0.314013839, 1),
	SnowColor: new Vector(0.8088235, 0.8088235, 0.8088235, 1),
	PebbleColor: new Vector(0.121568628, 0.419607848, 0.627451, 1),
	OffShoreColor: new Vector(0.166295841, 0.259337664, 0.3490566, 1),
	SunDirection: Vector.Normalize(new Vector(0.95, 2.87, 2.37)),
	Half: new Vector(0.5, 0.5, 0.5),
	SunPower: 0.5,
	Brightness: 1,
	Contrast: 0.87,
	OceanWaterLevel: 16390,
	WaterOffset: 0,
});

export const currentMapConfig = new MapConfig({
	StartColor: new Vector(0.286274523, 0.270588249, 0.247058839),
	WaterColor: new Vector(0.16941601, 0.317557573, 0.362000018, 1),
	GravelColor: new Vector(0.25, 0.243421048, 0.220394745, 1),
	DirtColor: new Vector(0.6, 0.479594618, 0.33, 1),
	SandColor: new Vector(0.7, 0.65968585, 0.5277487, 1),
	GrassColor: new Vector(0.354863644, 0.37, 0.2035, 1),
	ForestColor: new Vector(0.248437509, 0.3, 0.0703125, 1),
	RockColor: new Vector(0.4, 0.393798441, 0.375193775, 1),
	SnowColor: new Vector(0.862745166, 0.9294118, 0.941176534, 1),
	PebbleColor: new Vector(0.137254909, 0.2784314, 0.2761563, 1),
	OffShoreColor: new Vector(0.04090196, 0.220600322, 0.274509817, 1),
	SunDirection: Vector.Normalize(new Vector(0.95, 2.87, 2.37)),
	Half: new Vector(0.5, 0.5, 0.5),
	SunPower: 0.65,
	Brightness: 1.05,
	Contrast: 0.94,
	OceanWaterLevel: 16390,
	WaterOffset: 0,
});
