'use strict';

var schema = require('../lib/schema');


module.exports = schema('tipoPagamento',{
    description: schema.string(),
    giorni: schema.number().default(30),
    fineMese: schema.boolean().default(false)
});
