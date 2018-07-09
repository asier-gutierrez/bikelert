let mongoose = require('mongoose');

let DeviceSchema = mongoose.Schema({
	cred1: { type: String, required: true },
	cred2: { type: String, required: true },
	location: {
		type: { type: String, required: true, enum: 'Point', default: 'Point' },
		coordinates: [Number]
	}
});

DeviceSchema.index({location: '2dsphere'});

module.exports = mongoose.model('device', DeviceSchema);