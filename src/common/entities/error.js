class ErrorEntity {
    constructor() {
        this.module = "";
        this.function = "";
        this.type = "";
        this.error = null;
        this.extraInfo = null;
        return this;
    }
};

module.exports = ErrorEntity;