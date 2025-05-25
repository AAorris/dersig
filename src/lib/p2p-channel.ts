export const createPeerConnection = (iceServers: RTCIceServer[]) => {
	const connection = new RTCPeerConnection({
		iceServers,
	});
	return new Promise((resolve) => {
		// various hooks we could have here
		connection.oniceconnectionstatechange = () => {
			resolve(connection);
		};
	});
};

export function sendOffer(connection: RTCPeerConnection) {
	return connection
		.createOffer()
		.then((offer) => {
			connection.setLocalDescription(offer);
			return offer;
		})
		.catch((reason) => {
			console.error(`Failed to send offer: ${reason}`);
		});
}

export const sendMessage = (channel: RTCDataChannel, message: string) => {
	if (channel.readyState !== "open") {
		throw new Error("Channel is not open");
	}
	channel.send(message);
};
