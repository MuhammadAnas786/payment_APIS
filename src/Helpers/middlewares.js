import jwt from 'jsonwebtoken';
import { response } from '../controllers/response';
import { resmessage } from './constants';
import { UserModel } from '../Data/users';
import { CoinModel } from '../Data/coin';
import { CurrencyModel } from '../Data/currency';

const jwt_key = 'KOidFxnBUFjFbtRKPMkwGeiT5r8sgjXQWAMCNMQlV';

export const ValidateApiSchema = (schema) => (req, res, next) => {
  const error = check(req.body, schema);
  if (error) {
    return response(res, 400, {
      message: resmessage.validation_error,
      error
    });
  }
  next();
};

export const isAuth = async (req, res, next) => {
  if (req.path === '/token') {
    return next();
  }

  const authHeader = extractHeader(req);
  const secret = jwt_key;
  console.log(authHeader);
  if (!authHeader) {
    console.log(`UN-AUTHORIZED ACCESS | ${req.path}`);
    return response(res, 403, {
      Code: 403,
      Message: resmessage.un_authorized_access
    });
  }
  const token = authHeader;
  let decodedToken = '';

  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    console.log(`UN-AUTHORIZED ACCESS | TOKEN ERROR | ${req.path}`);
    return response(res, 403, {
      Code: 403,
      Message: resmessage.un_authorized_access
    });
  }

  if (!decodedToken) {
    console.log(`UN-AUTHORIZED ACCESS | TOKEN ERROR | ${req.path}`);
    return response(res, 403, {
      Code: 403,
      Message: resmessage.un_authorized_access
    });
  }
  try {
    const validate_user = await UserModel.findOne({
      _id: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.userRole
    });
    // console.log(validate_user)
    if (validate_user) {
      req.body.user = decodedToken.userId;
      req.body.role = decodedToken.userRole;
      req.body.email = decodedToken.email;
      next();
    } else
      return response(res, 403, {
        Code: 403,
        Message: resmessage.un_authorized_access
      });
  } catch (err) {
    return response(res, 404, {
      Code: 404,
      Message: resmessage.something_wrong,
      error: err
    });
  }
};
export const validateCurrency = async (req, res, next) => {
  const { coin, currency } = req.body;
  try {
    const validate_coin = await CoinModel.findOne({
      $or: [
        { name: coin.trim(), isActive: true },
        { label: coin.trim(), isActive: true },
        { symbol: coin.trim(), isActive: true }
      ]
    });
    const validate_currency = await CurrencyModel.findOne({
      $or: [
        { name: currency.trim(), isActive: true },
        { label: currency.trim(), isActive: true },
        { symbol: currency.trim(), isActive: true }
      ]
    });
    // console.log(validate_user)
    if (validate_coin && validate_currency) {
      req.body.coinId = validate_coin._id;
      req.body.currencyId = validate_currency._id;
      console.log('currency validated');
      next();
    } else
      return response(res, 403, {
        Code: 403,
        Message: resmessage.coin_currency_not_available
      });
  } catch (err) {
    return response(res, 404, {
      Code: 404,
      Message: resmessage.something_wrong,
      error: err
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({
      Code: 0,
      Message: resmessage.un_authorized_access
    });
  }

  next();
};

const extractHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

const check = (data, schema) => {
  const validation = schema.validate(data, { convert: false });
  if (validation.error) {
    const errorDetails = validation.error.details.map((val) => ({
      error: val.message,
      path: val.path
    }));
    return errorDetails;
  }
  return null;
};
