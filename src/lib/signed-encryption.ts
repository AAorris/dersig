import {
	createEncryptionKeyPair,
	decryptUtf8 as decrypt,
	encryptUtf8 as encrypt,
} from "./encryption";
import { getSharedSecret } from "./shared-secret";
import { signMessage, verifyMessage } from "./signing";

export function encryptAndSign({
	message,
	senderPrivateSigningKey,
	receiverPublicEncryptionKey,
	topic,
}: {
	message: string;
	senderPrivateSigningKey: string;
	receiverPublicEncryptionKey: string;
	topic: string;
}): string {
	const ephemeralKeys = createEncryptionKeyPair();
	const sharedSecret = getSharedSecret({
		localPrivateKey: ephemeralKeys.privateKey,
		remotePublicKey: receiverPublicEncryptionKey,
		infoString: topic,
	});
	const ciphertext = encrypt({
		secretKey: sharedSecret,
		message,
	});
	const dataToSign = `${ephemeralKeys.publicKey}${ciphertext}`;
	const signature = signMessage(senderPrivateSigningKey, dataToSign);
	return stringifyEciesMessage({
		ephemeralPublicKey: ephemeralKeys.publicKey,
		ciphertext,
		signature,
	});
}

function stringifyEciesMessage({
	ephemeralPublicKey,
	ciphertext,
	signature,
}: EncryptedMessage) {
	if (ephemeralPublicKey.length !== 43) {
		throw new Error(
			`Invalid ephemeral public key length: ${ephemeralPublicKey.length}`,
		);
	}
	if (signature.length !== 86) {
		throw new Error(`Invalid signature length: ${signature.length}`);
	}
	return `${ephemeralPublicKey}\n${ciphertext}\n${signature}`;
}

interface EncryptedMessage {
	ephemeralPublicKey: string; // sender's ephemeral public key
	ciphertext: string; // encrypted message + IV + auth tag
	signature: string; // signature of the ciphertext
}

export function parseEciesMessage(message: string): EncryptedMessage {
	const [ephemeralPublicKey, ciphertext, signature] = message.split("\n");
	const test = stringifyEciesMessage({
		ephemeralPublicKey,
		ciphertext,
		signature,
	});
	if (test !== message) {
		throw new Error(`Invalid message parsing:\n${message}\n${test}`);
	}
	return { ephemeralPublicKey, ciphertext, signature };
}

export function verifyAndDecrypt({
	message,
	topic,
	receiverPrivateEncryptionKey,
	senderPublicSigningKey,
}: {
	message: string;
	topic: string;
	receiverPrivateEncryptionKey: string;
	senderPublicSigningKey: string;
}): string {
	const { ephemeralPublicKey, ciphertext, signature } =
		parseEciesMessage(message);
	const dataToVerify = `${ephemeralPublicKey}${ciphertext}`;
	const isValid = verifyMessage({
		publicKey: senderPublicSigningKey,
		message: dataToVerify,
		signature,
	});
	if (!isValid) {
		throw new Error("Invalid signature");
	}
	const sharedSecret = getSharedSecret({
		remotePublicKey: ephemeralPublicKey,
		localPrivateKey: receiverPrivateEncryptionKey,
		infoString: topic,
	});
	return decrypt(ciphertext, sharedSecret);
}
