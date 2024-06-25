import * as Joi from 'joi';
import { Config } from './config.interface';

export default (): Config => ({
  SECRET_KEY: process.env.SECRET_KEY,
  // Ajoutez d'autres variables d'environnement ici
});

// Validation de la configuration avec Joi
export const validationSchema = Joi.object({
  SECRET_KEY: Joi.string().required(),
  // Ajoutez d'autres validations ici
});
