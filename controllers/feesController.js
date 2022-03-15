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

exports.getFees = async (req, res, next) => {
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

    return res.status(200).json({ msg: 'fee created' });
  } catch (error) {
    console.log(error);
  }
  // console.log(feeArray[1]);
};
