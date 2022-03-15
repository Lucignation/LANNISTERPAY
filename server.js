const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const feesRoute = require('./routes/fees');
const redis = require('redis');
const { Client } = require('pg');

const port = 5000;

const PORT = port || process.env.PORT;

const REDIS_PORT = port || process.env.PORT || 6379;

const client = new Client({
  host: 'localhost',
  user: process.env.USER,
  port: 5432,
  password: process.env.PASSWORD,
  database: 'fees',
});

client.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(feesRoute);

const clientRedis = redis.createClient(REDIS_PORT);

// client.on('error', (err) => {
//   console.log('Error' + err);
// });

// client.on('connect', () => console.log('Redis Client Connected'));
// client.on('error', (err) => console.log('Redis Client Connection Error', err));

app.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`);
});
