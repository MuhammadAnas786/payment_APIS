import { AirtelInstance } from '../service/airtel';
import { response, responseXml } from './response';
import jsonxml from 'jsontoxml';

const AirtelController = {
  c2b: async (req, res) => {
    const result = await AirtelInstance.c2b(req);

    return response(res, result.status, result.body);
  },

  b2c: async (req, res) => {
    const result = await AirtelInstance.b2c(req);

    return response(res, result.status, result.body);
  },

  getBalance: async (req, res) => {
    const result = await AirtelInstance.get(req);

    return response(res, result.status, result.body);
  },

  callback: async (req, res) => {
    const result = await AirtelInstance.callback(req);

    return responseXml(res, result.status, jsonxml(result.body));
  }
};
export default AirtelController;
