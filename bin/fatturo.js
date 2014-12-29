#!/usr/bin/env node

'use strict';

var path = require('path');
var program = require('commander');
var relativePackage = require('relative-package');
var readJson = require('read-package-json');
var winston = require('winston');
var cliff = require('cliff');
var fs = require('fs');
var couchSync = require('../model/couch-sync');


winston.level = 'debug';
winston.cli();



function runProgram(er, data) {
    if (er) {
        winston.error('There was an error reading the file ' + packagePath + '\n\n' + er.stack);
        return;
    }
    program.info = data;
    program.version(data.version);


    program.command('sync')
        .description('Syncronize a remote couch db.')
        .action(couchSync);

/*
    program.option(
        '-o, --output <filename>',
        'Write output to specified file. ' +
        'Default to current module name.'
    );
*/
   
    program.parse(process.argv);


    if (!program.args.length) {
        program.help();
    }

}

var packagePath = relativePackage(process.cwd());
if (!fs.existsSync(packagePath)) {
    winston.error('Cannot find package.json.');
} else {
    readJson(packagePath, winston.error, false, runProgram);    
}