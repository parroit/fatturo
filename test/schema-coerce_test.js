'use strict';

var schema = require('../lib/schema');
var coerce = require('../lib/schema-coerce');

require('chai').should();

var cliente = schema('cliente', {

    name: schema.string(),

    age: schema.integer(),

    available: schema.boolean(),

    weight: schema.number(),

    address: schema('address', {
        city: schema.string(),
        zip: schema.number(),
    }),

    emails: schema.array(schema('email', {
        domain: schema.string()

    }))

});


describe('coerce', function() {
    it('is defined', function() {
        coerce.should.be.a('function');
    });


    it('coerce values to proper types', function() {
        var c = {

            name: 42,

            age: '1000.12',

            available: 'true',

            weight: '1000.12',

            address: {
                city: 42,
                zip: '42000'
            },

            emails: [{
                domain: 42
            }, {
                domain: 43
            }]
        };

        var c2 = coerce(c, cliente.content);

        c2.should.deep.equal({
            _id: null,
            _rev: null,
            name: '42',
            type: null,
            age: 1000,

            available: true,

            weight: 1000.12,

            address: {
                _id: null,
                _rev: null,
                type: null,
                city: '42',
                zip: 42000
            },

            emails: [{
                _id: null,
                _rev: null,
                type: null,
                domain: '42'
            }, {
                _id: null,
                _rev: null,
                type: null,
                domain: '43'
            }]
        });

    });

});
