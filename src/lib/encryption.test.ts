import * as crypto from "node:crypto";
import {
	createEncryptionKeyPair,
	encryptUtf8,
	decryptUtf8,
	x25519PublicPrefix,
	x25519PrivatePrefix,
} from "./encryption";
import { getSharedSecret } from "./shared-secret";
import { generateSigningKeyPair } from "./signing";

describe("Encryption Module", () => {
	it("should encrypt and decrypt using an encryption key pair", () => {
		const senderKeys = createEncryptionKeyPair();
		const encryptedMessage = encryptUtf8({
			secretKey: senderKeys.privateKey,
			message: "Hello, this is a test message!",
		});
		// `"8fr_XCyvObOmWLgvC-l2gkzcLqs1SpEqnNH376fOJpjw36nLWMv_-jbd5Aw4e3hEDMFYty3O"`
		// `"F-rX8Qo63INBZqrwZAa7V52rf-LccINW0YFVJtUFG-TfR9mi23vLx0cs5VhhrIXmZUxFpPMh"`
		const decryptedMessage = decryptUtf8(
			encryptedMessage,
			senderKeys.privateKey,
		);

		expect(decryptedMessage).toEqual("Hello, this is a test message!");
	});

	it("should encrypt and decrypt using a shared secret", () => {
		const senderKeys = createEncryptionKeyPair();
		const receiverKeys = createEncryptionKeyPair();

		const senderSharedSecret = getSharedSecret({
			localPrivateKey: senderKeys.privateKey,
			remotePublicKey: receiverKeys.publicKey,
		});
		const receiverSharedSecret = getSharedSecret({
			localPrivateKey: receiverKeys.privateKey,
			remotePublicKey: senderKeys.publicKey,
		});
		expect(senderSharedSecret).toEqual(receiverSharedSecret);

		const encryptedMessage = encryptUtf8({
			secretKey: senderSharedSecret,
			message: "Hello, this is a test message!",
		});

		expect(decryptUtf8(encryptedMessage, receiverSharedSecret)).toEqual(
			"Hello, this is a test message!",
		);
		expect(decryptUtf8(encryptedMessage, senderSharedSecret)).toEqual(
			"Hello, this is a test message!",
		);
	});

	it("should encrypt and decrypt using a shared secret with an ephemeral key pair", () => {
		const senderKeys = generateSigningKeyPair();
		void senderKeys; // would be used for signing in signed-encryption
		const receiverKeys = createEncryptionKeyPair();
		const ephemeralKeys = createEncryptionKeyPair();

		const senderSharedSecret = getSharedSecret({
			remotePublicKey: receiverKeys.publicKey,
			localPrivateKey: ephemeralKeys.privateKey,
		});
		const receiverSharedSecret = getSharedSecret({
			remotePublicKey: ephemeralKeys.publicKey,
			localPrivateKey: receiverKeys.privateKey,
		});

		expect(senderSharedSecret).toEqual(receiverSharedSecret);

		const encryptedMessage = encryptUtf8({
			secretKey: senderSharedSecret,
			message: "Hello, this is a test message!",
		});

		expect(decryptUtf8(encryptedMessage, receiverSharedSecret)).toEqual(
			"Hello, this is a test message!",
		);

		expect(decryptUtf8(encryptedMessage, senderSharedSecret)).toEqual(
			"Hello, this is a test message!",
		);
	});
	// it("should throw an error if the signature is invalid", () => {
	// 	const senderKeys = createEncryptionKeyPair();
	// 	const recipientKeys = createEncryptionKeyPair();

	// 	const messageInput: MessageInput = {
	// 		from: senderKeys,
	// 		to: { publicKey: recipientKeys.publicKey },
	// 		subject: "Test Subject",
	// 		message: "Hello, this is a test message!",
	// 	};

	// 	const encryptedMessage = encryptMessage(messageInput);
	// 	// Tamper with the message to invalidate the signature
	// 	encryptedMessage.message = "Tampered message";

	// 	expect(() => decryptMessage(encryptedMessage, recipientKeys)).toThrow(
	// 		"Invalid signature",
	// 	);
	// });

	// it("should throw an error if the IV is missing", () => {
	// 	const senderKeys = createEncryptionKeyPair();
	// 	const recipientKeys = createEncryptionKeyPair();

	// 	const messageInput: MessageInput = {
	// 		from: senderKeys,
	// 		to: { publicKey: recipientKeys.publicKey },
	// 		subject: "Test Subject",
	// 		message: "Hello, this is a test message!",
	// 	};

	// 	const encryptedMessage = encryptMessage(messageInput);
	// 	// Remove the IV to test error handling
	// 	encryptedMessage.iv = undefined;

	// 	expect(() => decryptMessage(encryptedMessage, recipientKeys)).toThrow(
	// 		"IV is required to decipher",
	// 	);
	// });
});

describe("header stripping", () => {
	test("PKCS#8 header for x25519 private key is consistent", () => {
		let nodeKeyPair = crypto.generateKeyPairSync("x25519");
		let privateKeyString = nodeKeyPair.privateKey
			.export({ format: "der", type: "pkcs8" })
			.toString("hex");
		let lastSeenHex = privateKeyString;

		for (let i = 0; i < 1000; i++) {
			nodeKeyPair = crypto.generateKeyPairSync("x25519");
			privateKeyString = nodeKeyPair.privateKey
				.export({ format: "der", type: "pkcs8" })
				.toString("hex");
			let updatedPrefix = "";
			for (let j = 0; j < lastSeenHex.length; j++) {
				if (lastSeenHex[j] === privateKeyString[j]) {
					updatedPrefix += lastSeenHex[j];
				} else {
					break;
				}
			}
			lastSeenHex = updatedPrefix;
		}
		// The actual prefix will be determined by running the test
		expect(lastSeenHex).toEqual(x25519PrivatePrefix);
	});

	test("PKCS#8 header for x25519 public key is consistent", () => {
		let nodeKeyPair = crypto.generateKeyPairSync("x25519");
		let publicKeyString = nodeKeyPair.publicKey
			.export({ format: "der", type: "spki" })
			.toString("hex");
		let lastSeenHex = publicKeyString;

		for (let i = 0; i < 1000; i++) {
			nodeKeyPair = crypto.generateKeyPairSync("x25519");
			publicKeyString = nodeKeyPair.publicKey
				.export({ format: "der", type: "spki" })
				.toString("hex");
			let updatedPrefix = "";
			for (let j = 0; j < lastSeenHex.length; j++) {
				if (lastSeenHex[j] === publicKeyString[j]) {
					updatedPrefix += lastSeenHex[j];
				} else {
					break;
				}
			}
			lastSeenHex = updatedPrefix;
		}
		// The actual prefix will be determined by running the test
		expect(lastSeenHex).toEqual(x25519PublicPrefix);
	});
});
