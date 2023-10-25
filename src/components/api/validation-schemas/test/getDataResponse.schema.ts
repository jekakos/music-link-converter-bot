import Joi from 'joi';

const dataSchema = Joi.object({
  name: Joi.string().required(),
  questionnaire: Joi.array().required(),
});

export const responseSchema = Joi.alternatives().try(
  dataSchema,
  Joi.valid(null),
);
