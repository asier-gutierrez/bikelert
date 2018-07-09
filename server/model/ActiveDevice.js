let mongoose = require('mongoose');

let ActiveDeviceSchema = new mongoose.Schema({
	device_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
	socket_id: { type: String, required: true },
	location: {
		type: { type: String, required: true, enum: 'Point', default: 'Point' },
		coordinates: [Number]
	},
	lastUpdated: { type: Date, required: true, default: Date.now },
	status: { type: String, required: true, default: "ON", enum: ["ON", "OFF"] }
});

ActiveDeviceSchema.index({location: '2dsphere'});

module.exports = mongoose.model('active_device', ActiveDeviceSchema);