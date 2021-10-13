import { MtnInstance } from '../service/mtn';
import { response } from './response';

const MTNController = {
  c2b: async (req, res) => {
    const result = await MtnInstance.c2b(req);

    return response(res, result.status, result.body);
  },

  b2c: async (req, res) => {
    const result = await MtnInstance.b2c(req);

    return response(res, result.status, result.body);
  },
  getBalance: async (req, res) => {
    const result = await MtnInstance.getBalance();

    return response(res, result.status, result.body);
  }
};
export default MTNController;
