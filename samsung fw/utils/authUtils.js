const crypto = require("crypto");


const NONCE_KEY = "hqzdurufm2c8mf6bsjezu1qgveouv7c7";
const AUTH_KEY = "w13r4cvf4hctaujv";

const decryptNonce = (nonceEncrypted) => {
    const nonceDecipher = crypto.createDecipheriv("aes-256-cbc", NONCE_KEY, NONCE_KEY.slice(0, 16));
    return Buffer.concat([
        nonceDecipher.update(nonceEncrypted, "base64"),
        nonceDecipher.final(),
    ]).toString("utf-8");
};

const getAuthorization = (nonceDecrypted) => {
    let key = "";
    for (let i = 0; i < 16; i += 1) {
        const nonceChar = nonceDecrypted.charCodeAt(i);
        key += NONCE_KEY[nonceChar % 16];
    }
    key += AUTH_KEY;
    const authCipher = crypto.createCipheriv("aes-256-cbc", key, key.slice(0, 16));
    return Buffer.concat([
        authCipher.update(nonceDecrypted, "utf8"),
        authCipher.final(),
    ]).toString("base64");
};
const handleAuthRotation = (responseHeaders) => {
    const { nonce } = responseHeaders;
    const nonceDecrypted = decryptNonce(nonce);
    const authorization = getAuthorization(nonceDecrypted);
    return {
        Authorization: `FUS nonce="${nonce}", signature="${authorization}", nc="", type="", realm="", newauth="1"`,
        nonce: {
            decrypted: nonceDecrypted,
            encrypted: nonce,
        },
    };
};

module.exports = { decryptNonce, getAuthorization, handleAuthRotation }