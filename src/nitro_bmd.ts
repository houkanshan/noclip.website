
/// <reference path="nitro_gx.ts" />
/// <reference path="nitro_tex.ts" />

// Workaround for not having gl-matrix typings available.
interface Window {
    mat4: any;
}

namespace NITRO_BMD {

    // Super Mario 64 DS .bmd format

    function readString(buffer:ArrayBuffer, offs:number, length:number):string {
        var buf = new Uint8Array(buffer, offs, length);
        var S = '';
        for (var i = 0; i < length; i++) {
            if (buf[i] === 0)
                break;
            S += String.fromCharCode(buf[i]);
        }
        return S;
    }

    class Poly {
        packets: NITRO_GX.Packet[];
    }

    class Batch {
        material: any;
        poly: any;
    };

    class Model {
        id: number;
        name: string;
        parentID: number;
        batches: Batch[];
    };

    function parseModel(bmd:BMD, view:DataView, idx:number) {
        const offs = bmd.modelOffsBase + idx * 0x40;

        const model = new Model();
        model.id = view.getUint32(offs + 0x00, true);
        model.name = readString(view.buffer, view.getUint32(offs + 0x04, true), 0xFF);
        model.parentID = view.getUint16(offs + 0x08, true);

        // Local transform.
        const xs = view.getUint32(offs + 0x10, true);
        const ys = view.getUint32(offs + 0x14, true);
        const zs = view.getUint32(offs + 0x18, true);
        const xr = view.getUint16(offs + 0x1C, true);
        const yr = view.getUint16(offs + 0x1E, true);
        const zr = view.getUint16(offs + 0x20, true);
        const xt = view.getUint16(offs + 0x24, true);
        const yt = view.getUint16(offs + 0x28, true);
        const zt = view.getUint16(offs + 0x2C, true);

        // A "batch" is a combination of a material and a poly.
        const batchCount = view.getUint32(offs + 0x30, true);
        const batchMaterialOffs = view.getUint32(offs + 0x34, true);
        const batchPolyOffs = view.getUint32(offs + 0x38, true);

        model.batches = [];

        for (let i = 0; i < batchCount; i++) {
            const materialIdx = view.getUint8(batchMaterialOffs + i);
            const material = parseMaterial(bmd, view, materialIdx);
            const baseCtx = { color: material.diffuse, alpha: material.alpha };

            const polyIdx = view.getUint8(batchPolyOffs + i);
            const poly = parsePoly(bmd, view, polyIdx, baseCtx);

            model.batches.push({ material: material, poly: poly });
        }

        return model;
    }

    function parsePoly(bmd:BMD, view:DataView, idx:number, baseCtx:NITRO_GX.Context) {
        const offs = view.getUint32((bmd.polyOffsBase + idx * 0x08) + 0x04, true);

        const gxCmdSize = view.getUint32(offs + 0x08, true);
        const gxCmdOffs = view.getUint32(offs + 0x0C, true);

        const gxCmdBuf = view.buffer.slice(gxCmdOffs, gxCmdOffs + gxCmdSize);

        const poly:Poly = { packets: NITRO_GX.readCmds(gxCmdBuf, baseCtx) };
        return poly;
    }

    function parseMaterial(bmd:BMD, view:DataView, idx:number) {
        const offs = bmd.materialOffsBase + idx * 0x30;

        const material:any = {};
        material.name = readString(view.buffer, view.getUint32(offs + 0x00, true), 0xFF);
        material.texCoordMat = window.mat4.create();

        const textureIdx = view.getUint32(offs + 0x04, true);
        if (textureIdx !== 0xFFFFFFFF) {
            const paletteIdx = view.getUint32(offs + 0x08, true);
            material.texture = parseTexture(bmd, view, textureIdx, paletteIdx);
            material.texParams = material.texture.params | view.getUint32(offs + 0x20, true);

            if (material.texParams >> 30) {
                const scaleS = view.getInt32(offs + 0x0C, true) / 4096.0;
                const scaleT = view.getInt32(offs + 0x10, true) / 4096.0;
                const transS = view.getInt32(offs + 0x18, true) / 4096.0;
                const transT = view.getInt32(offs + 0x1C, true) / 4096.0;
                window.mat4.translate(material.texCoordMat, material.texCoordMat, [transS, transT, 0.0]);
                window.mat4.scale(material.texCoordMat, material.texCoordMat, [scaleS, scaleT, 1.0]);
            }
            window.mat4.scale(material.texCoordMat, material.texCoordMat, [1/material.texture.width, 1/material.texture.height, 1]);
        } else {
            material.texture = null;
            material.texParams = 0;
        }

        const polyAttribs = view.getUint32(offs + 0x24, true);
        let alpha = (polyAttribs >> 16) & 0x1F;
        alpha = (alpha << (8-5)) | (alpha >>> (10-8));  

        // NITRO's Rendering Engine uses two passes. Opaque, then Transparent.
        // A transparent polygon is one that has an alpha of < 0xFF, or uses
        // A5I3 / A3I5 textures.

        material.isTranslucent = (alpha < 0xFF) || (material.texture && material.texture.isTranslucent);

        // Do transparent polys write to the depth buffer?
        const xl = (polyAttribs >>> 1) & 0x01;
        if (xl)
            material.depthWrite = true;
        else
            material.depthWrite = !material.isTranslucent;

        const difAmb = view.getUint32(offs + 0x28, true);
        if (difAmb & 0x8000)
            material.diffuse = NITRO_GX.rgb5(difAmb & 0x07FF);
        else
            material.diffuse = [0xFF, 0xFF, 0xFF];

        material.alpha = alpha;

        return material;
    }

