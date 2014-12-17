'use strict';

var JSV = require('JSV').JSV;
var Generator = require('json-schema-random-instance');
var jsonTypes = ['boolean', 'integer', 'number', 'null', 'object', 'string'];
var env = JSV.createEnvironment();
var defaults = require('json-schema-defaults');
var filter = require('json-schema-filter');


function Schema(id, props) {
    this.content = {
        type: 'object',
        $schema: 'http://json-schema.org/draft-03/schema',
        id: 'http://github.com/parroit/schema/' + id,
        required: true,
        properties: {}
    };

    this.generator = null;

    var _this = this;
    if (typeof props === 'object') {
        Object.keys(props).forEach(function(name) {
            _this.property(name, props[name]);
        });
    }
}

Schema.prototype.validate = function(value) {
    return env.validate(value, this.content).errors;
};


Schema.prototype.random = function(value) {
    if (this.generator === null) {
        var schema = JSON.parse(JSON.stringify(this.content));
        this.generator = new Generator(schema);
    }

    return this.generator.generate();
};


Schema.prototype.build = function() {

    var result = defaults(this.content);
    return result;
};

Schema.prototype.property = function(name, type) {
    if (type instanceof Schema) {
        this.content.properties[name] = type.schema();
    } else {
        this.content.properties[name] = type.render(name);
    }

    return this;
};


Schema.prototype.from = function(value) {
    return filter(this.content, value);
};

Schema.prototype.schema = function() {
    return this.content;
};

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
