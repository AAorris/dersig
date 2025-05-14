import { encryptAndSign, verifyAndDecrypt } from "./signed-encryption";
import {
	createEncryptionKeyPair,
	getEncryptionKeysFromSigningKeys,
} from "./encryption";
import { generateSigningKeyPair } from "./signing";

describe("encryptAndSign and verifyAndDecrypt", () => {
	test("should encrypt, sign, and then verify and decrypt the message correctly", () => {
		const senderIdentity = generateSigningKeyPair();

		const recipientEncryptionKeys = createEncryptionKeyPair();

		const message = "Hello, secure world!";
		const topic = "test-topic";

		const encryptedMessage = encryptAndSign({
			message,
			senderPrivateSigningKey: senderIdentity.privateKey,
			receiverPublicEncryptionKey: recipientEncryptionKeys.publicKey,
			topic,
		});

		const decryptedMessage = verifyAndDecrypt({
			message: encryptedMessage,
			topic,
			receiverPrivateEncryptionKey: recipientEncryptionKeys.privateKey,
			senderPublicSigningKey: senderIdentity.publicKey,
		});

		expect(decryptedMessage).toEqual(message);
	});

	test("should sign/verify with encryption keys inferred from recipient signing keys", () => {
		const senderIdentity = generateSigningKeyPair();

		const recipientIdentity = generateSigningKeyPair();
		const recipientEncryptionKeys =
			getEncryptionKeysFromSigningKeys(recipientIdentity);

		const message = "Hello, secure world!";
		const topic = "test-topic";

		const encryptedMessage = encryptAndSign({
			message,
			senderPrivateSigningKey: senderIdentity.privateKey,
			receiverPublicEncryptionKey: recipientEncryptionKeys.publicKey,
			topic,
		});

		const decryptedMessage = verifyAndDecrypt({
			message: encryptedMessage,
			topic,
			receiverPrivateEncryptionKey: recipientEncryptionKeys.privateKey,
			senderPublicSigningKey: senderIdentity.publicKey,
		});

		expect(decryptedMessage).toEqual(message);
	});
});
