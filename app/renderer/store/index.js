import Vue from 'vue'
import Vuex from 'vuex'
import path from "path";
import url from "url";
import os from "os";
import fs from "fs-extra";
import passwordHash from "password-hash";
import crypto from "crypto";
import bitcoin from "bitcoinjs-lib";
import bip32utils from "bip32-utils";
import zencashjs from "zencashjs";
import sql from "sql.js";
import request from "request";
import fetch from "node-fetch";

import modules from './modules'

const app = require("electron").remote.app;

Vue.use(Vuex)
let vue = new Vue()

export default new Vuex.Store({
    modules,
    strict: process.env.NODE_ENV !== 'production',
    state: {
        addresses: [],
        transactions: [],
        totalBalance: 0,
        unconfirmedBalance: 0,
        availableBalance :0,
        tBalance: 0,
        zBalance: 0,
        username: null,
        password: null,
        loggedIn: false
    },
    getters: {   
        tAddresses: state => {
            return state.addresses.filter(address => address.type == 't')
        },
        zAddresses: state => {
            return state.addresses.filter(address => address.type == 'z')
        },
        getPrivateKeyFilePath: (state, getters) => {
            var path = getters.getRootConfigPath + 'wallets/' + state.username + ".private.dat";
            console.log("Using private key path: " + path);
            return path;
        },
        getObsoleteAWDFilePath: (state, getters) => {
            var path = getters.getRootConfigPath + 'wallets/' + state.username + ".awd";
            console.log("Using AWD path: " + path);
            return path;
        },
        getObsoletePath: (state, getters) => {
          var path = getters.getRootConfigPath + 'wallets/old/' + state.username + ".awd";
          return path;
        },
        getRootConfigPath: state => {
            var path = null;
            if (os.platform() === "win32" || os.platform() === "darwin") {
                path = app.getPath("appData") + "/Arizen/";
            }
            else if (os.platform() === "linux") {
                path = app.getPath("home") + "/.arizen/";
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
            } else {
                console.log("Unidentified OS.");
                app.exit(0);
            }
            
            console.log("Using root config path: " + path);
            return path;
        }
    },
    mutations: {
        updateAddress (state, newAddress) {
            if (state.addresses.find( a => a.address == newAddress.address) == null) {
                state.addresses.push(newAddress)
            }
        },
        clearAddress (state) {
            state.addresses = [];
        },
        setTotalBalance (state, b) {            
            state.totalBalance = b;
        },    
        setUnconfirmedBalance (state, b) {            
            state.unconfirmedBalance = b;
        },    
        setAvailableBalance (state, b) {            
            state.availableBalance = b;
        },
        setTBalance (state, b) {            
            state.tBalance = b;
        },  
        setZBalance (state, b) {      
            state.zBalance = b;
        },
        setTransactions (state, transactions) {      
            state.transactions = transactions;
        },
        setUsername (state, username) {      
            state.username = username;
        },
        setPassword (state, password) {      
            state.password = password;
        },
        setLoggedIn (state, loggedIn) {      
            state.loggedIn = loggedIn;
        }
    },
    actions : {
        refreshTransactions({ commit }) {
            console.log("refreshing transactions");

        },
        addTAddress({ commit }) {
        
        },
        addZAddress({ commit }) {
        
        },
        login({ commit }, loginForm) {
            commit('setUsername', loginForm.username);
            commit('setPassword', loginForm.password);
            commit('setLoggedIn', false);
            
            var jsonPath = this.getters.getPrivateKeyFilePath;
            var awdPath = this.getters.getObsoleteAWDFilePath;

            // use encrypted json file if exists
            // else try to migrate old SQL-Database
            if(fs.existsSync(jsonPath)) {
                console.log("Found private key file: " + jsonPath);

                let i = Buffer.byteLength(loginForm.username);
                let inputBytes = fs.readFileSync(jsonPath);
                let recoveredLogin = inputBytes.slice(0, i).toString("utf8");
                let outputBytes = [];

                if (loginForm.username === recoveredLogin) {
                    let iv = inputBytes.slice(0, i + 64);
                    i += 64;
                    let salt = inputBytes.slice(i, i + 64);
                    i += 64;
                    let tag = inputBytes.slice(i, i + 16);
                    i += 16;
                    let encrypted = inputBytes.slice(i);
                    let key = crypto.pbkdf2Sync(loginForm.password, salt, 2145, 32, "sha512");
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
                            throw err;
                        }
                    }
                }

                if (outputBytes.length > 0) {
                    var resultJson = outputBytes.toString("utf8");
                    // console.log(resultJson);
                    var addresses = JSON.parse(resultJson);
                    addresses.forEach(item => {
                        console.log("Found address: " + item.address);
                        commit('updateAddress', {
                          pk: item.pk,
                          address: item.address,
                          balance: item.balance
                        });
                    });
                    commit('setLoggedIn', true);
                }
            }
            else if (fs.existsSync(awdPath)) {
                console.log("Found obsolete AWD file: " + awdPath);
                console.log("Trying to migrate to JSON");
                
                let i = Buffer.byteLength(loginForm.username);
                let inputBytes = fs.readFileSync(awdPath);
                let recoveredLogin = inputBytes.slice(0, i).toString("utf8");
                let outputBytes = [];

                if (loginForm.username === recoveredLogin) {
                    let iv = inputBytes.slice(0, i + 64);
                    i += 64;
                    let salt = inputBytes.slice(i, i + 64);
                    i += 64;
                    let tag = inputBytes.slice(i, i + 16);
                    i += 16;
                    let encrypted = inputBytes.slice(i);
                    let key = crypto.pbkdf2Sync(loginForm.password, salt, 2145, 32, "sha512");
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
                            throw err;
                        }
                    }
                }

                if (outputBytes.length > 0)
                {
                    var db = new sql.Database(outputBytes);
                    var result = db.exec("select pk, addr from wallet")[0];
                    result.values.forEach(row => {
                        var pk = row[0];
                        var address = row[1];
                        console.log("Found address: " + address);
                        commit('updateAddress', {
                            pk: pk,
                            address: address,
                            balance: 0
                        });
                    });
                    this.dispatch('saveAddresses');
                    fs.moveSync(awdPath, this.getters.getObsoletePath);
                    commit('setLoggedIn', true);
                }
            }
            else {
                console.log("private key file not found: " + jsonPath);
            }
        },
        saveAddresses({ commit }) {
            console.log("saving addresses to json file");
            var jsonPath = this.getters.getPrivateKeyFilePath;
            var json = JSON.stringify(this.state.addresses);

            // console.log(json);
            
            var inputBytes = Buffer.from(json, "utf8");
            // encrypt
            let iv = Buffer.concat([Buffer.from(this.state.username, "utf8"), crypto.randomBytes(64)]);
            let salt = crypto.randomBytes(64);
            let key = crypto.pbkdf2Sync(this.state.password, salt, 2145, 32, "sha512");
            let cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
            let encrypted = Buffer.concat([cipher.update(inputBytes), cipher.final()]);

            var data = Buffer.concat([iv, salt, cipher.getAuthTag(), encrypted]);

            fs.writeFileSync(jsonPath, data, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        },
        logout({ commit }) {
            console.log("logging out");
            commit('setLoggedIn', false);
            commit('clearAddress');
            commit('setUsername', null);
            commit('setPassword', null);
        },
    }
})
