import { AirtelCbResponse } from '../Data/airtelCallBack';
import { emitter } from '../Helpers/events';
import { resmessage } from '../Helpers/constants';
import { TransactionModel } from '../Data/Transactions';
import { CurrencyModel } from '../Data/currency';
import { UserProfileModel } from '../Data/userProfile';
import { c2bModel } from '../Data/c2bOrders';
import { airtelClient } from '../util';
//import { SERVICE_PROVIDER_CODE } from '../config';

export const AirtelInstance = {
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
      apiName: 'AIRTEL',
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

      // const c2bdata = {
      //   input_TargetWalletMSISDN: CustomerMSISDN,
      //   input_SourceWalletMSISDN: CustomerMSISDN, //
      //   input_Amount: total,
      //   input_ThirdPartyConversationID: transactionInstance._id,
      //   input_TransactionReference: userInfo.referralId,
      //   input_Country: currencyInfo.countrySymbol,
      //   input_Currency: currencyInfo.symbol,
      //   //input_ServiceProviderCode: SERVICE_PROVIDER_CODE,
      //   input_PaymentItemsDesc: `${coin} ${currencyInfo.symbol} item`
      // };
      const c2bdata = {
        input_Amount: total,
        input_CustomerMSISDN: CustomerMSISDN,
        input_Country: currencyInfo.countrySymbol,
        input_Currency: currencyInfo.symbol,
        //input_ServiceProviderCode: SERVICE_PROVIDER_CODE,
        input_TransactionReference: userInfo.referralId,
        input_ThirdPartyConversationID: transactionInstance._id,
        input_PaymentReference: transactionInstance._id,
        input_PurchasedItemsDesc: ` ${coin} ${currencyInfo.symbol} item `
      };

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

      // Call Airtel service
      const airtel = airtelClient();
      const result = await airtel
        .c2b(c2bdata)
        .then((data) => {
          const generalResponse = data["soapenv:Body"]["v11:PurchaseInitiateResponse"]["v31:ResponseHeader"]["v31:GeneralResponse"];
          const responseBody = data["soapenv:Body"]["v11:PurchaseInitiateResponse"]["v11:responseBody"];
          const output_correlationID = generalResponse["v31:correlationID"];
          const output_status = generalResponse["v31:status"];
          const output_code = generalResponse["v31:code"];
          const output_description = generalResponse["v31:description"];
          const output_paymentId = responseBody["v11:paymentId"];
          const output_paymentReference = responseBody["v11:paymentReference"];

          if (output_code === 'purchaseinitiate-3022-0001-S') {
            const formattedData = {
              ResponseCode: output_code,
              ThirdPartyConversationID: transactionInstance._id, //Production has to use output_paymentReference
              TransactionID: output_paymentId,
              ResponseDesc: output_description,
              ConversationID: output_correlationID,
              PaymentStatus: 'pending'
            };

            emitter.emit('AIRTELPurchaseInitiate', formattedData);
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
      apiName: 'AIRTEL',
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
        input_TargetWalletMSISDN: CustomerMSISDN,
        input_SourceWalletMSISDN: CustomerMSISDN, //
        input_Amount: total,
        input_ThirdPartyConversationID: transactionInstance._id,
        input_TransactionReference: userInfo.referralId,
        input_Country: currencyInfo.countrySymbol,
        input_Currency: currencyInfo.symbol,
        //input_ServiceProviderCode: SERVICE_PROVIDER_CODE,
        input_PaymentItemsDesc: `${coin} ${currencyInfo.symbol} item`
      };

      await transactionInstance
        .save()
        .then((result) => {
          console.log('successful! save');
          //   c2bdata.input_ThirdPartyConversationID = result._id
        })
        .catch((err) => {
          throw err;
        });

      // Call Airtel service
      const airtel = airtelClient();
      const result = await airtel
        .b2c(c2bdata)
        .then((data) => {

          if (data.TXNSTATUS === 'adjustmmoneyaccount-3010-0000-S') {
            const formattedData = {
              ResponseCode: data.TXNSTATUS,
              ThirdPartyConversationID: transactionInstance._id,
              TransactionID: data.TXNID,
              ResponseDesc: data.MESSAGE,
              ConversationID: data.TXNID
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

      console.log('errr >> ', err)

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

    return null;
  },
  get: async (req) => {
    return null;
  },
  callback: async (req) => {
    console.log('callback req: ', req.body)
    const {
      transactionid, //TransactionID from the Payment Platform (Comviva Mobiquity)
      correlationid, //The unique paymentreference passed in the PurchaseInitiate request.
      status,
      code,
      description
    } = req.body.billpayrequest;

    let resObj = {
      BILLPAYRESPONSE: {
        id: transactionid, status: "SUCCESS", code: "00"
      }
    }

    try {
      const formattedData = {
        ResponseCode: code,
        ThirdPartyConversationID: correlationid,
        TransactionID: transactionid,
        ResponseDesc: description,
        ConversationID: correlationid,
        PaymentStatus: 'pending'
      };
      if (code === 'purchase-3008-0000-S') {
        emitter.emit('MPESASuccess', formattedData);
        return { status: 200, body: resObj };
      }

      formattedData.PaymentStatus = 'failed'
      emitter.emit('AIRTELPurchaseInitiate', formattedData);
      resObj.BILLPAYRESPONSE = { ...resObj.BILLPAYRESPONSE, code: "202", status: resmessage.transaction_faliure }
      return {
        status: 202,
        body: resObj
      };
      //return { status: 200, body: resObj };
    } catch (err) {
      console.log(err);

      resObj.BILLPAYRESPONSE = { ...resObj.BILLPAYRESPONSE, code: "400", status: resmessage.something_wrong }
      return {
        status: 400,
        body: resObj
      };
    }

  }
};
