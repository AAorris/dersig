import { createStreamableValue } from "ai/rsc";
import { createEncryptionKeyPair } from "@/lib/encryption";
import { formatPrettyPublicKey } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { getMatchingStrings } from "@/lib/dictionary-fingerprint-overlay/trie";
import * as crypto from "node:crypto";
import { encode } from "@/lib/buffer-encoding";

export function generateSymmetricKey() {
	// Generate a 256-bit (32 byte) symmetric key for ChaCha20-Poly1305
	const symmetricKey = crypto.randomBytes(32);
	const keyString = encode(symmetricKey);
	const prettyKey = formatPrettyPublicKey(keyString);
	const { matches, score } = getMatchingStrings(prettyKey);

	return {
		key: keyString,
		prettyKey,
		matches,
		score,
	};
}

export function generateEncryptionPair() {
	const { publicKey, privateKey } = createEncryptionKeyPair();
	const prettyPublicKey = formatPrettyPublicKey(publicKey);
	const { matches, score } = getMatchingStrings(prettyPublicKey);

	return {
		publicKey,
		privateKey,
		prettyPublicKey,
		matches,
		score,
	};
}

export function streamKeys(
	timeout = 10_000,
	keyType: "symmetric" | "asymmetric" = "symmetric",
) {
	const streamableValue = createStreamableValue();
	let isRunning = true;
	let isCancelled = false;
	let batch: (
		| ReturnType<typeof generateSymmetricKey>
		| ReturnType<typeof generateEncryptionPair>
		| number
	)[] = [];
	let lastBatchTime = Date.now();
	let lowWatermark = 0;
	let seen = 0;
	const deadline = Date.now() + timeout;

	void new Promise((resolve, reject) => {
		const compute = () => {
			if (!isRunning) return;
			if (isCancelled) throw new Error("Cancelled");

			const ts = Date.now();
			const gen =
				keyType === "symmetric"
					? generateSymmetricKey()
					: generateEncryptionPair();
			if (!gen && ts < deadline) {
				setTimeout(compute, 1);
				return;
			}
			seen += 1;
			if (gen.score > lowWatermark) {
				batch.push(gen);
				lowWatermark = lowWatermark + (gen.score - lowWatermark) * 0.01;
			}
			if (seen % 1000 === 0 || ts - lastBatchTime > 300) {
				batch.push(seen);
				streamableValue.update(batch);
				batch = [];
				lastBatchTime = ts;
			}

			if (ts > deadline) {
				batch.push(seen);
				streamableValue.update(batch);
				batch = [];
				resolve(undefined);
			}

			setTimeout(compute, 1);
		};

		// start
		compute();
	})
		.finally(() => {
			isRunning = false;
			streamableValue.done();
		})
		.catch((e) => {
			console.error(e);
		});
	return {
		streamableValue,
		abort: () => {
			isCancelled = true;
			streamableValue.done();
		},
	};
}
