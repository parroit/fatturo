'use strict';

var schema = require('../lib/schema');



module.exports = schema('articoloIva',{
    clausolaStampa: schema.string(),
    percentuale: schema.number().default(20),
    description: schema.string()
});
