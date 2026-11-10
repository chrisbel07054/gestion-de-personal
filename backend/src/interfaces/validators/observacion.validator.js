const Joi = require('joi');

const crearSchema = Joi.object({
  texto: Joi.string().min(1).required(),
});

module.exports = { crearSchema };
