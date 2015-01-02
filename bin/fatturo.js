#!/usr/bin/env node

'use strict';

var path = require('path');
var program = require('commander');
var readJson = require('read-package-json');
var winston = require('winston');
var cliff = require('cliff');
var fs = require('fs');
var actions = require('../model/couch-sync');
var nconf = require('nconf');
var optimist = require('optimist');

winston.level = 'debug';
winston.cli();

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function setOption(short, long, value, description) {
    program.option(
        '-' + short + ', --' + long + ' <' + value + '>',
        description
    );

    optimist
        .demand(short)
        .alias(short, long)
        .describe(short, description);
}

function runProgram(er, data) {
    if (er) {
        winston.error('There was an error reading the package.json file:\n\n' + er.stack);
        return;
    }



    program.info = data;
    program.version(data.version);




    setOption(
        'r', 'remote-couch-uri', 'uri',
        'Remote couch db uri.'
    );

    setOption(
        'u', 'remote-couch-usr', 'username',
        'Remote couch db username.'
    );

    setOption(
        'p', 'remote-couch-pwd', 'password',
        'Remote couch db password.'
    );

    setOption(
        'y', 'filter-by-year', 'year',
        'filter bills by year'
    );


    program.command('sync')
        .description('Syncronize a remote couch db.')
        .action(actions.couchSync);

    program.command('init')
        .description('Create a local db.')
        .action(actions.init);

    program.command('list')
        .description('List all local bills.')
        .action(actions.list);

    program.command('correct')
        .description('Correct check, and save all local bills.')
        .action(actions.correct);

    program.command('random')
        .description('create a bill instance that contains random values.')
        .action(actions.random);


    
    nconf.env().argv();
    nconf.file(getUserHome() + '/.fatturorc');

    program.parse(process.argv);


    if (!program.args.length) {
        program.help();
    }
    


}

readJson(__dirname+'/../package.json', winston.error, false, runProgram);
