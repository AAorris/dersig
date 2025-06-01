import { createStreamableValue } from "ai/rsc";
import { createEncryptionKeyPair } from "@/lib/encryption";
import { formatPrettyPublicKey } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { getMatchingStrings } from "@/lib/dictionary-fingerprint-overlay/trie";

export function generatePair() {
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

export function streamKeys(timeout = 10_000) {
	const streamableValue = createStreamableValue();
	let isRunning = true;
	let isCancelled = false;
	let batch: (ReturnType<typeof generatePair> | number)[] = [];
	let lastBatchTime = Date.now();
	let lowWatermark = 0;
	let seen = 0;
	const deadline = Date.now() + timeout;

	void new Promise((resolve, reject) => {
		const compute = () => {
			if (!isRunning) return;
			if (isCancelled) throw new Error("Cancelled");

			const ts = Date.now();
			const gen = generatePair();
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
