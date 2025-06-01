import { encryptAndSign, verifyAndDecrypt } from "./signed-encryption";
import {
	createEncryptionKeyPair,
	getEncryptionKeysFromSigningKeys,
} from "./encryption";
import { createSigningKeyPair } from "./signing";

describe("encryption envelope", () => {
	test("encrypted message matches snapshot", () => {
		const message = "Hello, secure world!";
		const topic = "test-topic";

		const senderPrivateSigningKey =
			"vdBSF1jbn8beNSNvEkIlUWk3EsXMqSQcV3V2C3bNyf8";
		const receiverPublicEncryptionKey =
			"COLINpe2UMht27rZE2oG1nJIjOWh3-0mMjbvADZF7Sg";

		const encryptedMessage = encryptAndSign({
			message,
			senderPrivateSigningKey,
			receiverPublicEncryptionKey,
			topic,
		});

		expect(encryptedMessage).toMatchInlineSnapshot(`
"COLINpe2UMht27rZE2oG1nJIjOWh3-0mMjbvADZF7Sg
~~~
aAiX-4xSdeBwSJc4zgGUyAof0mJoMll4a-2UG2h-QBw
opCDqesroMf2u1KVCBFYJi2vxtRLhlRdJXq3yjzn g9UDGEkAofI1z5mA4la
~~~
henBIo3fPWdRFAD1nkzKikYT3tnfMjDsMkdXZCaUUmc
H3BBYhBfjHDD1PqtlijUdw8ryei8eN_6r51wiG0sztVxBi5wFee_T1Y3AX6E34Dd_x6x2X8LeaBOMCRUqnwWCw"
`);
	});
});

describe("encryptAndSign and verifyAndDecrypt", () => {
	test("should encrypt, sign, and then verify and decrypt the message correctly", () => {
		const senderIdentity = createSigningKeyPair();

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
		const senderIdentity = createSigningKeyPair();

		const recipientIdentity = createSigningKeyPair();
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
