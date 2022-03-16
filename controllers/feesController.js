const Fee = require('../models/fee');
const Redis = require('redis');
const { writeDataToFile } = require('../utils');

const client = Redis.createClient();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

// exports.getFees = async (req, res, next) => {
//   const fee = await req.body.FeeConfigurationSpec;
//   const feeArray = fee.split('\n');
//   try {
//     await client.connect();
//     await client.get('fcs', async (err, allFees) => {
//       if (err) console.log(err);
//       if (allFees != null) {
//         console.log('Cache hit');
//         return res.json(JSON.parse(allFees));
//         // next()
//       } else {
//         console.log('Cache missed');
//         feeArray.map(async (f) => {
//           const allFees = await new Fee({
//             fee: f,
//           });
//           await allFees.save();
//           client.setEx('fcs', 1000, JSON.stringify(allFees));
//         });

//         return res.status(200).json({ msg: 'fee created' });
//       }
//       // await client.disconnect();
//     });
//     await client.disconnect();
//   } catch (error) {
//     console.log(error);
//   }
//   // console.log(feeArray[1]);
// };

exports.postFees = async (req, res, next) => {
  const fee = await req.body.FeeConfigurationSpec;
  const feeArray = fee.split('\n');
  try {
    feeArray.map(async (f) => {
      let eachValue = f.toString().split(' ');
      let cardTypeV = eachValue[3].split(/[\s()]+/);
      const allFees = await new Fee({
        feeId: eachValue[0],
        currency: eachValue[1],
        locale: eachValue[2],
        cardType: cardTypeV[0],
        cardTypeProperty: cardTypeV[1],
        feeType: eachValue[6],
        feeValue: eachValue[7],
      });
      await allFees.save();
    });

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.log(error);
  }
  // console.log(feeArray[1]);
};

const getPrecedence = async (currency, locale, cardType, cardTypeProperty) => {
  try {
    const result = await Fee.find({
      currency,
      locale,
      cardType,
      cardTypeProperty,
    });

    // const newREsult = await result;
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

//Getting the precedence to use
const precedenceToUse = async (arrResult) => {
  let result = [];
  let precedence = {};
  for (let item of arrResult) {
    if (
      item.locale === '*' &&
      item.cardType === '*' &&
      item.cardTypeProperty === '*'
    ) {
      result = { ...result, low: item };
      // console.log(item);
    } else {
      result = { ...result, high: item };
      // console.log(item);
    }
  }
  if (!result.high) {
    return result.low;
  } else {
    return result.high;
  }
};

exports.postFeeComputation = async (req, res, next) => {
  let locale = '';
  const cardCurrency = req.body.Currency;
  const amount = req.body.Amount;
  const currentCountry = req.body.CurrencyCountry;
  const bearsFee = req.body.BearsFee;
  const brand = req.body.PaymentEntity.Brand;
  const issuer = req.body.PaymentEntity.Issuer;
  const type = req.body.PaymentEntity.Type;
  const country = req.body.PaymentEntity.Country;
  let settlementAmount = 0;
  let chargeAmount = 0;
  let flatFee = 0;
  let transactonAmount = 0;
  let appliedFeeValue = 0;
  if (currentCountry === country) {
    locale = 'LOCL';
  } else {
    locale = 'INTL';
  }
  try {
    const resultFee = await getPrecedence(
      [cardCurrency, '*'],
      [locale, '*'],
      [type, '*'],
      [issuer, brand, '*']
    );
    const getPredence = await precedenceToUse(resultFee);
    // console.log(getPrecedence);
    if (getPredence.feeType === 'FLAT_PERC') {
      // console.log(getPrecedence.feeValue);
      const getTransactionFee = getPredence.feeValue.split(':');
      flatFee = getTransactionFee[0];
      transactonAmount = getTransactionFee[1];

      appliedFeeValue = flatFee + (transactonAmount * amount) / 100;
    }
    if (getPredence.feeType === 'PERC') {
      transactonAmount = getPredence.feeValue;
      appliedFeeValue = (transactonAmount * amount) / 100;
    }

    if (getPredence.feeType === 'FLAT') {
      appliedFeeValue = getPredence.feeValue;
    }

    bearsFee
      ? (chargeAmount = amount + appliedFeeValue)
      : (chargeAmount = amount);

    settlementAmount = chargeAmount - appliedFeeValue;

    console.log(appliedFeeValue);
    return res.status(200).json({
      AppliedFeeID: getPredence.feeId,
      AppliedFeeValue: appliedFeeValue,
      ChargeAmount: chargeAmount,
      SettlementAmount: settlementAmount,
    });
    // if(!getPrecedence)
  } catch (error) {
    console.log(error.message);
  }
};

const cardObj = {
  currency: ['NGN', '*'],
  locale: ['LOCL', '*'],
  cardType: ['CREDIT-CARD', '*'],
  cardTypeProperty: ['MASTERCARD', '*'],
};

// console.log(getPrecedence(cardObj));
