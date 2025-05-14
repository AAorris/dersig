import * as crypto from "node:crypto";
import { x25519 } from "@noble/curves/ed25519";
import { encode, decode, decodeArray } from "./buffer-encoding";
import {
	generateSigningKeyPair,
	derivePublicKey,
	signMessage,
	verifyMessage,
	deriveSigningPublicKey,
} from "./signing";
import { getSharedSecret } from "./shared-secret";
import {
	encryptUtf8 as encrypt,
	decryptUtf8 as decrypt,
	createEncryptionKeyPair,
} from "./encryption";

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

function parseEciesMessage(message: string): EncryptedMessage {
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
