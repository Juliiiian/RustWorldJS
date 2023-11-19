import assert from 'assert';
import * as fs from 'fs/promises';
import generateCirclePlots from './examples/generate-circle-plots.js';
import generateIceWalls from './examples/ice-walls.js';
import getTerrainInfo from './examples/get-terrainmap-info.js';
import getMapSize from './examples/get-map-size.js';
import generateImage from './examples/generate-image.js';

describe('Examples', function () {
	this.timeout(180000);

	before(async function () {
		try {
			await fs.access('./test/examples/test-maps');
		} catch (error) {
			await fs.mkdir('./test/examples/test-maps');
		}
	});

	it('Get terrain info', async function () {
		assert.equal(await getTerrainInfo(), true);
	});

	it('Get map size', async function () {
		assert.equal(await getMapSize(), true);
	});

	it('Generate Image', async function () {
		assert.equal(await generateImage(), true);
	});

	it('Generating circle plots', async function () {
		assert.equal(await generateCirclePlots(), true);
	});

	it('Generating ice walls', async function () {
		assert.equal(await generateIceWalls(), true);
	});
});
