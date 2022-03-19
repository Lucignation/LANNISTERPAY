const express = require('express');
const bodyParser = require('body-parser');
const feesRoute = require('./routes/fees');
const connectDB = require('./config/db');

require('./utils/redis');

//init express middleware
const app = express();

//port
const PORT = 5000 || process.env.PORT;

//connect database
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(feesRoute);

app.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`);
});
