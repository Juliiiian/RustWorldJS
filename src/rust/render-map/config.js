/**
 * Used Vector3 from unity and modified it
 * https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs
 */
class Color {
	/** @type {number} */
	r;
	/** @type {number} */
	g;
	/** @type {number} */
	b;
	/** @type {number} */
	a;

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} [a]
	 */
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;

		// when alpha value is defined
		if (a) {
			this.a = a;
		} else {
			//set to one for no alpha val
			this.a = 1;
		}
	}

	/**
	 * @param {Color} color
	 * @returns {number}
	 */
	static Magnitude(color) {
		return Math.sqrt(color.r * color.r + color.g * color.g + color.b * color.b);
	}

	/**
	 * set the vector to zero
	 */
	setZero() {
		this.r = 0;
		this.g = 0;
		this.b = 0;
	}

	/**
	 * @param {number} divider
	 */
	Divide(divider) {
		this.r = this.r / divider;
		this.g = this.g / divider;
		this.b = this.b / divider;
	}

	/**
	 * @param {Color} color
	 * @returns
	 */
	static Normalize(color) {
		/** @type {number} */
		let mag = Color.Magnitude(color);
		if (mag > Number.EPSILON) {
			color.Divide(mag);
		} else {
			color.setZero();
		}
		return color;
	}

	/**
	 * @returns
	 */
	Normalize() {
		/** @type {number} */
		let mag = Color.Magnitude(this);
		if (mag > Number.EPSILON) {
			this.Divide(mag);
		} else {
			this.setZero();
		}
	}
}

/**
 * @typedef {Object} MapConfigObj
 * @property {Color} StartColor
 * @property {Color} WaterColor
 * @property {Color} GravelColor
 * @property {Color} DirtColor
 * @property {Color} SandColor
 * @property {Color} GrassColor
 * @property {Color} ForestColor
 * @property {Color} RockColor
 * @property {Color} SnowColor
 * @property {Color} PebbleColor
 * @property {Color} OffShoreColor
 * @property {Color} SunDirection
 * @property {Color} Half
 * @property {Color} [WaterOffset]
 * @property {number} SunPower
 * @property {number} Brightness
 * @property {number} Contrast
 * @property {number} OceanWaterLevel
 */

export class MapConfig {
	/** @type {MapConfigObj} */
	MapConfigObj;

	/** @type {MapConfigObj} */
	constructor(config) {
		this.MapConfigObj = config;
	}
}

export const oldMapConfig = new MapConfig({
	StartColor: new Color(0.324313372, 0.397058845, 0.195609868),
	WaterColor: new Color(0.269668937, 0.4205476, 0.5660378, 1),
	GravelColor: new Color(0.139705867, 0.132621378, 0.114024632, 0.372),
	DirtColor: new Color(0.322227329, 0.375, 0.228860289, 1),
	SandColor: new Color(1, 0.8250507, 0.448529422, 1),
	GrassColor: new Color(0.4509804, 0.5529412, 0.270588249, 1),
	ForestColor: new Color(0.5529412, 0.440000027, 0.270588249, 1),
	RockColor: new Color(0.42344287, 0.4852941, 0.314013839, 1),
	SnowColor: new Color(0.8088235, 0.8088235, 0.8088235, 1),
	PebbleColor: new Color(0.121568628, 0.419607848, 0.627451, 1),
	OffShoreColor: new Color(0.166295841, 0.259337664, 0.3490566, 1),
	SunDirection: Color.Normalize(new Color(0.95, 2.87, 2.37)),
	Half: new Color(0.5, 0.5, 0.5),
	SunPower: 0.5,
	Brightness: 1,
	Contrast: 0.87,
	OceanWaterLevel: 0,
});

export const currentMapConfig = new MapConfig({
	StartColor: new Color(0.286274523, 0.270588249, 0.247058839),
	WaterColor: new Color(0.16941601, 0.317557573, 0.362000018, 1),
	GravelColor: new Color(0.25, 0.243421048, 0.220394745, 1),
	DirtColor: new Color(0.6, 0.479594618, 0.33, 1),
	SandColor: new Color(0.7, 0.65968585, 0.5277487, 1),
	GrassColor: new Color(0.354863644, 0.37, 0.2035, 1),
	ForestColor: new Color(0.248437509, 0.3, 0.0703125, 1),
	RockColor: new Color(0.4, 0.393798441, 0.375193775, 1),
	SnowColor: new Color(0.862745166, 0.9294118, 0.941176534, 1),
	PebbleColor: new Color(0.137254909, 0.2784314, 0.2761563, 1),
	OffShoreColor: new Color(0.04090196, 0.220600322, 0.274509817, 1),
	SunDirection: Color.Normalize(new Color(0.95, 2.87, 2.37)),
	Half: new Color(0.5, 0.5, 0.5),
	SunPower: 0.65,
	Brightness: 1.05,
	Contrast: 0.94,
	OceanWaterLevel: 0.0,
});
