import { PesaInstance } from '../service/mpesa';
import { response } from './response';

const MpesaController = {
  c2b: async (req, res) => {
    const result = await PesaInstance.c2b(req);

    return response(res, result.status, result.body);
  },

  b2c: async (req, res) => {
    const result = await PesaInstance.b2c(req);

    return response(res, result.status, result.body);
  }
};
export default MpesaController;
