const express = require('express');
const route = express.Router();

const { getFees } = require('../controllers/feesController');

//@desc Get all fees
//@route GET /api/fees
route.get('/api/fees', getFees);

//@desc Post
//@route POST /api/fees
route.post('/api/fees', getFees);

module.exports = route;
