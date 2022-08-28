const errors = new (require('../../common/errorManagement'))("presentation.api");

const presentation = require('./presentation.module');

module.exports = {
    createPresentation
}

async function createPresentation(params) {
    console.log('Executing createPresentation');
    try {

        const presentationE = await presentation.createPresentation(params.name);
        let slide1 = await presentation.createSlide(presentationE);
        let slide2 = await presentation.createSlide(presentationE, 1);

        if (typeof params.texts !== "undefined") {
            slide1 = await presentation.addTexts(slide1, params.texts);
        }

        if (typeof params.images !== "undefined") {
            slide2 = await presentation.addImages(slide2, params.images);
        }


        presentationE.slides.push(slide1);
        presentationE.slides.push(slide2);
        return presentationE;

    } catch (error) {
        throw errors.getError("createPresentation", error, 0, params);
    }
}
