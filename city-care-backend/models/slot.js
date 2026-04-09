const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    doctorId: String,
    doctorName: String,
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    isBooked: { type: Boolean, default: false }

});

module.exports = mongoose.model('Slot', SlotSchema);