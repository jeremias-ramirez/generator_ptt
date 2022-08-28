const constants = require('./constants');
const ErrorEntity = require('./entities/error');
const codeMapping = {
    "0": constants.ERROR.GENERAL,
    "1": constants.ERROR.API_EXTERNAL
}
    ;


class ErrorManagement {
    constructor(moduleName) {
        this.moduleName = moduleName;
    }

    getError(functionName, error, code = 0, params = {}, results = {}) {
        const errorData = new ErrorEntity();

        errorData.module = this.moduleName;
        errorData.function = functionName;

        if (error instanceof ErrorEntity) {
            errorData.type = error.type;
            errorData.error = error;
        } else {
            errorData.type = codeMapping[code];
            errorData.error = error.toString();
        }

        errorData.extraInfo = {
            "params": params,
            "results": results
        };

        return errorData;
    }

}
module.exports = ErrorManagement;