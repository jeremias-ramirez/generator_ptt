const google = require('googleapis');
const Slide = require('../../common/entities/slide');
const Presentation = require('../../common/entities/presentation');
const slides = google.slides('v1');
const auth = require('./auth');
const errors = new (require('../../common/errorManagement'))("presentation.module");

//1px = 9525emu

module.exports = {
    createPresentation,
    createSlide,
    addTexts,
    addImages
};

async function createPresentation(name) {
    console.log('Executing createPresentation');

    try {

        const authClient = await auth.getClient();
        google.options({ auth: authClient });

        const presentationIn = new Presentation();
        if (typeof name !== 'undefined') presentationIn.name = name;

        const presentation = await createPresentationExternal(presentationIn);
        return presentation;

    } catch (error) {

        throw errors.getError("createPresentation", error, 0, { name });
    }

}
async function createPresentationExternal(presentationIn) {
    console.log('Executing createPresentationExternal');

    return new Promise((resolve, reject) => {
        const requestCreate = { title: presentationIn.name };

        slides.presentations.create({ resource: { ...requestCreate } }, (err, presentation) => {
            if (err) reject(errors.getError("createPresentationExternal", err, 1, presentationIn));

            const presentationOut = new Presentation();
            presentationOut.name = presentationIn.name;
            presentationOut.id = presentation.presentationId;
            presentationOut.width = presentation.pageSize.width.magnitude;
            presentationOut.height = presentation.pageSize.height.magnitude;

            resolve(presentationOut);
        });

    });
}

async function createSlide(presentation, index = 0) {
    console.log('Executing createSlide');
    try {

        const slideId = presentation.id + "_" + index.toString();
        const slide = new Slide();
        slide.id = slideId;
        slide.presentationId = presentation.id;
        slide.index = index;
        slide.width = presentation.width;
        slide.height = presentation.height;

        const request = [{
            createSlide: {
                objectId: slideId,
                insertionIndex: index.toString(),
            }
        }];

        await executeRequest(presentation.id, request);
        return slide;

    } catch (error) {
        throw errors.getError("createSlide", error, 0, { presentation, index });
    }
}


async function addTexts(slide, texts) {
    console.log('Executing addTexts');
    try {

        const requestAddTexts = texts.flatMap(text => {
            text.slideId = slide.id;
            text.id = slide.id + "T" + text.index.toString();
            slide.texts.push(text);
            return getRequestAddText(slide, text);
        });

        await executeRequest(slide.presentationId, requestAddTexts);
        return slide;

    } catch (error) {

        throw errors.getError("addTexts", error, 0, { slide, texts });
    }
}


function getRequestAddText(slide, text) {
    //console.log("Executing getRequestAddText");
    try {
        const shapeId = text.id;

        const allUpperCase = content => (/[a-z]+/.test(content) === false);
        const increment = allUpperCase(text.content) ? 1.3 : 1.2;

        const request = [{
            createShape: {
                objectId: shapeId,
                shapeType: "TEXT_BOX",
                elementProperties: {
                    pageObjectId: slide.id,
                    size: {
                        width: {
                            magnitude: Math.round(slide.width * text.width * increment),
                            unit: "EMU"
                        },
                        height: {
                            magnitude: Math.round(slide.height * text.height * increment),
                            unit: "EMU"
                        }
                    },
                    transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: Math.floor(slide.width * text.left),
                        translateY: Math.floor(slide.height * text.top),
                        unit: "EMU"
                    }
                },

            }
        },
        {
            updateShapeProperties: {
                objectId: shapeId,
                shapeProperties: {
                    contentAlignment: 'MIDDLE',

                },
                fields: 'contentAlignment',
            }
        },
        {
            insertText: {
                objectId: shapeId,
                text: text.content,
            }
        },
        {
            updateTextStyle: {
                objectId: shapeId,
                textRange: {
                    type: 'ALL',
                },
                style: {
                    fontSize: {
                        magnitude: Math.round(slide.height * text.height),
                        unit: 'EMU',
                    },
                },
                fields: 'fontSize',
            }
        }];
        return request;

    } catch (error) {
        throw errors.getError("getRequestAddText", error, 0, { slide, text });
    }
}


async function addImages(slide, images) {
    console.log('Executing addImages');
    try {

        const requestAddImages = images.flatMap(image => {
            image.slideId = slide.id;
            image.id = slide.id + "I" + image.index.toString();
            slide.images.push(image);
            return getRequestAddImage(slide, image);
        });

        await executeRequest(slide.presentationId, requestAddImages);
        return slide;

    } catch (error) {

        throw errors.getError("addImages", error, 0, { slide, images });
    }
}


function getRequestAddImage(slide, image) {
    try {
        const request = [{
            createImage: {
                objectId: image.id,
                url: image.url,
                elementProperties: {
                    pageObjectId: slide.id,

                    transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: Math.round(image.left * slide.width),
                        translateY: Math.round(image.top * slide.height),
                        unit: 'EMU',
                    },
                },
            },
        }];
        return request;

    } catch (error) {
        throw errors.getError("getRequestAddImage", error, 0, { slide, image });
    }

}

async function executeRequest(presentationId, requests) {
    console.log("Execution executeRequest");
    return new Promise((resolve, reject) => {
        slides.presentations.batchUpdate({
            presentationId: presentationId,
            resource: {
                requests,
            },
        }, (err, res) => {

            if (err) reject(errors.getError("executeRequest", err, 1, { presentationId, requests }));

            resolve(res);
        });
    });

}