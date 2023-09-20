const crypto = require("crypto");
const { j2xParser } = require("fast-xml-parser");

// import  { FUSMsg } from "../types/FUSMsg";
const parser = new j2xParser({});
const getLogicCheck = (input, nonce) => {
    let out = "";
    for (let i = 0; i < nonce.length; i++) {
        const char = nonce.charCodeAt(i);
        out += input[char & 0xf];
    }
    return out;
};
const getBinaryInformMsg = (version, region, model, nonce) => {
    const msg = {
        FUSMsg: {
            FUSHdr: {
                ProtoVer: "1.0",
            },
            FUSBody: {
                Put: {
                    ACCESS_MODE: {
                        Data: 2,
                    },
                    BINARY_NATURE: {
                        Data: 1,
                    },
                    CLIENT_PRODUCT: {
                        Data: "Smart Switch",
                    },
                    DEVICE_FW_VERSION: {
                        Data: version,
                    },
                    DEVICE_LOCAL_CODE: {
                        Data: region,
                    },
                    DEVICE_MODEL_NAME: {
                        Data: model,
                    },
                    LOGIC_CHECK: {
                        Data: getLogicCheck(version, nonce),
                    },
                },
            },
        },
    };
    return parser.parse(msg);
};
const getBinaryInitMsg = (filename, nonce) => {
    const msg = {
        FUSMsg: {
            FUSHdr: {
                ProtoVer: "1.0",
            },
            FUSBody: {
                Put: {
                    BINARY_FILE_NAME: {
                        Data: filename,
                    },
                    LOGIC_CHECK: {
                        Data: getLogicCheck(filename.split(".")[0].slice(-16), nonce),
                    },
                },
            },
        },
    };
    return parser.parse(msg);
};
const getDecryptionKey = (version, logicalValue) => {
    return crypto
        .createHash("md5")
        .update(getLogicCheck(version, logicalValue))
        .digest();
};

module.exports = { getBinaryInformMsg, getBinaryInitMsg, getDecryptionKey }