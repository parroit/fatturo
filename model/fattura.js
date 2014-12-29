'use strict';

var schema = require('../lib/schema');
var cliente = require('./cliente');
var articoloIva = require('./articolo-iva');
var tipoPagamento = require('./tipo-pagamento');

var rigaFattura = schema('rigaFattura', {
    
    description: schema.string(),

    prezzoCadauno: schema.number(),

    quantita: schema.number().default(1),

    numeroRiga: schema.number()
});

module.exports = schema('fattura', {
    formattedCode: schema.string(),

    description: schema.string(),

    date: schema.integer()
        .default(new Date().setHours(0, 0, 0, 0)),

    cliente: cliente,

    righe: schema.array(rigaFattura),


    anno: schema.integer()
        .default(new Date().getFullYear()),

    articoloIva: articoloIva,


    pagata: schema.boolean(),

    pagamento: tipoPagamento,


    applicaRivalsaInps: schema.boolean(),

    applicaRitenutaAcconto: schema.boolean(),

    proForma: schema.boolean()

});
