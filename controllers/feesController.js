const fees = require('../data/fees.json');
const Redis = require('redis');
const { writeDataToFile } = require('../utils');

const client = Redis.createClient();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

exports.getFees = async (req, res, next) => {
  await client.connect();
  await client.get('fcs', async (err, fee) => {
    if (err) console.log(err);
    if (fee !== null) {
      console.log('Cached Hit');
      return res.json(JSON.parse(fee));
    } else {
      console.log('Cached Miss');
      const fee = await req.body.FeeConfigurationSpec;
      await client.setEx('fcs', 1000, JSON.stringify(fee));
      fees.push(fee);
      writeDataToFile('../data/fees.json', fees);
      console.log(fee);
    }
  });

  // res.json(data);
  await client.disconnect();
};
