let mongoose = require('mongoose');

let EventSchema = mongoose.Schema({
	device_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	date: { type: Date, required: true, default: Date.now },
	positive: { type: Boolean, required: true }
});

module.exports = mongoose.model('event', EventSchema);