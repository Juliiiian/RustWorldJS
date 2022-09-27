let lz4 = require("lz4js");
import { BLOCK_SIZE } from "./LZ4Helper";
import { ChunkFlags } from "./LZ4Helper";
import { memcpy } from "./LZ4Helper";

export default class LZ4Stream {
    bytes: Uint8Array;
    dataview: DataView;
    _bufferOffset: number;
    _buffer: Uint8Array;
    _bufferLength: number;
    currentOutput: number[];
    streamPosition: number;
    ended: boolean;
    finalOutput: Uint8Array;
    finalChunks: Array<number>[];

    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
        this.dataview = new DataView(bytes.buffer);
        this._bufferOffset = 0;
        this._buffer = new Uint8Array(new ArrayBuffer(0));
        this._bufferLength = 0;
        this.streamPosition = 0;
        this.currentOutput = new Array(0);
        this.finalChunks = new Array(0);
        this.ended = false;

        while (!this.ended) {
            this.AquireNextChunk();
            this.finalChunks.push(this.currentOutput.slice(0, this._bufferLength));
        }

        let size = this.finalChunks.map(x => x.length).reduce((lastVal, currVal) => lastVal + currVal, 0);
        this.finalOutput = new Uint8Array(new ArrayBuffer(size));

        this.finalChunks.forEach((chunk, index) => {
            this.finalOutput.set(chunk, index * BLOCK_SIZE);
        });

        //this.downloadBlob(this.finalOutput,"binary", "application/octet-stream")

    }

    downloadBlob (data:Uint8Array, fileName:string, mimeType:string) {
        var blob, url:string;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        this.downloadURL(url, fileName);
        setTimeout(function () {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    };

    downloadURL (data:string, fileName:string) {
        var a;
        a = document.createElement('a');
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    getOutput() {
        return this.finalOutput;
    }

    ReadByte() {

    }

    AquireNextChunk() {
        if (this.ended) {
            return false;
        }
        do {
            let varint = this.TryReadVarInt();
            if (varint == undefined) return false;
            let flags = varint as ChunkFlags;
            let isCompressed = (flags & ChunkFlags.Compressed) != 0;
            //console.log(this.streamPosition, varint);

            let originalLength = this.ReadVarInt();
            //console.log(this.streamPosition, originalLength);
            let compressedLength = isCompressed ? this.ReadVarInt() : originalLength;
            //console.log(this.streamPosition, compressedLength, isCompressed);
            if (compressedLength > originalLength) throw "EndOfStream"; // corrupted

            let compressed = new Uint8Array(new ArrayBuffer(compressedLength));
            let chunk = this.ReadBlock(compressed, 0, compressedLength);

            if (chunk != compressedLength) throw "EndOfStream"; // corrupted

            if (!isCompressed) {
                this._buffer = compressed; // no compression on this chunk
                this._bufferLength = compressedLength;
            } else {
                if (this._buffer == null || this._buffer.length < originalLength) {
                    this._buffer = new Uint8Array(new ArrayBuffer(originalLength));
                }
                var passes = flags >> 2;
                if (passes != 0) {
                    throw 'NotSupportedException("Chunks with multiple passes are not supported.")';
                }

                lz4.decompressBlock(compressed, this.currentOutput, 0, compressed.length, 0);
                this._bufferLength = originalLength;
            }

            if (originalLength < BLOCK_SIZE) {
                this.ended = true;
                return;
            }

            this._bufferOffset = 0;
        } while (this._bufferLength == 0);

        return true;
    }


    TryReadVarInt() {
        let buffer;
        let count = 0;
        let result = 0;

        while (true) {
            buffer = this.dataview.getUint8(this.streamPosition)
            this.streamPosition++;

            if (buffer == 0) {
                if (count == 0) return undefined;
                console.error("throw exception?")
            }
            let b = buffer;
            result = result + ((b & 0x7F) << count);
            count += 7;
            if ((b & 0x80) == 0 || count >= 64) break;
        }

        return result;
    }

    ReadVarInt() {
        let result = this.TryReadVarInt();
        if (result == undefined) {
            throw "Exception";
        } else {
            return result;
        }
    }

    ReadBlock(buffer: Uint8Array, offset: number, length: number) {
        var total = 0;

        while (length > 0) {
            let read = this.InnerStreamRead(buffer, offset, length);
            if (read == 0) break;
            offset += read;
            length -= read;
            total += read;
        }

        return total;
    }

    InnerStreamRead(output: Uint8Array, offset: number, length: number) {
        output = memcpy(this.streamPosition, offset, length, this.bytes, output);
        this.streamPosition += length;
        return length;
    }

}