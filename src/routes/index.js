import express from 'express';
import { v4 } from 'uuid';
import userController from '../controllers/userController';
import MTNController from '../controllers/MTNController';
import MpesaController from '../controllers/MpesaController';
import AirtelController from '../controllers/AirtelController';
import {
  ValidateApiSchema,
  isAuth,
  validateCurrency
} from '../Helpers/middlewares';
import { register, login } from '../apiSchema/users';
import { c2b, b2c } from '../apiSchema/transaction';

const routes = express.Router();

/* GET home page. */
routes.get('/', (req, res, next) => {
  console.log(req.headers);
  // let data =req.headers['x-forwarded-for'] +"  " +req.connection.remoteAddress;
  console.log(req.statusCode);
  return res.json({ uuid: v4() });
});
routes.post('/register', ValidateApiSchema(register), userController.register);
routes.post('/login', ValidateApiSchema(login), userController.login);

// MPESA ROUTES
routes.post(
  '/mpesa/c2b',
  isAuth,
  ValidateApiSchema(c2b),
  validateCurrency,
  MpesaController.c2b
);
routes.post(
  '/mpesa/b2c',
  isAuth,
  ValidateApiSchema(b2c),
  validateCurrency,
  MpesaController.b2c
);

// MTN ROUTES
routes.post(
  '/mtn/c2b',
  isAuth,
  ValidateApiSchema(c2b),
  validateCurrency,
  MTNController.c2b
);
routes.post(
  '/mtn/b2c',
  isAuth,
  ValidateApiSchema(b2c),
  validateCurrency,
  MTNController.b2c
);
routes.get('/mtn/getbalance', MTNController.getBalance);
// routes.post('/mtn/getBalance',isAuth,ValidateApiSchema(b2c),validateCurrency,MTNController.b2c)

// Airtel routes
routes.post(
  '/airtel/c2b',
  isAuth,
  ValidateApiSchema(c2b),
  validateCurrency,
  AirtelController.c2b
);
routes.post('/airtel/callback', AirtelController.callback);
routes.post(
  '/airtel/b2c',
  isAuth,
  ValidateApiSchema(b2c),
  validateCurrency,
  AirtelController.b2c
);
routes.get('/airtel/getbalance', isAuth, AirtelController.getBalance);
// WEBHOOKS
routes.post('/mpesa/b2c');
routes.put('/webhook', (req, res, next) => {
  let data = req.body;
  console.log(req.body)
  if (data.input_ResultCode === 'INS-0') {
    const formattedData = {
      ResponseCode: data.output_ResultCode,
      ThirdPartyConversationID: data.input_ThirdPartyConversationID,
      TransactionID: data.input_TransactionID,
      ResponseDesc: data.input_ResultDesc,
      ConversationID: data.input_OriginalConversationID
    };

    emitter.emit('MPESASuccess', formattedData);
    emitter.emit('InitiateCoinTransaction', c2bInstance);
    let obj =
    {
      "output_OriginalConversationID": data.input_OriginalConversationID,
      "output_ResponseCode": data.output_ResultCode,
      "output_ResponseDesc": "Successfully Accepted Result",
      "output_ThirdPartyConversationID": data.input_ThirdPartyConversationID
    }
    return res.json(obj);
  }
  else if (data.status === 'SUCCESSFUL') {
    const formattedData = {
      ResponseCode: 200,
      ThirdPartyConversationID: data.externalId,
      TransactionID: data.financialTransactionId,
      ResponseDesc: data.status,
      ConversationID: data.financialTransactionId
    };

    emitter.emit('MPESASuccess', formattedData);
    emitter.emit('InitiateCoinTransaction', c2bInstance);
    return res.status(200).end()
  }
});

export default routes;
