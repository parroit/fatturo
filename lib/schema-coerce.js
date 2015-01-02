'use strict';
module.exports = coerce;

var coercers = {
    boolean: coercePrimitive(Boolean),
    number: coercePrimitive(Number),
    string: coercePrimitive(String),
    object: coerce,
    array: function(value, schema) {
        var itemSchema = schema.items;
        return value.map(function(v) {
            return coerce(v, itemSchema);
        });
    },
    integer: function(value) {
        if (value === null || value === undefined) {
            return null;
        }

        return Number(value) | 0;
    }
};

function coercePrimitive(primitive) {
    return function(value) {
        if (value === null || value === undefined) {
            return null;
        }

        return primitive(value);
    };
}

function coerce(value, schema) {
    if (value === null || value === undefined) {
        return null;
    }
    var fieldNames = Object.keys(schema.properties);
    var result = {};
    fieldNames.forEach(function(name) {
        var field = schema.properties[name];
        //console.dir(field);
        var coercer = coercers[field.type];
        result[name] = coercer(value[name], field);
    });
    return result;
}
