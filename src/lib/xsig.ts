import * as crypto from "node:crypto";
import {
	x25519,
	edwardsToMontgomeryPub,
	edwardsToMontgomeryPriv,
} from "@noble/curves/ed25519";
import * as dersig from "./dersig";
import type {
	Agent,
	PrivateKeyPair,
	SharedSecret,
	SignedAgreement,
} from "./types";

/**
 * Convert an Ed25519 public key to X25519 format for DH operations.
 * @param {string} ed25519PublicKeyBase64 - Base64-url-encoded Ed25519 public key
 * @returns {Uint8Array} X25519 public key
 */
function convertEd25519PublicKeyToX25519(
	ed25519PublicKeyBase64: string,
): Uint8Array {
	const publicKeyRaw = new Uint8Array(
		Buffer.from(ed25519PublicKeyBase64, dersig.encoding),
	);
	// Convert Ed25519 point to X25519 u-coordinate using the proper conversion
	return edwardsToMontgomeryPub(publicKeyRaw);
}

/**
 * Convert an Ed25519 private key to X25519 format for DH operations.
 * @param {string} ed25519PrivateKeyBase64 - Base64-url-encoded Ed25519 private key
 * @returns {Uint8Array} X25519 private key
 */
function convertEd25519PrivateKeyToX25519(
	ed25519PrivateKeyBase64: string,
): Uint8Array {
	const privateKeyRaw = new Uint8Array(
		Buffer.from(ed25519PrivateKeyBase64, dersig.encoding),
	);
	// Convert Ed25519 scalar to X25519 scalar using the proper conversion
	return edwardsToMontgomeryPriv(privateKeyRaw);
}

/**
 * Perform Diffie-Hellman key exchange using X25519 and derive a key for a specific purpose.
 * @param {string} privateKeyBase64 - Base64-url-encoded Ed25519 private key
 * @param {string} peerPublicKeyBase64 - Base64-url-encoded Ed25519 public key of the peer
 * @param {string} infoString - Purpose and context for key derivation (e.g., "chat:message:v1:alice-bob")
 * @returns {Uint8Array} Derived key for the specific purpose
 */
function computeSharedSecret(
	privateKeyBase64: string,
	peerPublicKeyBase64: string,
	infoString: string,
): Uint8Array {
	const x25519PrivateKey = convertEd25519PrivateKeyToX25519(privateKeyBase64);
	const x25519PeerPublicKey =
		convertEd25519PublicKeyToX25519(peerPublicKeyBase64);

	// First get the shared secret
	const sharedSecret = x25519.getSharedSecret(
		x25519PrivateKey,
		x25519PeerPublicKey,
	);

	// Then derive a key for the specific purpose
	return deriveKey(sharedSecret, 32, infoString);
}

/**
 * Derive a key using HKDF.
 * @param {Uint8Array} sharedSecret - The shared secret from DH
 * @param {number} length - Desired length of the derived key in bytes
 * @param {string} info - Optional context information
 * @param {Uint8Array} salt - Optional salt
 * @returns {Uint8Array} Derived key
 */
function deriveKey(
	sharedSecret: Uint8Array,
	length: number,
	info = "",
	salt: Uint8Array | null = null,
): Uint8Array {
	return new Uint8Array(
		crypto.hkdfSync(
			"sha256",
			new Uint8Array(sharedSecret),
			salt ? new Uint8Array(salt) : new Uint8Array(0),
			new Uint8Array(Buffer.from(info)),
			length,
		),
	);
}

function computeSecretWithIdentity(
	identity: PrivateKeyPair,
	peer: Agent,
	scope: string,
): SharedSecret {
	const participants = [
		identity.fingerprint ?? dersig.fingerprint(identity.publicKey),
		peer.fingerprint,
	].sort();
	const infoString = `${scope}:${participants.join("+")}`;
	return {
		info: infoString,
		value: Buffer.from(
			computeSharedSecret(identity.privateKey, peer.publicKey, infoString),
		).toString(dersig.encoding),
		parties: participants,
	};
}

/**
 * Encrypt a message using AES-256-GCM with a shared secret
 * @param {SharedSecret} secret - The shared secret object
 * @param {string} message - The message to encrypt
 * @returns {string} Base64-url encoded string containing IV + ciphertext + auth tag
 */
function encrypt(secret: SharedSecret, message: string): string {
	// Generate a random IV (initialization vector)
	const iv = crypto.randomBytes(12);

	// Create cipher using the shared secret
	const cipher = crypto.createCipheriv(
		"aes-256-gcm",
		Buffer.from(secret.value, dersig.encoding),
		iv,
	);

	// Encrypt the message
	const ciphertext = Buffer.concat([
		cipher.update(message, "utf8"),
		cipher.final(),
	]);

	// Get the auth tag
	const authTag = cipher.getAuthTag();

	// Combine IV + ciphertext + auth tag and encode
	return Buffer.concat([iv, ciphertext, authTag]).toString(dersig.encoding);
}

/**
 * Decrypt a message using AES-256-GCM with a shared secret
 * @param {SharedSecret} secret - The shared secret object
 * @param {string} encryptedMessage - The encrypted message (IV + ciphertext + auth tag)
 * @returns {string} Decrypted message
 * @throws {Error} If decryption fails (wrong key or tampered message)
 */
function decrypt(secret: SharedSecret, encryptedMessage: string): string {
	// Decode the complete message
	const encrypted = Buffer.from(encryptedMessage, dersig.encoding);

	// Split the components
	const iv = encrypted.subarray(0, 12);
	const authTag = encrypted.subarray(-16); // Last 16 bytes
	const ciphertext = encrypted.subarray(12, -16);

	// Create decipher
	const decipher = crypto.createDecipheriv(
		"aes-256-gcm",
		Buffer.from(secret.value, dersig.encoding),
		iv,
	);

	decipher.setAuthTag(authTag);

	// Decrypt
	try {
		const decrypted = Buffer.concat([
			decipher.update(ciphertext),
			decipher.final(),
		]);
		return decrypted.toString("utf8");
	} catch (error) {
		throw new Error("Decryption failed: Invalid key or tampered message");
	}
}

export {
	computeSharedSecret,
	deriveKey,
	computeSecretWithIdentity,
	encrypt,
	decrypt,
};
