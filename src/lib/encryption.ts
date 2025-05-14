// Signing and Verifying is asymmetrical
// Encryption is symmetrical
// You often need different keys, but we'll convert the signing key to an encryption key
// using the ed25519 -> x25519
import * as crypto from "node:crypto";
import {
	x25519,
	edwardsToMontgomeryPub,
	edwardsToMontgomeryPriv,
} from "@noble/curves/ed25519";
import {
	decode,
	decodeArray,
	encode,
	encodeArray,
	encoding,
} from "./buffer-encoding";

export const algorithm = "chacha20-poly1305";

export const x25519PrivatePrefix = "302e020100300506032b656e04220420";
export const x25519PublicPrefix = "302a300506032b656e032100";

// Sign with ed25519, encrypt with x25519
export function createEncryptionKeyPair() {
	const privateKey = x25519.utils.randomPrivateKey();
	return {
		privateKey: encode(Buffer.from(privateKey)),
		publicKey: encode(Buffer.from(x25519.getPublicKey(privateKey))),
	};
}

/**
 * Infer x25519 encryption keys from ed25519 signing keys
 */
export function getEncryptionKeysFromSigningKeys(keyPair: {
	publicKey: string;
	privateKey: string;
}): { publicKey: string; privateKey: string } {
	return {
		privateKey: encode(
			Buffer.from(
				edwardsToMontgomeryPriv(new Uint8Array(decode(keyPair.privateKey))),
			),
		),
		publicKey: encode(
			Buffer.from(
				edwardsToMontgomeryPub(new Uint8Array(decode(keyPair.publicKey))),
			),
		),
	};
}

export function encryptUtf8({
	secretKey,
	message,
}: {
	secretKey: string;
	message: string;
}) {
	/**
	 * Example usage of ChaCha20-Poly1305 encryption:
	 * const algorithm = "chacha20-poly1305";
	 * const key = crypto.randomBytes(32); // Generate a random 256-bit key
	 * const iv = crypto.randomBytes(12); // Generate a random 96-bit nonce
	 * const message = "Hello, this is a test message!";
	 * const cipher = crypto.createCipheriv(algorithm, key, iv, {
	 *   authTagLength: 16, // Set the authentication tag length
	 * });
	 *
	 * let encrypted = cipher.update(message, "utf8", "hex");
	 * encrypted += cipher.final("hex");
	 * const authTag = cipher.getAuthTag().toString("hex"); // Retrieve the authentication tag
	 */
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(
		algorithm,
		decodeArray(secretKey),
		new Uint8Array(iv),
		{
			authTagLength: 12,
		},
	);

	const encrypted: string[] = [];
	encrypted.push(cipher.update(message, "utf8", encoding));
	encrypted.push(cipher.final(encoding));
	const authTag = cipher.getAuthTag().toString(encoding); // Retrieve the authentication tag

	const result = {
		ciphertext: encrypted.filter(Boolean).join(" "),
		iv: encode(iv),
		authTag,
	};
	return stringifyEncryptedMessage(result);
}

function stringifyEncryptedMessage(result: {
	ciphertext: string;
	iv: string;
	authTag: string;
}) {
	if (result.iv.length !== 16) {
		throw new Error(`Invalid IV: ${result.iv} ${result.iv.length}`);
	}
	if (result.authTag.length !== 16) {
		throw new Error(
			`Invalid auth tag: ${result.authTag} ${result.authTag.length}`,
		);
	}
	return `${result.iv}${result.ciphertext}${result.authTag}`;
}

function parseEncryptedMessage(message: string) {
	const iv = message.slice(0, 16);
	const ciphertext = message.slice(16, -16);
	const authTag = message.slice(-16);
	return { iv, ciphertext, authTag };
}

export function decryptUtf8(message: string, secretKey: string): string {
	const { iv, ciphertext, authTag } = parseEncryptedMessage(message);

	const decipher = crypto.createDecipheriv(
		algorithm,
		decodeArray(secretKey),
		decodeArray(iv),
		{
			authTagLength: 12,
		},
	);
	decipher.setAuthTag(decodeArray(authTag));
	const decrypted: string[] = [];
	for (const part of ciphertext.split(" ")) {
		decrypted.push(decipher.update(part, encoding, "utf8"));
	}
	decrypted.push(decipher.final("utf8"));
	return decrypted.join("");
}
