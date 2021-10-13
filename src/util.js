import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as constants from 'constants';
import { Pesa } from './service/classes/mpesa';
import { Airtel } from './service/classes/airtel';

const momo = require('mtn-momo');
const { parseString } = require("xml2js");

const jwt_key = 'KOidFxnBUFjFbtRKPMkwGeiT5r8sgjXQWAMCNMQlV';
require('dotenv').config();

const { Collections, Disbursements } = momo.create({
  callbackHost: process.env.CALLBACK_HOST
});

export const GenToken = (userId, role, email) => {
  const expiresIn = 30 * 24 * 24;
  const dataStoredInToken = {
    userId,
    userRole: role,
    email
  };
  const token = jwt.sign(dataStoredInToken, jwt_key, {
    expiresIn,
    algorithm: 'HS512',
    issuer: 'kwamfritz',
    noTimestamp: true
  });
  const accessToken = `Bearer ${token}`;
  console.log(`JWT_TOKEN_CREATED | ${userId} | ${email} |${accessToken}`);
  return { expiresIn, accessToken, token };
};

export const CollectionsClient = () => {
  const collections = Collections({
    userSecret: process.env.COLLECTIONS_USER_SECRET,
    userId: process.env.COLLECTIONS_USER_ID,
    primaryKey: process.env.COLLECTIONS_PRIMARY_KEY
  });

  return collections;
};
export const DisbursementsClient = () => {
  const disbursements = Disbursements({
    userSecret: process.env.DISBURSEMENTS_USER_SECRET,
    userId: process.env.DISBURSEMENTS_USER_ID,
    primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
  });

  return disbursements;
};
// DisbursementsClient()

export const mpesaClient = () => {
  const pesa = new Pesa(
    {
      api_key: process.env.MPESA_API_KEY,
      public_key: process.env.MPESA_PUBLIC_KEY
    },
    process.env.MPESA_ENVIRONMENT
  );

  return pesa;
};

export const airtelClient = () => {
  const pesa = new Airtel(
    {
      api_username: process.env.AIRTEL_APIUSERNAME,
      api_password: process.env.AIRTEL_APIPASSWORD
    },
    process.env.AIRTEL_ENVIRONMENT
  );

  return pesa;
};


export const parserXMLToJson = async (xml) => {
  var json = null;
  var option = {
    explicitRoot: false,
    explicitArray: false,
  };
  await parseString(xml, option, function (err, result) {
    if (err === null) {
      json = result;
    } else {
      console.log(err);
    }
  });
  return json;
};