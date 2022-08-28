const AWS = require('aws-sdk');
const constants = require('../../common/constants');
const Text = require('../../common/entities/text');
const ErrorManagement = require('../../common/errorManagement');
const errors = new ErrorManagement("awsBucketS3.api");
const fs = require('fs').promises;

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
AWS.config.update({ region: 'sa-east-1' });
const client = new AWS.S3();

module.exports = {
    getPresignedUrl,
    storeFileToS3
}


function getPresignedUrl(path) {
    try {
        var today = new Date();
        var year = today.getFullYear();

        const paramsPut = {
            Bucket: process.env.BUCKET,
            Key: `GENERATOR_PRESENTATION/${year + path}`,
            Expires: 604800
        };

        const urlPut = client.getSignedUrl('putObject', paramsPut);

        return { urlPut: urlPut, urlGet: urlPut.split('?')[0] };

    } catch (error) {
        throw errors.getError("getPresignedUrl", error, 1, { path });
    }
}

async function storeFileToS3(url, filePath) {
    try {
        const buffer = await fs.readFile(filePath);
        const paramsPutObject = {
            Bucket: process.env.BUCKET,
            Key: url,
            Body: buffer,
        };

        const data = await client.upload(paramsPutObject).promise();


        const paramsGetObject = {
            Bucket: data.Bucket,
            Key: data.Key
        };

        return client.getSignedUrl('getObject', paramsGetObject);

    } catch (error) {
        console.log(error);
        throw errors.getError("storeFileToS3", error, 1, { url, file });
    }

}




//exports.apiBucketS3 = (function () {
//    return {
//        constantsError: constantsError,
//
//        init: function () {
//            try {
//                configAwsS3.getS3();
//            } catch (error) {
//                global.logger.debugError("init", { "error": error, "step": 1 });
//            }
//
//        },
//        getPresignedUrl: function (documentName, documentFolder, id) {
//            return new Promise((resolve, reject) => {
//                try {
//
//                    var today = new Date();
//                    var year = today.getFullYear();
//
//                    const paramsPut = {
//                        Bucket: global.config.bucket,
//                        Key: `ABRA/ONBOARDING/${year}/${id}/${documentFolder}/${documentName}`,
//                        Expires: 604800
//                    };
//
//                    const urlPut = configAwsS3.getS3().getSignedUrl('putObject', paramsPut);
//
//                    resolve({ urlPut: urlPut, urlGet: urlPut.split('?')[0] });
//
//                } catch (error) {
//                    global.logger.debugError("getPresignedUrl", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        getFileFromUrl: function (bucket, key) {
//            return new Promise((resolve, reject) => {
//                try {
//                    const paramsGet = {
//                        Bucket: bucket,
//                        Key: key,
//                    };
//
//                    configAwsS3.getS3().getObject(paramsGet,
//                        function (err, data) {
//                            if (!err) {
//                                resolve(Buffer.from(data.Body));
//                            } else {
//                                reject(err);
//                            }
//                        });
//
//                } catch (error) {
//                    global.logger.debugError("getFileFromUrl", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        getFileFromUrlDiferentRegion: function (region, bucket, key) {
//            return new Promise((resolve, reject) => {
//                try {
//
//                    AWS.config.update(
//                        {
//                            accessKeyId: global.config.accessKeyId,
//                            secretAccessKey: global.config.secretAccessKey,
//                            region: region
//                        }
//                    );
//                    let s3DifferentRegion = new AWS.S3();
//                    const paramsGet = {
//                        Bucket: bucket,
//                        Key: key,
//                    };
//                    s3DifferentRegion.getObject(paramsGet,
//                        function (err, data) {
//                            if (!err) {
//                                resolve(Buffer.from(data.Body));
//                            } else {
//                                reject(err);
//                            }
//                        });
//
//                } catch (error) {
//                    global.logger.debugError("getFileFromUrl", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        getFileUrl: function (bucket, url) {
//            return new Promise((resolve, reject) => {
//                try {
//                    const paramsPut = {
//                        Bucket: bucket,
//                        Key: url.split(".com/")[1],
//                    };
//                    var response = configAwsS3.getS3().getSignedUrl('getObject', paramsPut);
//                    resolve({ url: response });
//                } catch (error) {
//                    global.logger.debugError("getFileUrl", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        getFileUrlDiferentRegion: function (region, bucket, url) {
//            return new Promise((resolve, reject) => {
//                try {
//
//                    AWS.config.update(
//                        {
//                            accessKeyId: global.config.accessKeyId,
//                            secretAccessKey: global.config.secretAccessKey,
//                            region: region
//                        }
//                    );
//
//                    let s3DifferentRegion = new AWS.S3();
//
//                    const params = {
//                        Bucket: bucket,
//                        Key: url.split(".com/")[1],
//                    };
//
//                    var response = s3DifferentRegion.getSignedUrl('getObject', params);
//                    resolve({ url: response });
//
//                } catch (error) {
//                    global.logger.debugError("getFileUrl", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        storeFileToS3: function (bucket, key, file) {
//            return new Promise((resolve, reject) => {
//                try {
//
//                    const paramsPutObject = {
//                        Bucket: bucket,
//                        Key: key,
//                        body: file,
//                    };
//
//                    configAwsS3.getS3().upload(paramsPutObject);
//
//                    const paramsGetObject = {
//                        Bucket: bucket,
//                        Key: key
//                    };
//
//                    const url = configAwsS3.getS3().getUrl(paramsGetObject);
//
//                    resolve({ url: url });
//
//                } catch (error) {
//                    global.logger.debugError("storeFileToS3", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },

//        storeFileDiferentRegion: function (region, bucket, key, file) {
//            return new Promise((resolve, reject) => {
//                try {
//
//                    AWS.config.update(
//                        {
//                            accessKeyId: global.config.accessKeyId,
//                            secretAccessKey: global.config.secretAccessKey,
//                            region: region
//                        }
//                    );
//
//                    const s3DifferentRegion = new AWS.S3();
//
//                    const paramsPutObject = {
//                        Bucket: bucket,
//                        Key: key,
//                        Body: file,
//                    };
//
//                    s3DifferentRegion.upload(paramsPutObject)
//                        .promise()
//                        .then(data => {
//                            const paramsGetObject = {
//                                Bucket: data.Bucket,
//                                Key: data.key
//                            };
//                            const url = s3DifferentRegion.getSignedUrl('getObject', paramsGetObject);
//                            resolve(url);
//                        }).catch((err) => {
//                            reject(err)
//                        });
//
//                } catch (error) {
//                    global.logger.debugError("storeFileToS3", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        },
//        copyFileToS3: function (bucket, key, copyBucket, copyKey) {
//            return new Promise((resolve, reject) => {
//                try {
//                    const params = {
//                        Bucket: bucket,
//                        Key: key,
//                        CopySource: "/" + copyBucket + "/" + copyKey,
//                    };
//                    configAwsS3.getS3().copyObject(params, function (err, data) {
//                        if (err)
//                            reject(err);
//                        else {
//                            resolve(data);
//                        }
//                    });
//
//                } catch (error) {
//                    global.logger.debugError("storeFileToS3", { "error": error, "step": 1 });
//                    reject(constantsError.ERROR_FIND_DOCUMENT);
//                }
//
//            })
//        }
//
//    }
//
//})();
//