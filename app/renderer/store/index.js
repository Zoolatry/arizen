import Vue from 'vue'
import Vuex from 'vuex'
import path from "path"
import url from "url"
import os from "os"
import fs from "fs-extra"
import passwordHash from "password-hash"
import crypto from "crypto"
import bitcoin from "bitcoinjs-lib"
import bip32utils from "bip32-utils"
import zencashjs from "zencashjs"
import sql from "sql.js"
import encryption from "encryption"
import api from "api"
import log from "js-vue-logger"

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
        fiatBalance: 0,
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
        addAddress (state, addr) {
            var existing = state.addresses.find(a => a.address == addr.address);
            if (existing == null) {
                state.addresses.push(addr);
            }
        },
        setAddressBalance(state, obj) {
            state.addresses.find(a => a.address == obj.address).balance = obj.balance;
        },
        setAddresses (state, list) {
            state.addresses = list;
        },
        clearAddress (state) {
            state.addresses = [];
        },
        setTotalBalance (state, b) {            
            state.totalBalance = b;
        },
        setFiatBalance (state, b) {         
            state.fiatBalance = b;
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
        addTransaction (state, tx) {
            if (state.transactions.find(t => t.txid == tx.txid) == null) {
                state.transactions.push(tx);
            }
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
        async refreshTransactions({ commit }) {
            log.info("refreshing transactions");
            
        },
        async refreshBalances({ commit }) {
            log.info("refreshing balances");

            var totalBalance = 0;
            for (var i in this.state.addresses) {
                var item = this.state.addresses[i];
                var balance = await api.getBalance(item.address);

                totalBalance += balance;
                commit('setAddressBalance', { address: item.address, balance: balance });
            }
            commit('setTotalBalance', totalBalance);
            var fiat = await api.getFiat(totalBalance, "USD");
            commit('setFiatBalance', fiat);
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
                log.info("Found private key file: " + jsonPath);

                var result = encryption.readEncryptedObject(jsonPath, this.state.username, this.state.password);
                if (result != null) {
                    var addressList = [];
                    result.forEach(item => {
                        log.info("Found address: " + item.address + " " + item.name);
                        addressList.push({
                          pk: item.pk,
                          address: item.address,
                          balance: item.balance,
                          name: item.name
                        });
                    });
                    commit('setAddresses', addressList);
                    commit('setLoggedIn', true);
                }
            }
            else if (fs.existsSync(awdPath)) {
                log.info("Found old AWD file: " + awdPath);
                log.info("Trying to migrate to JSON");
                
                var result = encryption.readEncryptedBytes(awdPath, this.state.username, this.state.password);
                if (result != null) {
                    var addressList = [];

                    var db = new sql.Database(result);
                    var queryRes = db.exec("select * from wallet");
                    var rows = [];
                    queryRes[0].values.map(columns => {
                        var obj = {};
                        for (let i = 0; i < columns.length; i++) {
                            obj[queryRes[0].columns[i]] = columns[i];
                        }
                        rows.push(obj);
                    });
                    for (let r of rows) {
                        var pk = r.pk;
                        var address = r.addr;
                        var name = "";
                        if ("name" in r) {
                            name = r.name;
                        }
                        log.info("Found address: " + address + " " + name);
                        addressList.push({
                            pk: pk,
                            address: address,
                            balance: 0,
                            name: name
                        });
                    }
                    commit('setAddresses', addressList);
                    this.dispatch('saveAddresses');
                    fs.moveSync(awdPath, this.getters.getObsoletePath);
                    commit('setLoggedIn', true);
                }
            }
            else {
                log.warn("private key file not found: " + jsonPath);
            }
        },
        saveAddresses({ commit }) {
            log.info("saving addresses to json file");
            var jsonPath = this.getters.getPrivateKeyFilePath;

            encryption.writeObjectEncrypted(this.state.addresses, jsonPath, this.state.username, this.state.password);
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
