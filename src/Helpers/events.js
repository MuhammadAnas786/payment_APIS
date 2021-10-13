import events from 'events';
import referralCodeGenerator from 'referral-code-generator';
import { UserProfileModel } from '../Data/userProfile';
import { TransactionModel } from '../Data/Transactions';
import { CoinModel } from '../Data/coin';
import { CurrencyModel } from '../Data/currency';

const stringEdit = require('string-edit');

export const emitter = new events.EventEmitter();

emitter.on('UpdateLoginStatus', async (recieved) => {
  try {
    // console.log(new Date());
    await UserProfileModel.findOneAndUpdate(
      { user: recieved._id },
      { lastlogin: Date.now() },
      { new: true, upsert: true }
    );
    console.log('Login status updated');
    //   let coin = new CoinModel({
    //       name:'Tether',
    //       symbol:'usdt',
    //       label:'usdt',
    //       isActive: true,
    //       BlockchainAddress:'0xdac17f958d2ee523a2206206994597c13d831ec7'
    //   });
    //   let currency = new CurrencyModel({
    //     name:'cedi',
    //     symbol:'GHS',
    //     label:'cedi',
    //     isActive: true,
    //     countryName:'GHANA',
    //     countrySymbol:'GHA'
    //   })
    //   coin.save()
    //   currency.save()
    //     console.log("added coin and currency")
  } catch (err) {
    console.log(err);
  }
});
emitter.on('setUserProfile', async (recieved) => {
  try {
    const { user } = recieved;
    const referralId = referralCodeGenerator.custom(
      'lowercase',
      3,
      6,
      user.email
    );
    const data = {
      user: user._id,
      referralId: stringEdit.shuffle(referralId)
    };
    // console.log(data)
    const ref = new UserProfileModel({
      ...data
    });
    ref.save((err, doc) => {
      if (!err) {
        user.profile = doc._id;
        console.log('profile added');
        user.save((err, doc) => {
          if (err) console.log(err);
        });
      } else console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
});
emitter.on('MPESASuccess', async (recieved) => {
  const {
    ThirdPartyConversationID,
    TransactionID,
    ResponseDesc,
    ResponseCode,
    ConversationID
  } = recieved;
  const Obj = {
    ResponseDesc,
    ResponseCode,
    ConversationID,
    paymentStatus: 'paid',
    paymentId: TransactionID,
    isActive: false
  };
  try {
    const data = await TransactionModel.findByIdAndUpdate(
      ThirdPartyConversationID,
      {
        ResponseDesc,
        ResponseCode,
        ConversationID,
        paymentStatus: 'paid',
        paymentId: TransactionID,
        isActive: false
      },
      { new: true, upsert: true }
    );
  } catch (err) {
    console.log(err);
  }
});
emitter.on('InitiateCoinTransaction', async (c2bInstance) => {
  try {
    c2bInstance.save((err, doc) => {
      if (!err) console.log('Successful insert');
    });
    /**
     * Add the coin transaction method here
     */
  } catch (err) {
    console.log(err);
  }
});
emitter.on('Faliure', async (recieved) => {
  console.log('c2b faliure');
});
emitter.on('AIRTELPurchaseInitiate', async (recieved) => {
  const {
    ThirdPartyConversationID,
    TransactionID,
    ResponseDesc,
    ResponseCode,
    ConversationID,
    PaymentStatus
  } = recieved;
  const Obj = {
    ResponseDesc,
    ResponseCode,
    ConversationID,
    paymentId: TransactionID,
    PaymentStatus: PaymentStatus
  };
  try {
    const data = await TransactionModel.findByIdAndUpdate(
      ThirdPartyConversationID,
      {
        ResponseDesc,
        ResponseCode,
        ConversationID,
        paymentId: TransactionID,
        paymentStatus: PaymentStatus
      },
      { new: true, upsert: true }
    );
  } catch (err) {
    console.log(err);
  }
});