    function textureToCanvas(texture:Texture) {
        const canvas = document.createElement("canvas");
        canvas.width = texture.width;
        canvas.height = texture.height;

        const ctx = canvas.getContext("2d");
        const imgData = ctx.createImageData(canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i++)
            imgData.data[i] = texture.pixels[i];

        canvas.title = texture.name;

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    class Texture {
        id: number;
        name: string;

        params: number;
        format: NITRO_Tex.Format;
        width: number;
        height: number;

        paletteName: String;
        pixels: Uint8Array;
        isTranslucent: boolean;
    }

    function parseTexture(bmd:BMD, view:DataView, texIdx, palIdx) {
        const texOffs = bmd.textureOffsBase + texIdx * 0x14;

        const texture = new Texture();
        texture.id = texIdx;
        texture.name = readString(view.buffer, view.getUint32(texOffs + 0x00, true), 0xFF);

        const texDataOffs = view.getUint32(texOffs + 0x04, true);
        const texDataSize = view.getUint32(texOffs + 0x08, true);
        const texData = view.buffer.slice(texDataOffs);

        texture.params = view.getUint32(texOffs + 0x10, true);
        texture.format = (texture.params >> 26) & 0x07;
        texture.width = 8 << ((texture.params >> 20) & 0x07);
        texture.height = 8 << ((texture.params >> 23) & 0x07);
        const color0 = !!((texture.params >> 29) & 0x01);

        let palData = null;
        if (palIdx != 0xFFFFFFFF) {
            const palOffs = bmd.paletteOffsBase + palIdx * 0x10;
            texture.paletteName = readString(view.buffer, view.getUint32(palOffs + 0x00, true), 0xFF);
            const palDataOffs = view.getUint32(palOffs + 0x04, true);
            const palDataSize = view.getUint32(palOffs + 0x08, true);
            palData = view.buffer.slice(palDataOffs, palDataOffs + palDataSize);
        }

        texture.pixels = NITRO_Tex.readTexture(texture.format, texture.width, texture.height, texData, palData, color0);

        if (texture.pixels)
            document.querySelector('#textures').appendChild(textureToCanvas(texture));

        texture.isTranslucent = (texture.format === NITRO_Tex.Format.Tex_A5I3 ||
                                 texture.format === NITRO_Tex.Format.Tex_A3I5);

        return texture;
    }

    class BMD {
        scaleFactor: number;
        models: Model[];

        modelCount: number;
        modelOffsBase: number;
        polyCount: number;
        polyOffsBase: number;
        textureCount: number;
        textureOffsBase: number;
        paletteCount: number;
        paletteOffsBase: number;
        materialCount: number;
        materialOffsBase: number;
    }

    export function parse(buffer:ArrayBuffer) {
        const view = new DataView(buffer);

        var bmd:BMD = new BMD();

        bmd.scaleFactor = (1 << view.getUint32(0x00, true));

        bmd.modelCount = view.getUint32(0x04, true);
        bmd.modelOffsBase = view.getUint32(0x08, true);
        bmd.polyCount = view.getUint32(0x0C, true);
        bmd.polyOffsBase = view.getUint32(0x10, true);
        bmd.textureCount = view.getUint32(0x14, true);
        bmd.textureOffsBase = view.getUint32(0x18, true);
        bmd.paletteCount = view.getUint32(0x1C, true);
        bmd.paletteOffsBase = view.getUint32(0x20, true);
        bmd.materialCount = view.getUint32(0x24, true);
        bmd.materialOffsBase = view.getUint32(0x28, true);

        bmd.models = [];
        for (var i = 0; i < bmd.modelCount; i++)
            bmd.models.push(parseModel(bmd, view, i));

        return bmd;
    };

}