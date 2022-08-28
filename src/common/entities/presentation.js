const constants = require('../constants');

class Presentation {
    constructor() {
        this.id = null;
        this.name = constants.PRESENTATION.NAME_DEFAULT;
        this.width = constants.PRESENTATION.WIDTH_DEFAULT;
        this.height = constants.PRESENTATION.HEIGHT_DEFAULT;
        this.slides = [];
        return this;
    }

    clone() {
        const newPresentation = new Presentation();
        newPresentation.id = this.id;
        newPresentation.name = this.name;
        newPresentation.width = this.width;
        newPresentation.height = this.height;
        newPresentation.slides = [...this.slides];
        return newPresentation;

    }
};

module.exports = Presentation;