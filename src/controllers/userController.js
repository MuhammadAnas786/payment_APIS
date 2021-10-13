import { resmessage } from '../Helpers/constants';
import { user } from '../service/user';
import { CurrencyModel } from '../Data/currency';
import { CoinModel } from '../Data/coin';
import { UserModel } from '../Data/users';
import { UserProfileModel } from '../Data/userProfile';
import { TransactionModel } from '../Data/Transactions';
import { MTNModel } from '../Data/MTN';
import { MpesaModel } from '../Data/Mpesa';
import { AirtelModel } from '../Data/airtel';
import { response } from './response';

const userController = {
  register: async (req, res) => {
    const result = await user.create(req);
    console.log(result);
    return response(res, result.status, result.body);
  },

  login: async (req, res) => {
    const result = await user.login(req.body);
    return response(res, result.status, result.body);
  }
};
export default userController;
