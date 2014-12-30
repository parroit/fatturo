'use strict';

var winston = require('winston');
var cliff = require('cliff');
var PouchDB = require('pouchdb');
var winston = require('winston');
var auth = require('pouch-auth');
PouchDB.plugin(auth);
var nconf = require('nconf');

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

        db.allDocs({include_docs: true})
            .then(function(result) {
                

                result.rows.filter(function(d) {
                        return d.doc.type === 'fattura' && (!year || d.doc.anno == year);
                    })
                    .map(function(d) {
                        return d.doc;
                    })
                    .forEach(function(d) {
                        d.righe.forEach(function(r){
                            r.prezzoCadauno = Number(r.prezzoCadauno);
                            r.quantita = Number(r.quantita);
                            r.numeroRiga = Number(r.numeroRiga);
                        });
                        d.articoloIva.percentuale = Number(d.articoloIva.percentuale);
                        d.pagamento.giorni = Number(d.pagamento.giorni);
                        d.pagamento.fineMese = Boolean(d.pagamento.fineMese);
                        d.cliente.cliente = Boolean(d.cliente.cliente);
                        d.cliente.fornitore = Boolean(d.cliente.fornitore);
                        d.applicaRivalsaInps = Boolean(d.applicaRivalsaInps);

                        var errors = fattura.validate(d);
                        if (errors.length) {
                            winston.error(cliff.inspect(errors));
                            return winston.info(cliff.inspect(d));
                        }

                        winston.info(cliff.inspect(fattura.from(d)));

                    });
            })
            .catch(function(err) {
                winston.error('Cannot login to remote db:\n\n' + err);
            });
            
    },

    init: function init() {
        winston.info('Create locale db');
        var db = new PouchDB('fatturo-db');
        winston.info('Locale db created');
    },

};
