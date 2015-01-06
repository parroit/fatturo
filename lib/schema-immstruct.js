'use strict';

module.exports = jsis;

var assign = require('object-assign');
var schema = require('./schema');
var imm = require('immutable');
/**
 * Create a new constructor function that instantiate ojects 
 * based on given JSON schema properties, using given prototype.
 * Object instance will be backed by immstruct
 * 
 * @param  id {String}  name of schema
 * @param  props {Object} schema fields, passed to schemata
 * @param  proto {[Object]} function prototype
 * @return {Function} new constructor function
 */
function jsis(id, props, proto) {
    var s = schema(id,props);


    var fieldNames = Object.keys(s.content.properties);
    var defaults = {};
    fieldNames.forEach(function(name) {
        var field = s.content.properties[name];
        var defaultValue = field.default || null;
        defaults[name] = defaultValue;
    });

    

    var Constructor = imm.Record(defaults);

    function Clazz(value){
        if (! (this instanceof Clazz)) {
            return new Clazz(value);
        }
        var errors = s.validate(value);
        if (errors.length) {
            var err = new Error('Invalid data provided. See errors property');
            err.errors = errors;
            throw err;

        }
        Constructor.call(this,value);
    }

    Clazz.prototype = new Constructor();

    Object.keys(proto).forEach(function(name){
        Object.defineProperty (Clazz.prototype,name,{
            get: proto[name]
        });    
    });
    
    Clazz.displayName = id;

    return Clazz;
}