const AWS = require('aws-sdk');
const constants = require('../../common/constants');
const Text = require('../../common/entities/text');
const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("textDetector.module");

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
AWS.config.update({ region: 'us-west-1' });
const client = new AWS.Rekognition();

module.exports = {
    getTextsAws
}

async function getTextsAws(imageBytes, regionQuadrant = constants.TEXT_DETECTOR.QUADRANTS.Q0) {
    try {

        const params = {
            Image: {
                Bytes: imageBytes
            },
            Filters: {
                RegionsOfInterest: [
                    {
                        BoundingBox: regionQuadrant
                    }]
            }
        };
        const response = await client.detectText(params).promise();

        const isLineText = text => text.Type === "LINE";
        const arr = response.TextDetections.filter(isLineText).map(toTextFromAws);
        return arr;

    } catch (error) {
        throw errors.getError("getTextsAws", error, 1, imageBytes);
    }

}

function toTextFromAws(text) {
    const textE = new Text();
    textE.id = text.Id
    textE.content = text.DetectedText;
    textE.left = text.Geometry.BoundingBox.Left;
    textE.top = text.Geometry.BoundingBox.Top;
    textE.width = text.Geometry.BoundingBox.Width;
    textE.height = text.Geometry.BoundingBox.Height;
    return textE;
}
