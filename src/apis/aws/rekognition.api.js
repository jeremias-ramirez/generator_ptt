const AWS = require('aws-sdk');
const constants = require('../../common/constants');
const Text = require('../../common/entities/text');
const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("awsRekognition.api");

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
AWS.config.update({ region: 'us-west-1' });
const client = new AWS.Rekognition();

module.exports = {
    getTexts
}

async function getTexts(image, typeImage = constants.AWS_API.REKOGNITION.TYPES_IMAGE.BYTES) {
    console.log("Executing getText AWS Rekognition");
    try {

        const quadrants = constants.AWS_API.REKOGNITION.QUADRANTS;

        let textsQuadrant = await Promise.all(Object.values(quadrants)
            .map(async (quadrant, idxQ) =>
                _getTexts(_getRequestGetText(image, typeImage, quadrant), idxQ)
            ));


        const compareTexts = (txtA, txtB) => {

            if (txtA.top === txtB.top && txtA.left + txtA.width > txtB.left) {
                if (txtA.left + txtA.width >= txtB.left + txtB.width) {
                    return 1;
                } else if (txtB.left + txtB.width >= txtA.left + txtA.width) {
                    return -1;
                } else {
                    return -1;
                }
            }
            return 0;
        };
        textsQuadrant = textsQuadrant.filter(e => e.length > 0);

        [...Array(textsQuadrant.length - 1).keys()].map(idxQ => {
            const qA = textsQuadrant[idxQ];
            const qB = textsQuadrant[idxQ + 1];

            if(qA.length === 0 || qB.length === 0) return 0;
            
            const lastTxt = qA[qA.length - 1];
            const headTxt = qB[0];

            const rsltComp = compareTexts(lastTxt, headTxt);
            if (rsltComp === 1) {
                qB.shift();
            } else if (rsltComp === -1) {
                qA.pop();
            }

        });

        return textsQuadrant.flat();

    } catch (error) {
        throw errors.getError("getTexts", error, 1, { image, typeImage });
    }

}
function _getRequestGetText(image, typeImage, regionQuadrant) {
    const params = {
        Image: {
            Bytes: image
        },
        Filters: {
            RegionsOfInterest: [
                {
                    BoundingBox: regionQuadrant
                }]
        }
    };
    return params;
};

async function _getTexts(request, indexQ = 0) {
    const response = await client.detectText(request).promise();

    const isLineText = text => text.Type === "LINE";
    const arr = response.TextDetections.filter(isLineText).map(
        (txt, index) => toTextFromAws(txt, index + Math.round(100 * indexQ))
    );
    return arr;
}

function toTextFromAws(text, index) {
    const textE = new Text();

    if (typeof index === 'undefined') {
        textE.index = Number(text.Id);
    } else { textE.index = index; }

    textE.content = text.DetectedText;
    textE.left = text.Geometry.BoundingBox.Left;
    textE.top = text.Geometry.BoundingBox.Top;
    textE.width = text.Geometry.BoundingBox.Width;
    textE.height = text.Geometry.BoundingBox.Height;
    return textE;
}
