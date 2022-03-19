const express = require('express');
const route = express.Router();

const {
  postFees,
  postFeeComputation,
  deleteFees,
} = require('../controllers/feesController');

//@desc Get all fees
//@route GET /api/fees
// route.get('/api/fees', getFees);

//@desc Post Fees to use
//@route POST /fees
route.post('/fees', postFees);

//@desc Post transactions computation
//@route POST /compute-transaction-fee
route.post('/compute-transaction-fee', postFeeComputation);

//@desc Delete fees
//@route DELETE /fee
route.delete('/fees', deleteFees);

module.exports = route;
