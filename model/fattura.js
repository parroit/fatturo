'use strict';

var schema = require('../lib/schema');
var cliente = require('./cliente');

var rigaFattura = schema('rigaFattura',{
        description: schema.string(),
        prezzoCadauno: schema.number(),
        quantita: schema.number().default(1),
        numeroRiga: schema.number()
    }
);
module.exports = schema('fattura',{
    date: schema.integer()
        .default(new Date().setHours(0,0,0,0)),
    //articoloIva: schema.object(),
    cliente: cliente,
    anno: schema.integer()
        .default(new Date().getFullYear()),
    pagata: schema.boolean(),
    formattedCode: schema.string(),
    description: schema.string(),
    //pagamento: schema.object(),
    righe: schema.array(rigaFattura),
    applicaRivalsaInps: schema.boolean(),
    applicaRitenutaAcconto: schema.boolean(),
    proForma: schema.boolean()


});

