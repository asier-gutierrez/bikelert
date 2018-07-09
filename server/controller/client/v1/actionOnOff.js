let mongoose = require('mongoose');

module.exports = (socket, data) => {
	let deviceUpdated = undefined;
	global.Model.ActiveDevice
		.findOneAndUpdate({device_id: new mongoose.Types.ObjectId(data.device_id)}, { $set: {status: data.value} }, { upsert: false, new: true})
		.exec()
		.then((updatedDevice) => {
			if(updatedDevice && devicesNSP.sockets[updatedDevice.socket_id]) {
				devicesNSP.sockets[updatedDevice.socket_id].emit('ACTION_ON_OFF', {status: data.value});
				deviceUpdated = updatedDevice;
			} else
				socket.emit('REQUEST_ERROR', 'No device connected');
		})
		.then(() => {
			if(deviceUpdated)
				return global.Model.ActiveClient
					.find({
						boundingBox: {
							$geoIntersects: {
								$geometry: {
									type: 'Point',
									coordinates: deviceUpdated.location.coordinates
								}
							}
						}
					})
					.exec();
		})
		.then((clients) => {
			clients.forEach((client) => {
				dataNSP.sockets[client.socket_id].emit('DEVICE_UPDATED', deviceUpdated);
			})
		})
		.catch((err) => {
			socket.emit('REQUEST_ERROR', `Database error: ${err}`);
		});
};