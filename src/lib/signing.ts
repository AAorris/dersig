import * as crypto from "node:crypto";
import {
	createPrivateKey,
	createPublicKey,
	generateKeyPairSync,
} from "node:crypto";
import { encode, decode, decodeArray } from "./buffer-encoding";

/** From node:crypto generateKeyPairSync("ed25519") */
type Ed25519KeyPair = ReturnType<typeof generateKeyPairSync>;

/**
 * Generates a signing key pair from a Node.js crypto.generateKeyPairSync("ed25519") key pair.
 * The scheme used will be stripping the headers and encoding as base64url strings.
 * You can export the key pair back out for external use with `exportSigningKeyPair`.
 */
export function createSigningKeyPair() {
	return importSigningKeyPair(generateKeyPairSync("ed25519"));
}

export function deriveSigningPublicKey(privateKey: string): string {
	const privateKeyObj = exportPrivateKey(privateKey);
	const publicKey = crypto.createPublicKey(privateKeyObj);
	return encode(
		publicKey.export({ format: "der", type: "spki" }).subarray(pubPrefixBytes),
	);
}

/** @param pair a key pair from `crypto.generateKeyPairSync("ed25519")` */
export function importSigningKeyPair(pair: Ed25519KeyPair): {
	privateKey: string;
	publicKey: string;
} {
	const { privateKey, publicKey } = pair;
	const privateKeyRaw = privateKey
		.export({ format: "der", type: "pkcs8" })
		.subarray(privPrefixBytes); // extract raw 32 bytes key

	const publicKeyRaw = publicKey
		.export({ format: "der", type: "spki" })
		.subarray(pubPrefixBytes); // extract raw 32 bytes key

	return {
		privateKey: encode(privateKeyRaw),
		publicKey: encode(publicKeyRaw),
	};
}

export function exportPrivateKey(
	signingPrivateKey: string,
): Ed25519KeyPair["privateKey"] {
	const privDer = Buffer.concat([
		new Uint8Array(Buffer.from(ed25519HeaderPrivate, "hex")),
		new Uint8Array(decode(signingPrivateKey)),
	]);
	const privateKeyObj = createPrivateKey({
		key: privDer,
		format: "der",
		type: "pkcs8",
	});
	return privateKeyObj;
}

export function exportPublicKey(
	signingPublicKey: string,
): Ed25519KeyPair["publicKey"] {
	const pubDer = Buffer.concat([
		new Uint8Array(Buffer.from(ed25519HeaderPublic, "hex")),
		decodeArray(signingPublicKey),
	]);
	const publicKeyObj = createPublicKey({
		key: pubDer,
		format: "der",
		type: "spki",
	});
	return publicKeyObj;
}

/** @returns an equivalent key pair to `crypto.generateKeyPairSync("ed25519")` */
export function exportSigningKeyPair(pair: {
	privateKey: string;
	publicKey: string;
}): Ed25519KeyPair {
	const { privateKey, publicKey } = pair;
	return {
		privateKey: exportPrivateKey(privateKey),
		publicKey: exportPublicKey(publicKey),
	};
}

/**
 * This is the same every time with keys produced the same way.
 * We'll strip it out to save space for now and add it back if
 * you want to export a key to use in the wild.
 */
export const ed25519HeaderPrivate = "302e020100300506032b657004220420";
const privPrefixBytes = ed25519HeaderPrivate.length / 2;

export const ed25519HeaderPublic = "302a300506032b6570032100";
const pubPrefixBytes = ed25519HeaderPublic.length / 2;

export function derivePublicKey(privateKey: string): string {
	const privateKeyObj = exportPrivateKey(privateKey);
	const publicKey = crypto.createPublicKey(privateKeyObj);
	const signingKeyPair = importSigningKeyPair({
		privateKey: privateKeyObj,
		publicKey: publicKey,
	});
	return signingKeyPair.publicKey;
}

export function signMessage(privateKey: string, message: string): string {
	const privateKeyObj = exportPrivateKey(privateKey);
	return encode(
		crypto.sign(null, new Uint8Array(Buffer.from(message)), privateKeyObj),
	);
}

export function verifyMessage({
	publicKey,
	message,
	signature,
}: {
	publicKey: string;
	message: string;
	signature: string;
}): boolean {
	const publicKeyObj = exportPublicKey(publicKey);
	return crypto.verify(
		null,
		new Uint8Array(Buffer.from(message)),
		publicKeyObj,
		new Uint8Array(decode(signature)),
	);
}

export function signerFromString(signer: string): {
	fingerprint: string;
	privateKey: string;
	publicKey: string;
} {
	const [fingerprint, keys] = signer.split("=");
	const [publicKey, privateKey] = keys.split(",");
	return {
		fingerprint,
		privateKey,
		publicKey,
	};
}
