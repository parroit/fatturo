'use strict';

var schema = require('../lib/schema');
var jsis = require('../lib/schema-immstruct');

var chai = require('chai');
chai.should();
var expect = chai.expect;

var cliente = jsis(
    'cliente', {
        firstName: schema.string().required(),
        surname: schema.string(),
        age: schema.integer().default(40),
    }, {
        fullName: function() {

            return this.firstName + ' ' + this.surname;
        }
    }
);


describe('jsis', function() {
    it('is defined', function() {
        jsis.should.be.a('function');
    });

    it('return a constructor', function() {
        cliente.should.be.a('function');
    });

    it('has displayName', function() {
        cliente.displayName.should.equal('cliente');
    });


    describe('when called', function() {
        var c;
        before(function() {
            c = cliente({
                firstName: 'Andrea',
                surname: 'Parodi',
                unknown: 'field'
            });

        });

        it('throws on invalid data supplied', function() {
            expect(function() {
                cliente({
                    age: 22
                });
            }).to.throws(Error);
        });

        it('return an object', function() {
            c.should.be.a('object');
        });

        it('with default applied', function() {
            c.age.should.equal(40);
        });

        it('is immutable', function() {
            expect(function() {
                c.age = 42;
            }).to.throws(Error);
        });

        it('with field setted', function() {
            c.firstName.should.equal('Andrea');
        });

        it('with prototype properties applied', function() {
            c.fullName.should.equal('Andrea Parodi');
        });


    });



});
