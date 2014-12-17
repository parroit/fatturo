'use strict';

var schema = require('../lib/schema');

require('chai').should();

var cliente = schema('cliente')
    .property('ragione_sociale', schema.string()
        .maxLength(20)
        .minLength(10)
    )
    .property('indirizzo', schema.string().required())
    .property('fatture', schema.integer())
    .property('codice', schema.string().pattern('\\d\\d\\/\\d\\d\\d\\d').default('23/2014'))
    .property('iva', schema.integer().required().default(22)
        .maximum(100).exclusiveMaximum(false)
        .minimum(0).exclusiveMinimum(true)
    )
    .property('fatturato', schema.integer().multipleOf(1000));

var cliente2 = schema('cliente', {
    ragione_sociale: schema.string()
        .maxLength(20)
        .minLength(10),

    indirizzo: schema.string().required(),

    fatture: schema.integer(),

    codice: schema.string()
        .pattern('\\d\\d\\/\\d\\d\\d\\d')
        .default('23/2014'),

    iva: schema.integer()
        .required().default(22)
        .maximum(100).exclusiveMaximum(false)
        .minimum(0).exclusiveMinimum(true),

    fatturato: schema.integer().multipleOf(1000)
});


var expectedSchema = {
    $schema: 'http://json-schema.org/draft-03/schema',
    id: 'http://github.com/parroit/schema/cliente',
    properties: {
        codice: {
            default: '23/2014',
            id: '/codice',
            pattern: '\\d\\d\\/\\d\\d\\d\\d',
            required: false,
            type: 'string'
        },
        fatturato: {
            id: '/fatturato',
            multipleOf: 1000,
            required: false,
            type: 'integer',
        },
        indirizzo: {
            id: '/indirizzo',
            required: true,
            type: 'string'
        },
        fatture: {
            id: '/fatture',
            required: false,
            type: 'integer'
        },
        ragione_sociale: {
            id: '/ragione_sociale',
            maxLength: 20,
            minLength: 10,
            required: false,
            type: 'string'
        },
        iva: {
            default: 22,
            exclusiveMaximum: false,
            exclusiveMinimum: true,
            id: '/iva',
            maximum: 100,
            minimum: 0,
            required: true,
            type: 'integer'
        }
    },
    required: true,
    type: 'object'
};

describe('schema', function() {
    it('is defined', function() {
        schema.should.be.a('function');
    });

    it('return schema object', function() {
        schema().should.be.a('object');
    });

    it('return json schema', function() {
        var result = cliente.schema();
        //console.dir(result)
        result.should.be.deep.equal(expectedSchema);
    });

     it('return json schema with object properties', function() {
        var result = cliente2.schema();
        //console.dir(result)
        result.should.be.deep.equal(expectedSchema);
    });

    it('validate unvalid instance return errors', function() {
        var result = cliente.validate({
            ragione_sociale: 42
        });

        result.forEach(function(err) {
            delete err.uri;
        });

        result.should.be.deep.equal([{
            schemaUri: 'http://github.com/ragione_sociale#',
            attribute: 'type',
            message: 'Instance is not a required type',
            details: ['string']
        }, {
            schemaUri: 'http://github.com/indirizzo#',
            attribute: 'required',
            message: 'Property is required',
            details: true
        }, {
            schemaUri: 'http://github.com/iva#',
            attribute: 'required',
            message: 'Property is required',
            details: true
        }]);
    });

    it('validate valid instance', function() {
        var result = cliente.validate({
            ragione_sociale: 'Parodi Software',
            iva: 20,
            indirizzo: 'viale dei giardini'
        });
        result.should.be.deep.equal([]);
    });

    it('random create test instance', function() {
        var result = cliente.random();
        result.ragione_sociale.should.be.a('string');
        result.fatture.should.be.a('number');
    });

    it('build create instance from defaults', function() {
        cliente.schema().type.should.equal('object');
        var result = cliente.build();
        result.should.be.deep.equal({
            codice: '23/2014',
            iva: 22
        });
    });
});
