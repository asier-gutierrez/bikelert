let mongoose = require('mongoose');

let ActiveClientSchema = new mongoose.Schema({
	socket_id: { type: String, required: true },
	boundingBox: {
		type: { type: String, required: true, enum: 'Polygon', default: 'Polygon' },
		coordinates: [[[Number]]]
	}
});

ActiveClientSchema.index({boundingBox: '2dsphere'});

module.exports = mongoose.model('active_client', ActiveClientSchema);