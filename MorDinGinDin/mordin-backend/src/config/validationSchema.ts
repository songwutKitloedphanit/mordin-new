import * as Joi from 'joi';

export const validationSchema = Joi.object({
  QR_SECRET: Joi.string().min(32).required(),
});
