class Slide {
    constructor() {
        this.id = null;
        this.presentationId = null;
        this.texts = [];
        this.images = [];
        this.width = 0;
        this.height = 0;

        return this;
    }

    clone() {
        const newSlide = new Slide();
        newSlide.id = this.id;
        newSlide.presentationId = this.presentationId;
        newSlide.width = this.width;
        newSlide.height = this.height;
        newSlide.texts = [...this.texts];
        newSlide.images = [...this.images];
        return newSlide;

    }
};

module.exports = Slide;