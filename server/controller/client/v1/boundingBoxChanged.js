let moment = require('moment');

module.exports = (socket, data) => {
	let activeDevices = [];

	Promise.all([
		//Search for ActiveDevice
		global.Model.ActiveDevice
			.find({
				location: {
					$geoWithin: {
						$geometry: {
							type: 'Polygon',
							coordinates: data.boundingBox
						}
					}
				}
			})
			.exec()
			.then((devices) => {
				activeDevices = devices;
				return global.Model.Device.aggregate([
					{
						$match: {
							_id: { $in: devices.map((device) => {return device.device_id})}
						}
					},
					{
						$project: {
							_id: 1
						}
					}
				]);
			})
			.then(() => { //devices TO Inform
				activeDevices = activeDevices.map((ad) => {
					ad = ad.toJSON();
					return ad;
				});

				//Search for events
				return global.Model.Event
					.find({
						device_id: { $in: activeDevices.map((device) => {return device.device_id}) },
						date: { $gte: new Date(moment().subtract(10, 'minutes').toDate()) }
					}, {}, {sort: {date: -1}}).exec()
			}),

		//Add client to Active clients
		global.Model.ActiveClient
			.findOneAndUpdate({
				socket_id: socket.id
			}, {
				$set: {
					socket_id: socket.id,
					boundingBox: {
						type: 'Polygon',
						coordinates: data.boundingBox
					}
				}
			}, {
				upsert: true
			}).exec()
	])
		.spread((events) => {
			socket.emit('RETRANSMISSION', activeDevices, events);
		})
		.catch((err) => {
			console.log(`Database error while performing client\'s bounding box update process: ${err}`);
		})
};