'use strict';

var cliff = require('cliff');
var cliente = require('./model/cliente');
var fattura = require('./model/fattura');

var couch = require('couch-db');
var server = couch('https://couchdb.ebansoftware.net/', {
    rejectUnauthorized: false // this will pass to request
});

server.auth('parroit', process.env.couch_pwd);

var db = server.database('billy');

db.allDocs({
    include_docs: true
}, function(err, result) {
    if (err) {
        return console.error(err);
    }
  
    result.filter(function(d) {
            return d.doc.type === 'fattura';
        })
        .map(function(d) {
            return d.doc;
        })
        .forEach(function(d) {
            var errors = fattura.validate(d);
            if (errors.length) {
                return console.dir(errors);    
            }

            console.log(cliff.inspect(fattura.from(d)));
            
        });
});

server.logout(function(err) {
    if (err) {
        return console.error(err);
    }
});
