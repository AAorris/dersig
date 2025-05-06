import * as crypto from "node:crypto";
import type { PrivateKeyPair } from "./types";

export const encoding = "base64url" as const;

export const encode = (value: Uint8Array): string =>
	Buffer.from(value).toString(encoding);
export const decode = (value: string): Uint8Array =>
	new Uint8Array(Buffer.from(value, encoding));

/**
 * Generates a base64-encoded Ed25519 private key.
 * @returns {string} Base64-encoded private key.
 */
function generatePrivateKey(): string {
	const { privateKey } = crypto.generateKeyPairSync("ed25519");
	const privateKeyRaw = privateKey
		.export({ format: "der", type: "pkcs8" })
		.subarray(-32); // extract raw 32 bytes key
	return privateKeyRaw.toString(encoding);
}

/**
 * Derives a base64-encoded Ed25519 public key from a base64-encoded private key.
 * @param {string} privateKeyBase64 - Base64-encoded private key.
 * @returns {string} Base64-encoded public key.
 */
function derivePublicKey(privateKeyBase64: string): string {
	const privateKeyRaw = Buffer.from(privateKeyBase64, encoding);
	const privateKeyFromRaw = crypto.createPrivateKey({
		key: Buffer.concat([
			Buffer.from("302e020100300506032b657004220420", "hex"), // PKCS8 header for Ed25519
			privateKeyRaw,
		]),
		format: "der",
		type: "pkcs8",
	});
	const publicKey = crypto.createPublicKey(privateKeyFromRaw);
	const publicKeyRaw = publicKey
		.export({ format: "der", type: "spki" })
		.subarray(-32); // extract raw 32 bytes key
	return publicKeyRaw.toString(encoding);
}

// Identity management functions
function createIdentity(): Omit<PrivateKeyPair, "fingerprint"> & {
	fingerprint: string;
} {
	const privateKey = generatePrivateKey();
	const publicKey = derivePublicKey(privateKey);

	return {
		publicKey,
		fingerprint: fingerprint(publicKey),
		privateKey,
	};
}

/**
 * Signs a message using a base64-encoded Ed25519 private key.
 * @param {string} privateKeyBase64 - Base64-encoded private key.
 * @param {string} message - The message to sign.
 * @returns {string} Base64-encoded signature.
 */
function signMessage(privateKeyBase64: string, message: string): string {
	const privateKeyRaw = Buffer.from(privateKeyBase64, encoding);
	const privateKeyFromRaw = crypto.createPrivateKey({
		key: Buffer.concat([
			Buffer.from("302e020100300506032b657004220420", "hex"), // PKCS8 header for Ed25519
			privateKeyRaw,
		]),
		format: "der",
		type: "pkcs8",
	});
	const signature = crypto.sign(null, Buffer.from(message), privateKeyFromRaw);
	return signature.toString(encoding);
}

/**
 * Verifies a signature using a base64-encoded Ed25519 public key.
 * @param {string} publicKeyBase64 - Base64-encoded public key.
 * @param {string} message - The original message that was signed.
 * @param {string} signatureBase64 - Base64-encoded signature.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
function verifySignature(
	publicKeyBase64: string,
	message: string,
	signatureBase64: string,
): boolean {
	const publicKeyRaw = Buffer.from(publicKeyBase64, encoding);
	const publicKeyFromRaw = crypto.createPublicKey({
		key: Buffer.concat([
			Buffer.from("302a300506032b6570032100", "hex"), // SPKI header for Ed25519
			publicKeyRaw,
		]),
		format: "der",
		type: "spki",
	});
	return crypto.verify(
		null,
		Buffer.from(message),
		publicKeyFromRaw,
		Buffer.from(signatureBase64, encoding),
	);
}

export function fingerprint(publicKeyBase64: string): string {
	const hash = crypto
		.createHash("sha1")
		.update(publicKeyBase64)
		.digest()
		.toString(encoding)
		.slice(0, 12);
	return hash;
}

export function createAgentDto(publicKey: string): Agent {
	return {
		publicKey,
		fingerprint: fingerprint(publicKey),
	};
}

// Exporting the functions as a module
export {
	generatePrivateKey,
	derivePublicKey,
	signMessage,
	verifySignature,
	createIdentity,
};
