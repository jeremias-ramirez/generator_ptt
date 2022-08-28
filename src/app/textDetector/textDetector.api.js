const fs = require('fs');
const TxtDet = require('./textDetector.module');
const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("textDetector.api");
const constants = require('../../common/constants');

module.exports = {
    getTexts
}

async function getTexts(params) {
    try {
        const imageBytes = fs.readFileSync(params.src);

        const quadrants = constants.TEXT_DETECTOR.QUADRANTS;

        const textsQuadrant = await Promise.all(Object.values(quadrants)
            .map((quadrant,idxQ) => TxtDet.getTextsAws(imageBytes, quadrant)));


        const result = textsQuadrant.flatMap((texts, index) => {
            return texts.map(text => {
                text.id = Math.round(index * 100 + text.id);
                return text;
            })
        });

        return result.filter((t1, index, self) =>
            index !== self.findIndex((t2) => (t2.top === t1.top))
        );

    } catch (error) {
        throw errors.getError("getTexts", error, 0, params)
    }

}
