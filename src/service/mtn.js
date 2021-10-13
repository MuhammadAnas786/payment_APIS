import { CollectionsClient, DisbursementsClient } from '../util';
import { MTNModel } from '../Data/MTN';
import { TransactionModel } from '../Data/Transactions';
import { CurrencyModel } from '../Data/currency';
import { c2bModel } from '../Data/c2bOrders';
import { resmessage } from '../Helpers/constants';
import { SERVICE_PROVIDER_CODE } from '../config';
import { emitter } from '../Helpers/events';
import { CALLBACK_HOST } from "../config"

export const MtnInstance = {
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
      apiName: 'MTN',
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
      // let userInfo = await UserProfileModel.findOne({user:user})
      const c2bdata = {
        amount: total,
        currency: 'EUR' || currencyInfo.symbol,
        externalId: transactionInstance._id,
        payer: {
          partyIdType: 'MSISDN',
          partyId: CustomerMSISDN
        },
        payerMessage: ` ${coin} ${currencyInfo.symbol} item `,
        payeeNote: ` ${coin} ${currencyInfo.symbol} item `,
        // callbackUrl: `${CALLBACK_HOS}/api/v1/webhook` 
        //Above line will be uncommented when in production environment
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
      const collections = CollectionsClient();
      const result = await collections
        .requestToPay(c2bdata)
        .then((transactionId) => collections.getTransaction(transactionId))
        .then((data) => {
          console.log({ data });
          if (data.status === 'SUCCESSFUL') {
            const formattedData = {
              ResponseCode: 200,
              ThirdPartyConversationID: data.externalId,
              TransactionID: data.financialTransactionId,
              ResponseDesc: data.status,
              ConversationID: data.financialTransactionId
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
        .catch((error) => {
          console.log(error);
          throw error;
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
      // let userInfo = await UserProfileModel.findOne({user:user})
      const c2bdata = {
        amount: total,
        currency: 'EUR' || currencyInfo.symbol,
        externalId: transactionInstance._id,
        payee: {
          partyIdType: 'MSISDN',
          partyId: CustomerMSISDN
        },
        payerMessage: ` ${coin} ${currencyInfo.symbol} item `,
        payeeNote: ` ${coin} ${currencyInfo.symbol} item `,
        // callbackUrl: `${CALLBACK_HOS}/api/v1/webhook`
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
      const disbursements = DisbursementsClient();
      const result = await disbursements
        .transfer(c2bdata)
        .then((transactionId) => disbursements.getTransaction(transactionId))
        .then((data) => {
          console.log({ data });
          if (data.status === 'SUCCESSFUL') {
            const formattedData = {
              ResponseCode: 200,
              ThirdPartyConversationID: data.externalId,
              TransactionID: data.financialTransactionId,
              ResponseDesc: data.status,
              ConversationID: data.financialTransactionId
            };

            emitter.emit('MPESASuccess', formattedData);
            //  emitter.emit('InitiateCoinTransaction',c2bInstance)
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
        .catch((error) => {
          console.log(error);
          throw error;
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
  },
  getBalance: async () => {
    try {
      const collections = CollectionsClient();
      const result = await collections
        .getBalance()
        .then((data) => {
          console.log({ data });
          return {
            status: 200,
            body: {
              message: 'Success!',
              Balance: data
            }
          };
        })
        .catch((error) => {
          console.log(error);
          throw error;
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
  }
};
