'use strict';

var JSV = require('JSV').JSV;
var Generator = require('json-schema-random-instance');
var jsonTypes = ['boolean', 'integer', 'number', 'null', 'object', 'string'];
var env = JSV.createEnvironment();
var defaults = require('json-schema-defaults');
var filter = require('json-schema-filter');

/**
 * Construct a new Schema Object
 * @param id {String} name of the  schema
 * @param props {[Object]} an object describing the fields of this schema
 */
function Schema (id, props) {
    this.content = {
        type: 'object',
        $schema: 'http://json-schema.org/draft-03/schema',
        id: 'http://github.com/parroit/schema/' + id,
        required: true,
        properties: {}
    };

    this.generator = null;

    var _this = this;

    _this.property('_id', types.string());
    _this.property('_rev', types.string());
    _this.property('type', types.string().default(id));

    if (typeof props === 'object') {
        Object.keys(props).forEach(function(name) {
            _this.property(name, props[name]);
        });
    }
}

/**
 * validate given object against the json schema
 * @param  value {Object} the value to validate
 * @return {Array} an empty array if value is valid, 
 * or an array containing all validation errors
 */
Schema.prototype.validate = function(value) {
    return env.validate(value, this.content).errors;
};

/**
 * create an object instance based on this schema that  
 * contains random values. 
 * @return {Object} random object instance
 */
Schema.prototype.random = function() {
    if (this.generator === null) {
        var schema = JSON.parse(JSON.stringify(this.content));
        this.generator = new Generator(schema);
    }

    return this.generator.generate();
};

/**
 * create an empty object instance with fields eventually 
 * filled based on their default values. 
 * @return {Object} new object instance
 */
Schema.prototype.build = function() {

    var result = defaults(this.content);
    return result;
};

/**
 * create an object instance with fields 
 * filled with properties of given object.
 * 1) value param is filtered against the json 
 *      schema, unknown fields are removed
 * 2) filtered object is validated against the schema. 
 *      An exception is thrown if value is not valid, 
 *      containing all validation errors
 *      
 * @param  value {Object} the object containing values for fields
 * @return {Object} new object instance
 */
Schema.prototype.from = function(value) {
    return filter(this.content, value);
};

/**
 * Add a field to the schema after it's created
 * @param  name {String}    name of field to add
 * @param  type {Object}    type of object. must be one of 
 *      schema.types, or another schema instance
 * @return {Schema} return this to allow chaining calls
 */
Schema.prototype.property = function(name, type) {
    if (type instanceof Schema) {
        this.content.properties[name] = type.schema();
    } else {
        this.content.properties[name] = type.render(name);
    }

    return this;
};

/**
 * return the json schema contained in this instance
 * @return {[type]}
 */
Schema.prototype.schema = function() {
    return this.content;
};

/**
 * Construct a new Schema Object
 * @param id {String} name of the  schema
 * @param props {[Object]} an object describing the fields of this schema
 */
function schema(id, props) {
    return new Schema(id, props);
}


var types = {};
var TypeProto = {
    render: function(name) {
        this.content.id = '/' + name;
        return this.content;
    }
};

function mkType(typeName) {
    types[typeName] = function() {
        if (!(this instanceof types[typeName])) {
            return new types[typeName]();
        }
        this.content = {
            type: typeName,
            required: false
        };
    };

    types[typeName].prototype = Object.create(TypeProto);
    types[typeName].displayName = typeName;

    schema[typeName] = types[typeName];
}

types.array = function(itemsSchema) {
    if (!itemsSchema) {
        throw new TypeError('missing itemsSchema argument');
    }
    if (!(this instanceof types.array)) {
        return new types.array(itemsSchema);
    }

    var items;
    if (itemsSchema instanceof Schema) {
        items = itemsSchema.schema();
    } else {
        items = itemsSchema;
    }
    this.content = {
        items: items,
        type: 'array',
        required: false
    };
};

types.array.prototype = Object.create(TypeProto);
types.array.displayName = 'array';

schema.array = types.array;

jsonTypes.forEach(mkType);
var allTypes = jsonTypes.map(function(typeName) {
    return types[typeName];
}).concat(types.array);


function mkModifier(types, name, defaultValue) {
    types.forEach(function(type) {
        function modifier(value) {
            //jshint validthis:true
            this.content[name] = value === undefined ? defaultValue : value;
            return this;
        }

        modifier.displayName = name;
        type.prototype[name] = modifier;

    });
}



var numberTypes = [types.integer, types.number];

mkModifier(allTypes, 'required', true);
mkModifier(allTypes, 'default');

mkModifier(numberTypes, 'multipleOf');
mkModifier(numberTypes, 'maximum');
mkModifier(numberTypes, 'exclusiveMaximum', true);
mkModifier(numberTypes, 'minimum');
mkModifier(numberTypes, 'exclusiveMinimum', true);

mkModifier([types.string], 'maxLength');
mkModifier([types.string], 'minLength');
mkModifier([types.string], 'pattern');


module.exports = schema;
