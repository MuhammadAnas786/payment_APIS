import Joi from 'joi';
import JoiMsisdnExt from 'joi-extension-msisdn';

export const c2b = Joi.object()
  .keys({
    CustomerMSISDN: Joi.string().required(),
    coin: Joi.string().required(),
    currency: Joi.string().required(),
    serviceCharges: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    discount: Joi.number().required(),
    userCoinAddress: Joi.string().required(),
    totalCoins: Joi.number().required()
  })
  .unknown(true);
export const b2c = Joi.object()
  .keys({
    CustomerMSISDN: Joi.string().required(),
    coin: Joi.string().required(),
    currency: Joi.string().required(),
    serviceCharges: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    discount: Joi.number().required()
    // transactionRefference:Joi.number()
  })
  .unknown(true);
