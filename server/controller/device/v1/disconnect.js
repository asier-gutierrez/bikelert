module.exports = (socket) => {
	if(socket.device)
		global.Model.ActiveDevice
			.findOneAndRemove({device_id: socket.device.device_id})
			.exec()
			.then((device) => {
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
						global.dataNSP.sockets[client.socket_id].emit('DEVICE_DISCONNECTED', socket.device.device_id);
				});
				console.log('Device disconnected.');
			})
			.catch((err) => {
				console.log(`Device disconnected with errors on DB ${err}`);
			});
};