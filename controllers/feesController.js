const Fee = require('../models/fee');
const Redis = require('ioredis');

const redis = new Redis();

exports.postFees = async (req, res, next) => {
  const fee = await req.body.FeeConfigurationSpec;
  const feeArray = fee.split('\n');
  try {
    const all_item = feeArray.map(async (f) => {
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
      // await redis.set('fees', JSON.stringify(allFees));
    });

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllFees = async (req, res, next) => {
  const fetchAll = await Fee.find();
  redis.set('fees', JSON.stringify(fetchAll));
  res.status(200).json({ status: 'ok' });
};

// getAllFees();

const getPrecedence = async (currency, locale, cardType, cardTypeProperty) => {
  let result = null;
  const sentIn = { currency, locale, cardType, cardTypeProperty };

  await redis.get('fees', async (err, res) => {
    if (res !== null) {
      const cached = JSON.parse(res);

      result = cached.filter((item) => {
        return item.currency === currency[0] || item.currency === currency[1];
      });

      result = result.filter((item) => {
        return item.locale === locale[0] || item.locale === locale[1];
      });

      result = result.filter((item) => {
        return item.cardType === cardType[0] || item.cardType === cardType[1];
      });

      result = result.filter((item) => {
        return (
          item.cardTypeProperty === cardTypeProperty[0] ||
          item.cardTypeProperty === cardTypeProperty[1] ||
          item.cardTypeProperty === cardTypeProperty[2]
        );
      });
    } else {
      result = await Fee.find({
        currency,
        locale,
        cardType,
        cardTypeProperty,
      });

      await redis.set('fees', JSON.stringify(result), 'ex', 15);
    }
  });

  return result;
};

//Getting the precedence to use
const precedenceToUse = async (arrResult) => {
  let result = [];
  for (let item of arrResult) {
    if (
      item.locale === '*' &&
      item.cardType === '*' &&
      item.cardTypeProperty === '*'
    ) {
      result = { ...result, low: item };
    } else {
      result = { ...result, high: item };
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

  const { Currency, Amount, CurrencyCountry, Customer, PaymentEntity } =
    req.body;

  const cardCurrency = Currency;
  const amount = Amount;
  const currentCountry = CurrencyCountry;
  const bearsFee = Customer.BearsFee;
  const brand = PaymentEntity.Brand;
  const issuer = PaymentEntity.Issuer;
  const type = PaymentEntity.Type;
  const country = PaymentEntity.Country;
  let settlementAmount = 0;
  let chargeAmount = 0;
  let flatFee = 0;
  let transactionAmount = 0;
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

    if (getPredence === undefined) {
      return res.status(404).json({
        Error: `No fee configuration for ${cardCurrency} transactions.`,
      });
    }

    const { feeId, feeType, feeValue } = getPredence;

    if (feeType === 'FLAT_PERC') {
      const getTransactionFee = feeValue.split(':');
      flatFee = getTransactionFee[0];
      transactionAmount = getTransactionFee[1];

      const transactAmount = (transactionAmount / 100) * amount;
      appliedFeeValue = parseInt(flatFee) + parseInt(Math.ceil(transactAmount));
    }
    if (feeType === 'PERC') {
      transactionAmount = feeValue;
      appliedFeeValue = (transactionAmount * amount) / 100;
    }

    if (feeType === 'FLAT') {
      appliedFeeValue = feeValue;
    }

    bearsFee
      ? (chargeAmount = amount + appliedFeeValue)
      : (chargeAmount = amount);

    settlementAmount = chargeAmount - appliedFeeValue;

    return res.status(200).json({
      AppliedFeeID: feeId,
      AppliedFeeValue: appliedFeeValue,
      ChargeAmount: chargeAmount,
      SettlementAmount: settlementAmount,
    });
  } catch (error) {
    console.log(error);
  }
};

/* 
  This was used for my debugging 
  but I left it if you want it
  for reset the db
 */
exports.deleteFees = async (req, res, next) => {
  await Fee.deleteMany();
  res.status(200).json({ status: 'Deleted' });
};
