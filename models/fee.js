const mongoose = require('mongoose');
const feeSchema = mongoose.Schema({
  feeId: {
    type: String,
  },
  currency: {
    type: String,
  },
  locale: {
    type: String,
  },
  cardType: {
    type: String,
  },
  cardTypeProperty: {
    type: String,
  },
  feeType: {
    type: String,
  },
  feeValue: {
    type: String,
  },
});

module.exports = mongoose.model('Fee', feeSchema);
