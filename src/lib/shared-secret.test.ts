import {
	createEncryptionKeyPair,
	encryptUtf8,
	decryptUtf8,
} from "./encryption";
import { getSharedSecret } from "./shared-secret";

describe("getSharedSecret", () => {
	test("should generate the same shared secret for the same info string", () => {
		const senderKeys = createEncryptionKeyPair();
		const recipientKeys = createEncryptionKeyPair();

		const sharedSecret1 = getSharedSecret({
			remotePublicKey: recipientKeys.publicKey,
			localPrivateKey: senderKeys.privateKey,
			infoString: "test",
		});

		const sharedSecret2 = getSharedSecret({
			remotePublicKey: recipientKeys.publicKey,
			localPrivateKey: senderKeys.privateKey,
			infoString: "test",
		});

		expect(sharedSecret1).toEqual(sharedSecret2);

		const encryptedMessage = encryptUtf8({
			secretKey: sharedSecret1,
			message: "Hello, this is a test message!",
		});

		const decryptedMessage = decryptUtf8(encryptedMessage, sharedSecret2);
		expect(decryptedMessage).toEqual("Hello, this is a test message!");
	});
});

describe("shared topic keys", () => {
	test("a secret key gets generated for encrypted broadcasts", () => {
		const hub = createEncryptionKeyPair();

		const recipientGroup = createEncryptionKeyPair();
		const infoString = "#general";

		const hubSpokeSecret = getSharedSecret({
			remotePublicKey: recipientGroup.publicKey,
			localPrivateKey: hub.privateKey,
			infoString,
		});

		const spokeHubSecret = getSharedSecret({
			remotePublicKey: hub.publicKey,
			localPrivateKey: recipientGroup.privateKey,
			infoString,
		});

		expect(hubSpokeSecret).toEqual(spokeHubSecret);
	});
});
