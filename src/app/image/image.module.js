const cv = require('../../../libs/opencv.js');
const fs = require('fs').promises;
const Jimp = require('jimp');

let https;
try {
    https = require('https');
} catch (err) {
    console.log('https support is disabled!');
}

const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("image.module");

const Image = require('../../common/entities/image');
const awsBucketS3 = require('../../apis/aws/bucketS3.api');
const constants = require('../../common/constants.js');


const mimeTypes = {};
mimeTypes[constants.IMAGE.TYPES.PNG] = Jimp.MIME_PNG;
mimeTypes[constants.IMAGE.TYPES.JPG] = Jimp.MIME_JPEG;



module.exports = {
    getImagesPresentation,
    saveImagesCloud,
    getImageWithoutTexts,
    getImageWithCoveredTexts
}
async function getImagesPresentation(image, texts, pathOut = constants.PATH.IMAGE_TEMP) {
    console.log("Executing getImagesPresentation");
    try {

        const src = await getImageWithoutTexts(image, texts)
            .then(getBufferFromImage)
            .then(getMatImageFromBuffer);

        const hyperParams = {
            contoursMode: constants.IMAGE.CONTOURS.MODES.EXTERNAL
        }

        const { contours, hierarchy } = await getContours(src);

        let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
        const images = [];

        for (let i = 0; i < contours.size(); ++i) {

            const rectContour = cv.boundingRect(contours.get(i));

            if (rectContour.height / src.rows < 0.35 && rectContour.width / src.cols < 0.35) {

                const p1 = new cv.Point(rectContour.x, rectContour.y);
                const p2 = new cv.Point(p1.x + rectContour.width, p1.y + rectContour.height);

                for (let i = p1.y; i < p2.y; i++) {
                    for (let j = p1.x; j < p2.x; j++) {

                        const R = src.ucharPtr(i, j)[0];
                        const G = src.ucharPtr(i, j)[1];
                        const B = src.ucharPtr(i, j)[2];
                        const A = src.ucharPtr(i, j)[3];

                        dst.ucharPtr(i, j)[0] = R;
                        dst.ucharPtr(i, j)[1] = G;
                        dst.ucharPtr(i, j)[2] = B;
                        dst.ucharPtr(i, j)[3] = A;
                    }
                }

            }
        }

        await saveMatImage(dst, constants.PATH.IMAGE_TEMP + "/getContours", "shapes1");

        let resultContours = await getContours(dst, hyperParams);
        let contours2 = resultContours.contours;

        let dst2 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
        const gray = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

        for (let i = 0; i < contours2.size(); ++i) {

            const rectContour = cv.boundingRect(contours2.get(i));

            const mask = gray.roi(rectContour);
            cv.threshold(mask, mask, 10, 255, cv.THRESH_BINARY);

            const p1 = new cv.Point(rectContour.x, rectContour.y);
            const p2 = new cv.Point(p1.x + rectContour.width, p1.y + rectContour.height);

            let sum = 0;
            for (let i = 0; i < rectContour.height; i++) {
                for (let j = 0; j < rectContour.width; j++) {
                    const val = mask.ucharPtr(i, j)[0];
                    sum = sum + mask.ucharPtr(i, j)[0];
                }
            }
            let total = rectContour.height * rectContour.width * 255;
            let per = sum / total;

            if (per > 0.5) {
                for (let i = 0; i < rectContour.height; i++) {
                    for (let j = 0; j < rectContour.width; j++) {

                        const R = src.ucharPtr(i + p1.y, j + p1.x)[0];
                        const G = src.ucharPtr(i + p1.y, j + p1.x)[1];
                        const B = src.ucharPtr(i + p1.y, j + p1.x)[2];
                        const A = src.ucharPtr(i + p1.y, j + p1.x)[3];

                        dst2.ucharPtr(i + p1.y, j + p1.x)[0] = R;
                        dst2.ucharPtr(i + p1.y, j + p1.x)[1] = G;
                        dst2.ucharPtr(i + p1.y, j + p1.x)[2] = B;
                        dst2.ucharPtr(i + p1.y, j + p1.x)[3] = A;

                    }
                }

            }

        }


        const path = await saveMatImage(dst2, constants.PATH.IMAGE_TEMP + "/getContours", "shapes2");

        resultContours = await getContours(dst2, hyperParams);
        contours2 = resultContours.contours;

        let dst3 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
        for (let i = 0; i < contours2.size(); ++i) {

            const rectContour = cv.boundingRect(contours2.get(i));

            const p1 = new cv.Point(rectContour.x, rectContour.y);
            const p2 = new cv.Point(p1.x + rectContour.width, p1.y + rectContour.height);

            const shapeRoi = cv.Mat.zeros(rectContour.height, rectContour.width, cv.CV_8UC4);
            //if (rectContour.width / src.cols < 0.05 && rectContour.height / src.rows < 0.05) continue;
            for (let i = 0; i < rectContour.height; i++) {
                for (let j = 0; j < rectContour.width; j++) {

                    const R = src.ucharPtr(i + p1.y, j + p1.x)[0];
                    const G = src.ucharPtr(i + p1.y, j + p1.x)[1];
                    const B = src.ucharPtr(i + p1.y, j + p1.x)[2];
                    const A = src.ucharPtr(i + p1.y, j + p1.x)[3];

                    dst3.ucharPtr(i + p1.y, j + p1.x)[0] = R;
                    dst3.ucharPtr(i + p1.y, j + p1.x)[1] = G;
                    dst3.ucharPtr(i + p1.y, j + p1.x)[2] = B;
                    dst3.ucharPtr(i + p1.y, j + p1.x)[3] = A;

                    shapeRoi.ucharPtr(i, j)[0] = R;
                    shapeRoi.ucharPtr(i, j)[1] = G;
                    shapeRoi.ucharPtr(i, j)[2] = B;
                    shapeRoi.ucharPtr(i, j)[3] = A;

                }
            }

            const shape = new Image();
            shape.index = images.length;
            shape.left = rectContour.x / src.cols;
            shape.top = rectContour.y / src.rows;
            shape.width = rectContour.width / src.cols;
            shape.height = rectContour.height / src.rows;
            const name = "image_" + shape.index.toString();

            shape.path = await saveMatImage(shapeRoi, pathOut, name);

            images.push(shape);

            const color = new cv.Scalar(0, 255, 255, 255);
            cv.rectangle(dst3, p1, p2, color, 1);


        }

        await saveMatImage(dst3, constants.PATH.IMAGE_TEMP + "/getContours", "shapes3");

        contours.delete();
        src.delete(); dst.delete(); hierarchy.delete();
        contours2.delete(); dst2.delete(); dst3.delete();

        return images;

    } catch (error) {
        console.dir(error);
        throw errors.getError("getImagesPresentation", error, 0, { image, texts, pathOut });
    }

}


