const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("image.api");
const imageM = require('./image.module');
const awsBucketS3 = require('../../apis/aws/bucketS3.api');
const Image = require('../../common/entities/image');
const constants = require('../../common/constants');
module.exports = {
    getImagesPresentation
}

async function getImagesPresentation(params) {
    console.log("Executing getImagesPresentation api");
    try {

        const pathOut = constants.PATH.IMAGE_RESULTS + '/' + params.name;

        const img = new Image();
        img.path = params.src;

        //const images = await imageM.getImagesPresentation(img, params.texts, pathOut);
        //return images;

        const image = await imageM.getImageWithCoveredTexts(img, params.texts, params.name);

        const result = await imageM.saveImagesCloud([image]);
        return result;


    } catch (error) {
        throw errors.getError("getImagesPresentation", error, 0, params);
    }
}
