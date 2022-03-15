const Fee = require('../models/fee');
const Redis = require('redis');
const { writeDataToFile } = require('../utils');

const client = Redis.createClient();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

// exports.getFees = async (req, res, next) => {
//   const fee = await req.body.FeeConfigurationSpec;
//   const feeArray = fee.split('\n');
//   console.log(feeArray[0]);
//   await client.connect();
//   await client.get('fcs', async (err, fee) => {
//     if (err) console.log(err);
//     if (fee !== null) {
//       console.log('Cached Hit');
//       return res.json(JSON.parse(fee));
//     } else {
//       console.log('Cached Miss');
//       const fee = await req.body.FeeConfigurationSpec;
//       // await client.setEx('fcs', 1000, JSON.stringify(fee));
//       // fees.push(fee);
//       // writeDataToFile('../data/fees.json', fees);
//       console.log(fee);
//     }
//   });

//   // res.json(data);
//   await client.disconnect();
// };

exports.getFees = async (req, res, next) => {
  const fee = await req.body.FeeConfigurationSpec;
  const feeArray = fee.split('\n');
  try {
    feeArray.map(async (f) => {
      const allFees = await new Fee({
        fee: f,
      });
      await allFees.save();
      // return res.status(200).json({ msg: 'fee created', data: allFees });
    });
    return res.status(200).json({ msg: 'fee created' });
  } catch (error) {
    console.log(error);
  }
  console.log(feeArray[1]);
};