async function getImageWithoutTexts(image, texts) {
    console.log("Executing getImageWithoutTexts");
    try {

        const dst = await getBufferFromImage(image).then(getMatImageFromBuffer);

        const removeText = (text) => {
            const x1 = Math.floor(text.left * dst.cols);
            const y1 = Math.floor(text.top * dst.rows);
            const p1 = new cv.Point(x1, y1);

            const x2 = Math.ceil(x1 + text.width * dst.cols);
            const y2 = Math.ceil(y1 + text.height * dst.rows);
            const p2 = new cv.Point(x2, y2);

            const color = new cv.Scalar(0, 0, 0, 0);
            cv.rectangle(dst, p1, p2, color, -1);

        };

        texts.map(removeText);
        const imageR = new Image();
        imageR.index = 0.0;
        imageR.left = 0.0;
        imageR.top = 0.0;
        imageR.width = 1.0;
        imageR.height = 1.0;

        imageR.path = await saveMatImage(dst, constants.PATH.IMAGE_TEMP, "withoutTexts");
        return imageR;


    } catch (error) {
        throw errors.getError("getImageWithoutTexts", error, 0, { image, texts });
    }

};

async function getImageWithCoveredTexts(image, texts, name = "withCoveredTexts") {
    console.log("Executing getImageWithCoveredTexts");
    try {

        const dst = await getBufferFromImage(image).then(getMatImageFromBuffer);

        const coverText = (text) => {
            const x1 = Math.floor(text.left * dst.cols);
            const y1 = Math.floor(text.top * dst.rows);
            const p1 = new cv.Point(x1, y1);

            const x2 = Math.ceil(x1 + text.width * dst.cols);
            const y2 = Math.ceil(y1 + text.height * dst.rows);
            const p2 = new cv.Point(x2, y2);

            const height = p2.y - p1.y;
            for (let j = p1.x; j < p2.x; j++) {

                const R_P1 = dst.ucharPtr(p1.y - 1, j)[0];
                const G_P1 = dst.ucharPtr(p1.y - 1, j)[1];
                const B_P1 = dst.ucharPtr(p1.y - 1, j)[2];
                const A_P1 = dst.ucharPtr(p1.y - 1, j)[3];

                const R_P2 = dst.ucharPtr(p2.y + 1, j)[0];
                const G_P2 = dst.ucharPtr(p2.y + 1, j)[1];
                const B_P2 = dst.ucharPtr(p2.y + 1, j)[2];
                const A_P2 = dst.ucharPtr(p2.y + 1, j)[3];


                let dR = Math.round((R_P2 - R_P1) / height);
                let dG = Math.round((G_P2 - G_P1) / height);

                let dB = Math.round((B_P2 - B_P1) / height);

                const dA = Math.floor((A_P2 - A_P1) / height);

                for (let i = p1.y, step = 0; i < p2.y; i++, step++) {
                    dst.ucharPtr(i, j)[0] = R_P1 + dR * step;
                    dst.ucharPtr(i, j)[1] = G_P1 + dG * step;
                    dst.ucharPtr(i, j)[2] = B_P1 + dB * step;
                    dst.ucharPtr(i, j)[3] = 255;

                }
            }
            const width = p2.x - p1.x;
            let rect = new cv.Rect(p1.x, p1.y, width, height);
            const roi = dst.roi(rect);
            cv.blur(roi, roi, new cv.Size(5, 5));
            cv.blur(roi, roi, new cv.Size(5, 5));
        };

        cv.blur(dst, dst, new cv.Size(3, 3));

        texts.map(coverText);
        const imageR = new Image();
        imageR.index = 0.0;
        imageR.left = 0.0;
        imageR.top = 0.0;
        imageR.width = 1.0;
        imageR.height = 1.0;

        imageR.path = await saveMatImage(dst, constants.PATH.IMAGE_TEMP, name);
        return imageR;


    } catch (error) {
        throw errors.getError("getImageWithCoveredTexts", error, 0, { image, texts });
    }

};

