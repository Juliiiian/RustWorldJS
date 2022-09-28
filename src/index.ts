import LZ4Reader from './LZ4Reader';
import { WorldData } from './rust/WorldData';
import TerrainMap from './rust/TerrainMap';
import LZ4Writer from './LZ4Writer';

export { TerrainMap };

export function readMap(bytes: ArrayBuffer) {
    let rawBytes = new Uint8Array(bytes).slice(4, bytes.byteLength);

    let stream = new LZ4Reader(rawBytes);
    return WorldData.decode(stream.getOutput());
}

export function writeMap(bytes: WorldData) {
    let encoded = WorldData.encode(bytes).finish();
    let writer = new LZ4Writer(encoded);
    return writer.getOutput();
}

(async () => {
    let buffer = await (await fetch("./SancMapNoPrefabs.map")).arrayBuffer();
    let decoded = readMap(buffer);
    console.log(decoded);

    let splatData = decoded.maps.find(x => x.name == "splat");
    let splatMap = new TerrainMap(splatData.data, 8, "byte");
    let center = splatMap.res / 2; //x and y are same since maps are always square

    //floodFill(splatMap, center - 100, center + 100, center - 100, center + 100, 0, 1);
    floodFill(splatMap, center - 100, center + 100, center - 100, center + 500, 255, 2);
    fillCircle(splatMap, center, 420, 255, 1);

    drawMap(decoded);
    /*
        writeMap(decoded).then(x => {
            console.log(x);
        });
        */
    //downloadBlob(writer.currentOutput, "testMap.map", "application/octet-stream");
})();

function downloadBlob(data: Uint8Array, fileName: string, mimeType: string) {
    let blob, url: any;
    blob = new Blob([data], {
        type: mimeType
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function () {
        return window.URL.revokeObjectURL(url);
    }, 1000);
};

function downloadURL(data: any, fileName: string) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    //a.style = 'display: none';
    a.click();
    a.remove();
};


function convertToImageData(ctx: any, data: any, res: number, color = [150, 150, 150], transparent = true) {
    let imageData = ctx?.createImageData(res, res) as ImageData;
    for (let i = 0; i < data.length; i++) {
        imageData.data[(i * 4)] = color[0] //* (1 / 255);
        imageData.data[(i * 4) + 1] = color[1] //* (1 / 255);
        imageData.data[(i * 4) + 2] = color[2] //* (1 / 255);
        if (transparent) {
            imageData.data[(i * 4) + 3] = data[i];
        } else {
            imageData.data[(i * 4) + 3] = 255;
        }
    }
    return imageData;
}

function floodFill(splatMap: TerrainMap, startX: number, endX: number, startY: number, endY: number, value: number, channel: number = 0) {
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            splatMap.set(value, x, y, channel);
        }
    }
}

function fillCircle(splatMap: TerrainMap, center: number, radius: number, value: number, channel: number = 0) {
    for (let x = 0; x < splatMap.res; x++) {
        for (let y = 0; y < splatMap.res; y++) {
            if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) > radius) {
                splatMap.set(value, x, y, channel);
            }
        }
    }
}

async function drawMap(decoded: WorldData) {
    let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');
    if (ctx == undefined) {
        console.error("CTX null");
        return;
    }

    canvas.width = decoded.size;
    canvas.height = decoded.size;

    let terrainData = decoded.maps.find(x => x.name == "terrain");
    let heightData = decoded.maps.find(x => x.name == "terrain");
    let splatData = decoded.maps.find(x => x.name == "splat");
    let biomeData = decoded.maps.find(x => x.name == "biome");
    let waterData = decoded.maps.find(x => x.name == "water");
    if (terrainData == undefined || splatData == undefined || biomeData == undefined || waterData == undefined || heightData == undefined) {
        console.error("Missing map data");
        return;
    }

    let terrainMap = new TerrainMap(terrainData.data, 1, "short");
    let heightMap = new TerrainMap(heightData.data, 1, "short");
    let splatMap = new TerrainMap(splatData.data, 8, "byte");
    let biomeMap = new TerrainMap(biomeData.data, 4, "byte");
    let waterMap = new TerrainMap(waterData.data, 1, "short");

    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#12404d";
    ctx.fill();

    let currentMap = splatMap;
    let currentData = currentMap.getChannel(7); //gravel
    let imageData;

    currentMap = splatMap;
    let splatTypes = [
        [115, 118, 83], //dirt
        [255, 250, 250], //snow
        [194, 178, 128], //sand
        [90, 77, 65], //rock
        [126, 200, 80], //grass
        [132, 192, 17], //forest
        [136, 140, 141], //stones
        [75, 58, 43], //gravel
    ];

    for (let i = 7; i >= 0; i--) {
        currentData = currentMap.getChannel(i);
        imageData = await createImageBitmap(convertToImageData(ctx, currentData, currentMap.res, splatTypes[i]));
        ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);
    }

    let filteredTerrain = heightMap.dst.map(x => x *= 1 / 255).map(x => {
        if (x > 60 && x <= 63) {
            return 235 - (25 * (x - 60));
        }
        if (x > 63) {
            return 0;
        }

        return 255;
    });
    imageData = await createImageBitmap(convertToImageData(ctx, filteredTerrain, heightMap.res, [18, 64, 77], true));
    ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "#ff0000";
    let count: { [key: string]: number } = {};
}