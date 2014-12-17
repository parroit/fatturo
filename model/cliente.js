'use strict';

var schema = require('../lib/schema');

module.exports = schema('cliente',{
    description: schema.string(),
    secondaDescrizione: schema.string(),
    indirizzo: schema.string(),
    cap: schema.string(),
    comune: schema.string(),
    provincia: schema.string(),
    partitaIva: schema.string(),
    codiceFiscale: schema.string(),
    fornitore: schema.boolean(),
    cliente: schema.boolean().default(true)
    
});

