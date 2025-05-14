import * as crypto from "node:crypto";
import { fingerprint, decode } from "./buffer-encoding";
import {
	generateSigningKeyPair,
	derivePublicKey,
	exportSigningKeyPair,
	importSigningKeyPair,
	ed25519HeaderPrivate,
	ed25519HeaderPublic,
	signMessage,
	verifyMessage,
} from "./signing";

describe("header stripping", () => {
	test("PKCS#8 header for ed25519 private key is always 302e020100300506032b657004220420", () => {
		let nodeKeyPair = crypto.generateKeyPairSync("ed25519");
		let privateKeyString = nodeKeyPair.privateKey
			.export({ format: "der", type: "pkcs8" })
			.toString("hex");
		let lastSeenHex = privateKeyString;
		for (let i = 0; i < 1000; i++) {
			nodeKeyPair = crypto.generateKeyPairSync("ed25519");
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
		expect(lastSeenHex).toBe(ed25519HeaderPrivate);
	});

	test("PKCS#8 header for ed25519 public key is always 302e020100300506032b657004220420", () => {
		let nodeKeyPair = crypto.generateKeyPairSync("ed25519");
		let publicKeyString = nodeKeyPair.publicKey
			.export({ format: "der", type: "spki" })
			.toString("hex");
		let lastSeenHex = publicKeyString;
		for (let i = 0; i < 1000; i++) {
			nodeKeyPair = crypto.generateKeyPairSync("ed25519");
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
		expect(lastSeenHex).toBe(ed25519HeaderPublic);
	});
});

describe("fingerprint", () => {
	test("fingerprint matches inline snapshot", () => {
		const identity = {
			privateKey: "lkaa1Y19z13dzDQk22uJ6GxP35UbyWdOiPtRuYaHwiU",
			publicKey: "PNUiVZjMUD0UTOF-PZQUkzGGH5sJfPi611N23k0D4AE",
		};
		expect(fingerprint(decode(identity.privateKey))).toMatchInlineSnapshot(
			`"ay8cGb7_zg"`,
		);
	});

	test("generateSigningKeyPair should return a valid key pair", () => {
		const keyPair = generateSigningKeyPair();
		expect(keyPair).toHaveProperty("privateKey");
		expect(keyPair).toHaveProperty("publicKey");
		expect(typeof keyPair.privateKey).toBe("string");
		expect(typeof keyPair.publicKey).toBe("string");
	});

	test("derivePublicKey should derive the correct public key from a private key", () => {
		const { privateKey, publicKey } = generateSigningKeyPair();
		const derivedPublicKey = derivePublicKey(privateKey);
		expect(derivedPublicKey).toBe(publicKey);
	});

	test("Should import and export an ed25519 key pair", () => {
		const nodeKeyPair = crypto.generateKeyPairSync("ed25519");
		const importedKeyPair = importSigningKeyPair(nodeKeyPair);
		const exported = exportSigningKeyPair(importedKeyPair);
		const importedAgain = importSigningKeyPair(exported);
		expect(importedKeyPair).toEqual(importedAgain);
	});
});

describe("signing", () => {
	test("signMessage should sign a message", () => {
		const privateKey = "-zEwm2nG7PcSp27xxoumB_4C489OrZ243YM9D5sJFGQ";
		const message = "Hello, world!";
		const signature = signMessage(privateKey, message);
		expect(signature).toBeDefined();
		expect(signature.length).toBeGreaterThan(0);
		expect(signature).toMatchInlineSnapshot(
			`"5Whp6fvNIYeFo29yJ98FMEPb8Aq2TOKwINpU7I0sMzwPMTLuvKWdoj9wQcoI5a69VdDKOrVd9M2VCBhk0EH3CA"`,
		);
	});

	test("verifyMessage should verify a message", () => {
		const signerKeys = {
			privateKey: "Ykx7Jt-geAOef2ROkZsSfYFrD01lP-tE2zKA2AYmR20",
			publicKey: "AHy59eFr4v82ZXWr1uRKRA247FBLvMsZvBUFSxL_wuk",
		};
		const message = "Hello, world!";
		const signature = signMessage(
			signerKeys.privateKey,
			`${signerKeys.publicKey}${message}`,
		);
		const details = {
			publicKey: signerKeys.publicKey,
			message,
			signature,
		};

		expect(details).toMatchInlineSnapshot(`
{
  "message": "Hello, world!",
  "publicKey": "AHy59eFr4v82ZXWr1uRKRA247FBLvMsZvBUFSxL_wuk",
  "signature": "XeS-PjNX8zjUuHHfmV419R7vqHywuuFMJLidSYimdLpmDF-pJBEbyYjbhwXCj_broVpChfxfhaJpOR0B1t22Aw",
}
`);
		const isValid = verifyMessage({
			publicKey: signerKeys.publicKey,
			message: `${signerKeys.publicKey}${message}`,
			signature,
		});
		expect(isValid).toBe(true);
	});
});
