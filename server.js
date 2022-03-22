const express = require('express');
const bodyParser = require('body-parser');
const feesRoute = require('./routes/fees');
const connectDB = require('./config/db');

//init express middleware
const app = express();

//port
const port = process.env.PORT || 5000;

//connect database
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(feesRoute);

app.listen(port, () => {
  console.log(`server running on port http://localhost:${port}`);
});
