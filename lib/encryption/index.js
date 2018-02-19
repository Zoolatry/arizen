
var fs = require("fs-extra")
var log = require("js-vue-logger")
var crypto = require("crypto")

var self = module.exports = {
    writeObjectEncrypted: function(object, filePath, username, password) {
        var json = JSON.stringify(object);

        var inputBytes = Buffer.from(json, "utf8");
        // encrypt
        let iv = Buffer.concat([Buffer.from(username, "utf8"), crypto.randomBytes(64)]);
        let salt = crypto.randomBytes(64);
        let key = crypto.pbkdf2Sync(password, salt, 2145, 32, "sha512");
        let cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
        let encrypted = Buffer.concat([cipher.update(inputBytes), cipher.final()]);

        var data = Buffer.concat([iv, salt, cipher.getAuthTag(), encrypted]);

        fs.writeFileSync(filePath, data, function (err) {
            if (err) {
                log.error(err);
            }
        });
    },
    readEncryptedObject: function(filePath, username, password) {
        var outputBytes = self.readEncryptedBytes(filePath, username, password)
        if (outputBytes != null) {
            var resultJson = outputBytes.toString("utf8");
            // console.log(resultJson);
            var resultObj = JSON.parse(resultJson);
            return resultObj;
        }
        return null;
    },
    readEncryptedBytes: function(filePath, username, password) {
        let i = Buffer.byteLength(username);
        let inputBytes = fs.readFileSync(filePath);
        let recoveredLogin = inputBytes.slice(0, i).toString("utf8");
        let outputBytes = [];

        if (username === recoveredLogin) {
            let iv = inputBytes.slice(0, i + 64);
            i += 64;
            let salt = inputBytes.slice(i, i + 64);
            i += 64;
            let tag = inputBytes.slice(i, i + 16);
            i += 16;
            let encrypted = inputBytes.slice(i);
            let key = crypto.pbkdf2Sync(password, salt, 2145, 32, "sha512");
            let decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

            decipher.setAuthTag(tag);
            outputBytes = decipher.update(encrypted, "binary", "binary");
            try {
                outputBytes += decipher.final("binary");
            } catch (err) {
                /*
                * Let's hope node.js crypto won't change error messages.
                * https://github.com/nodejs/node/blob/ee76f3153b51c60c74e7e4b0882a99f3a3745294/src/node_crypto.cc#L3705
                * https://github.com/nodejs/node/blob/ee76f3153b51c60c74e7e4b0882a99f3a3745294/src/node_crypto.cc#L312
                */
                if (err.message.match(/Unsupported state/)) {
                    /*
                    * User should be notified that wallet couldn't be decrypted because of an invalid
                    * password or because the wallet file is corrupted.
                    */
                    outputBytes = [];
                } else {
                    // FIXME: handle other errors
                    outputBytes = [];
                    // throw err;
                }
            }
        }
        if (outputBytes.length > 0) {
            return outputBytes;
        }
        return null;
    }
}
