import { Pesa } from './classes/mpesa';
import { mpesaClient } from '../util';
import { TransactionModel } from '../Data/Transactions';
import { resmessage } from '../Helpers/constants';
import { SERVICE_PROVIDER_CODE } from '../config';
import { emitter } from '../Helpers/events';
import { CoinModel } from '../Data/coin';
import { CurrencyModel } from '../Data/currency';
import { c2bModel } from '../Data/c2bOrders';
import { c2b } from '../apiSchema/transaction';
import { UserProfileModel } from '../Data/userProfile';

export const PesaInstance = {
  c2b: async (req) => {
    const {
      CustomerMSISDN,
      user,
      coin,
      coinId,
      currencyId,
      serviceCharges,
      tax,
      total,
      discount,
      apiName,
      userCoinAddress,
      totalCoins
    } = req.body;

    const obj = {
      CustomerMSISDN,
      user,
      coin: coinId,
      currency: currencyId,
      serviceCharges,
      tax,
      total,
      discount,
      apiName: 'M-PESA',
      userCoinAddress,
      totalDeliverable: totalCoins,
      orderNo: Date.now(),
      transaction: null,
      order: ''
    };

    const transactionInstance = new TransactionModel({ ...obj });
    obj.transaction = transactionInstance._id;
    const c2bInstance = new c2bModel({ ...obj });
    transactionInstance.order = c2bInstance._id;

    try {
      const currencyInfo = await CurrencyModel.findOne({
        _id: currencyId,
        isActive: true
      });
      const userInfo = await UserProfileModel.findOne({ user });
      const c2bdata = {
        input_Amount: total,
        input_CustomerMSISDN: CustomerMSISDN,
        input_Country: currencyInfo.countrySymbol,
        input_Currency: currencyInfo.symbol,
        input_ServiceProviderCode: SERVICE_PROVIDER_CODE,
        input_TransactionReference: userInfo.referralId,
        input_ThirdPartyConversationID: transactionInstance._id,
        input_PurchasedItemsDesc: ` ${coin} ${currencyInfo.symbol} item `
      };
      // || ServiceCharges: ${serviceCharges} || Total: ${total} || Tid: ${transactionInstance._id} || CustomerMSISDN: ${CustomerMSISDN}
      await transactionInstance
        .save()
        .then((result) => {
          console.log('successful! save');
          //   c2bdata.input_ThirdPartyConversationID = result._id
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return {
              status: 400,
              body: {
                message: resmessage.mongodb_validation_err,
                error: err.message
              }
            };
          }
          return {
            status: 400,
            body: { message: resmessage.something_wrong, error: err }
          };
        });
      //   console.log(c2bdata)
      const pesa = mpesaClient();
      const result = await pesa
        .c2b(c2bdata)
        .then((data) => {
          //   console.log(data);
          if (data.output_ResponseCode === 'INS-0') {
            const formattedData = {
              ResponseCode: data.output_ResponseCode,
              ThirdPartyConversationID: data.output_ThirdPartyConversationID,
              TransactionID: data.output_TransactionID,
              ResponseDesc: data.output_ResponseDesc,
              ConversationID: data.output_ConversationID
            };

            emitter.emit('MPESASuccess', formattedData);
            emitter.emit('InitiateCoinTransaction', c2bInstance);
            return {
              status: 200,
              body: {
                message: resmessage.transaction_successful,
                transactionId: transactionInstance._id
              }
            };
          }
          emitter.emit('c2bFaliure', data);
          return {
            status: 202,
            body: {
              message: resmessage.transaction_faluire,
              response: data
            }
          };
        })
        .catch((er) => {
          console.log(er);
          throw er;
        });
      console.log(result);
      return result;
    } catch (err) {
      console.log(err);
      return {
        status: 400,
        body: { message: resmessage.something_wrong, error: err }
      };
    }
  },
  b2c: async (req) => {
    const {
      CustomerMSISDN,
      user,
      coin,
      coinId,
      currencyId,
      serviceCharges,
      tax,
      total,
      discount,
      apiName,
      totalCoins,
      transactionRefference
    } = req.body;

    const obj = {
      CustomerMSISDN,
      user,
      serviceCharges,
      tax,
      total,
      discount,
      apiName: 'M-PESA',
      order: null,
      Ordertype: 'b2c'
    };

    const transactionInstance = new TransactionModel({ ...obj });

    try {
      const currencyInfo = await CurrencyModel.findOne({
        _id: currencyId,
        isActive: true
      });
      const userInfo = await UserProfileModel.findOne({ user });
      const c2bdata = {
        input_Amount: total,
        input_CustomerMSISDN: CustomerMSISDN,
        input_Country: currencyInfo.countrySymbol,
        input_Currency: currencyInfo.symbol,
        input_ServiceProviderCode: SERVICE_PROVIDER_CODE,
        input_TransactionReference: userInfo.referralId,
        input_ThirdPartyConversationID: transactionInstance._id,
        input_PaymentItemsDesc: `${coin} ${currencyInfo.symbol} item`
      };
      // || ServiceCharges: ${serviceCharges} || Total: ${total} || Tid: ${transactionInstance._id} || CustomerMSISDN: ${CustomerMSISDN}
      await transactionInstance
        .save()
        .then((result) => {
          console.log('successful! save');
          //   c2bdata.input_ThirdPartyConversationID = result._id
        })
        .catch((err) => {
          throw err;
        });
      //   console.log(c2bdata)
      const pesa = mpesaClient();
      const result = await pesa
        .b2c(c2bdata)
        .then((data) => {
          //   console.log(data);
          if (data.output_ResponseCode === 'INS-0') {
            const formattedData = {
              ResponseCode: data.output_ResponseCode,
              ThirdPartyConversationID: data.output_ThirdPartyConversationID,
              TransactionID: data.output_TransactionID,
              ResponseDesc: data.output_ResponseDesc,
              ConversationID: data.output_ConversationID
            };

            emitter.emit('MPESASuccess', formattedData);
            // emitter.emit('InitiateCoinTransaction',c2bInstance)
            return {
              status: 200,
              body: {
                message: resmessage.transaction_successful,
                transactionId: transactionInstance._id
              }
            };
          }
          emitter.emit('Faliure', data);
          return {
            status: 202,
            body: {
              message: resmessage.transaction_faluire,
              response: data
            }
          };
        })
        .catch((er) => {
          throw er;
        });
      console.log(result);
      return result;
    } catch (err) {
      if (err.name === 'ValidationError') {
        return {
          status: 400,
          body: {
            message: resmessage.mongodb_validation_err,
            error: err.message
          }
        };
      }
      return {
        status: 400,
        body: { message: resmessage.something_wrong, error: err }
      };
    }
  }
};
