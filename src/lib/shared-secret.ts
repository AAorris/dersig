import * as crypto from "node:crypto";
import { x25519 } from "@noble/curves/ed25519";
import { encode, decode, decodeArray, encodeArray } from "./buffer-encoding";

export function getSharedSecret({
	remotePublicKey,
	localPrivateKey,
	infoString,
	salt,
}: {
	/** The public key of the recipient */
	remotePublicKey: string;
	/** The private key of the sender */
	localPrivateKey: string;
	/**
	 * The info string to use for the shared secret.
	 * Different info strings will result in different shared secrets,
	 * even if the same public and private keys are used.
	 *
	 * If not provided, an empty string will be used.
	 */
	infoString?: string;
	/** The salt to use for the shared secret */
	salt?: string;
}): string {
	const privateKeyBytes = new Uint8Array(decode(localPrivateKey));
	const publicKeyBytes = new Uint8Array(decode(remotePublicKey));
	const sharedSecret = x25519.getSharedSecret(privateKeyBytes, publicKeyBytes);
	return encode(
		Buffer.from(
			crypto.hkdfSync(
				"sha256",
				sharedSecret,
				salt ? decodeArray(salt) : new Uint8Array(0),
				new Uint8Array(Buffer.from(infoString ?? "")),
				32,
			),
		),
	);
}
