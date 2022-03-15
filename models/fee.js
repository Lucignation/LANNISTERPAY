const mongoose = require('mongoose');
const feeSchema = mongoose.Schema({
  fee: {
    type: 'string',
  },
});

module.exports = mongoose.model('Fee', feeSchema);
