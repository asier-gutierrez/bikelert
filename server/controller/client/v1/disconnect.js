module.exports = (socket) => {
	global.Model.ActiveClient
		.findOneAndRemove({socket_id: socket.id})
		.exec()
		.then(() => {
			console.log(`Client ${socket.id} disconnected`);
		})
		.catch((err) => {
			console.log(`Database error while removing active client: ${err}`);
		})
};