async function getContours(matImage, hyperParams = {}) {
    console.log("Executing getContours");
    try {

        const src = matImage;


        const gray = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        const canny_out = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        cv.blur(gray, gray, new cv.Size(3, 3));
        cv.blur(gray, gray, new cv.Size(3, 3));
        const threshold = 100;
        cv.Canny(gray, canny_out, threshold, threshold * 2)

        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        const contoursModes = {};
        contoursModes[constants.IMAGE.CONTOURS.MODES.LIST] = cv.RETR_LIST;
        contoursModes[constants.IMAGE.CONTOURS.MODES.EXTERNAL] = cv.RETR_EXTERNAL;

        let contoursMode = cv.RETR_LIST;
        if (typeof hyperParams.contoursMode !== 'undefined') contoursMode = contoursModes[hyperParams.contoursMode];

        await cv.findContours(canny_out, contours, hierarchy, contoursMode, cv.CHAIN_APPROX_SIMPLE);

        return { contours, hierarchy };

    } catch (error) {
        throw errors.getError("getContours", error, 0, { matImage });
    }
}

async function getBufferFromImage(image) {
    try {
        const buffer = await fs.readFile(image.path);
        return buffer;

    } catch (error) {
        throw errors.getError("getBufferFromImage", error, 0, { image });
    }

}
async function getMatImageFromBuffer(buffer) {
    try {
        const jimpSrc = await Jimp.read(buffer);
        const dst = cv.matFromImageData(jimpSrc.bitmap);
        return dst;
    } catch (error) {
        throw errors.getError("getMatImageFromBuffer", error, 0, { buffer });
    }

}

async function saveMatImage(imageMat, srcOut, name, imageType = constants.IMAGE.TYPES.PNG) {
    try {

        const jimpImage = new Jimp({
            width: imageMat.cols,
            height: imageMat.rows,
            data: Buffer.from(imageMat.data)
        });

        const path = `${constants.PATH.ROOT + srcOut}/${name}.${imageType}`;
        await jimpImage.writeAsync(path);
        return path;

    } catch (error) {
        throw errors.getError("saveMatImage", error, 0, { imageMat, srcOut, name, imageType });
    }
}

async function getBufferFromMatImage(imageMat, imageType = constants.IMAGE.TYPES.PNG) {
    try {
        const jimpImage = new Jimp({
            width: imageMat.cols,
            height: imageMat.rows,
            data: Buffer.from(imageMat.data)
        });
        const buffer = await jimpImage.getBufferAsync(mimeTypes[imageType]);
        return buffer;
    } catch (error) {

        throw errors.getError("getBufferFromMatImage", error, 0, { imageMat, imageType });
    }

}


async function saveImagesCloud(images) {
    console.log("Executing saveImagesCloud");
    try {

        const _saveImage = async (image) => {
            const urls = awsBucketS3.getPresignedUrl(image.path);
            const url = await awsBucketS3.storeFileToS3(urls.urlPut, image.path);
            image.url = url;
            return image;
        }

        const result = await Promise.all(images.map(_saveImage));

        return result;

    } catch (error) {
        throw errors.getError("saveImagesCloud", error, 0, { images });
    }

}

