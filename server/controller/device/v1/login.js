module.exports = (socket, data) => {
	let handshakeData = data;
	global.Model.Device
		.findOne({cred1: handshakeData.cred1, cred2: handshakeData.cred2})
		.exec()
		.then((device) => {
			if(device) {
				global.Model.ActiveDevice
					.findOneAndUpdate(
						{
							device_id: device._id
						},
						{
							$set: {
								device_id: device._id,
								socket_id: socket.id,
								lastUpdated: Date.now(),
								location: device.location,
								status: 'ON'
							}
						}, {
							upsert: true,
							new: true
						})
					.then((activeDevice) => {
						socket.device = activeDevice.toJSON();
						socket.emit('LOGIN_SUCCESSFUL', {device_id: device._id});
					})
					.then(() => {
						return global.Model.ActiveClient
							.find({
								boundingBox: {
									$geoIntersects: {
										$geometry: {
											type: 'Point',
											coordinates: device.location.coordinates
										}
									}
								}
							})
							.exec();
					})
					.then((clients) => {
						clients.forEach((client) => {
							if(global.dataNSP.sockets[client.socket_id])
								global.dataNSP.sockets[client.socket_id].emit('DEVICE_CONNECTED', socket.device);
						});

					})
					.catch((err) => {
						socket.emit('LOGIN_FAIL', {err: err.msg});
					});
			} else
				socket.emit('LOGIN_FAIL', {err: 'Unauthorized to perform this request'});
		})
		.catch((err) => {
			socket.emit('LOGIN_FAIL', {err: err.msg});
		});
};