const fs = require('fs');
const constants = require('../../common/constants');

const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("generatorPtt.api");

const presentation = require('../presentation/presentation.api');
const awsRekognition = require('../../apis/aws/rekognition.api');
const imageApi = require('../image/image.api');
module.exports = {
    generatePtt
}

async function generatePtt(params) {
    try {
        const imageBytes = fs.readFileSync(params.src);
        params.imageBytes = imageBytes;

        const texts = await awsRekognition.getTexts(imageBytes);
        params.texts = texts;

        const images = await imageApi.getImagesPresentation(params);
        params.images = images;

        const presentationE = presentation.createPresentation(params);
        return presentationE;

    } catch (error) {
        throw errors.getError("generatePtt", error, 0, params)
    }

}
