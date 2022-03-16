const express = require('express');
const route = express.Router();

const {
  postFees,
  postFeeComputation,
} = require('../controllers/feesController');

//@desc Get all fees
//@route GET /api/fees
// route.get('/api/fees', getFees);

//@desc Post Fees to use
//@route POST /api/fees
route.post('/api/fees', postFees);

//@desc Post Fees to use
//@route POST /api/fees
route.post('/api/compute-transaction-fee', postFeeComputation);

module.exports = route;
