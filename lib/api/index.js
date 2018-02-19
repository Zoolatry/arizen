var log = require("js-vue-logger")
var request = require("async-request")

var self = module.exports = {
    explorerApiUrl: "https://explorer.zensystem.io/insight-api-zen",

    getBalance: async function(addr) {
        var url = self.explorerApiUrl + "/addr/" + addr + "/balance";
        log.info("GET " + url);
        var res = await request(url);
        if (res.statusCode == 200) {
            return res.body / 100000000;
        }
        log.error(res.statusCode + " - " + res.body);
        return null;
    },

    getFiat: async function(amount, currency) {
        var url = "https://api.coinmarketcap.com/v1/ticker/zencash/?convert=" + currency;
        log.info("GET " + url);
        var res = await request(url);
        if (res.statusCode == 200) {
            return parseFloat(JSON.parse(res.body)[0]["price_" + currency.toLowerCase()] * amount).toFixed(2);
        }
        log.error(res.statusCode + " - " + res.body);
        return null;
    }
}
