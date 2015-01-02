'use strict';

var winston = require('winston');
var cliff = require('cliff');
var PouchDB = require('pouchdb');
var winston = require('winston');
var auth = require('pouch-auth');
PouchDB.plugin(auth);
var nconf = require('nconf');
var coerce = require('../lib/schema-coerce');

module.exports = {
    couchSync: function couchSync() {
        winston.info('Synchronize remote db');
        var remoteCouch = nconf.get('r');
        var remoteUser = nconf.get('u');
        var remotePassword = nconf.get('p');

        winston.info('Using remote ' + remoteCouch);

        var db = new PouchDB('fatturo-db');
        var remote = new PouchDB(remoteCouch, {
            ajax: {
                strictSSL: false
            }
        });

        winston.info('Login to remote db');
        remote.login(remoteUser, remotePassword)

        .then(function(loggedinRemote) {
            winston.info('Loggedin as ' + loggedinRemote.user.name);
            var sync = db.sync(loggedinRemote);
            sync.on('error', function(err) {
                winston.error('Cannot sync remote db:\n\n' + err);
            });

            sync.on('complete', function(info) {
                winston.info('Remote db synchronized successfully.');
                winston.info(cliff.inspect(info));
            });

        })

        .catch(function(err) {
            winston.error('Cannot login to remote db:\n\n' + err);
        });


    },

    list: function list() {
        var fattura = require('./fattura');

        var db = new PouchDB('fatturo-db');
        var year = nconf.get('y');

        db.allDocs({
                include_docs: true
            })
            .then(function(result) {


                result.rows.filter(function(d) {
                        return d.doc.type === 'fattura' && (!year || d.doc.anno == year);
                    })
                    .map(function(d) {
                        return fattura.from(d.doc);
                    })
                    .forEach(function(d) {


                        winston.info(cliff.inspect(d));

                    });
            })
            .catch(function(err) {
                winston.error('Cannot list bills:\n\n' + err.stack);
            });

    },

    random: function list() {
        var fattura = require('./fattura');


        winston.info(cliff.inspect(fattura.random()));

    },


    correct: function correct() {
        var fattura = require('./fattura');

        var db = new PouchDB('fatturo-db');
        var year = nconf.get('y');

        db.allDocs({
                include_docs: true
            })
            .then(function(result) {


                result.rows.filter(function(d) {
                        return d.doc.type === 'fattura' && (!year || d.doc.anno == year);
                    })
                    .map(function(d) {
                        return fattura.from(coerce(d.doc, fattura.content));
                    })
                    .forEach(function(d) {

                        var errors = fattura.validate(d);
                        if (errors.length) {
                            winston.error(cliff.inspect(errors));
                            return winston.info(cliff.inspect(d));
                        }

                        db.put(d)
                            .then(function() {
                                winston.info(d.formattedCode + ' saved');
                            })
                            .catch(function(err) {
                                winston.error('Cannot save bill:\n\n' + err.stack);
                            });


                    });
            })
            .catch(function(err) {
                winston.error('Cannot list bills:\n\n' + err.stack);
            });

    },

    init: function init() {
        winston.info('Create locale db');
        var db = new PouchDB('fatturo-db');
        winston.info('Locale db created');
    },

};
