import { readStreamableValue, type StreamableValue } from "ai/rsc";
import { useCallback, useEffect, useState } from "react";

// Common types
export interface KeyPair {
	publicKey: string;
	privateKey: string;
	prettyPublicKey: string[];
	matches: string[];
	score: number;
}

// Color mapping for different score tiers
export const colorMap = {
	normal: { strong: "text-gray-400", dim: "text-gray-500" },
	magic: { strong: "text-blue-400", dim: "text-blue-600" },
	rare: { strong: "text-yellow-400", dim: "text-yellow-600" },
	legendary: { strong: "text-orange-400", dim: "text-orange-600" },
	unique: { strong: "text-gold-400", dim: "text-gold-600" },
} as const;

// Utility to get color based on score
export function getColorForScore(score: number) {
	if (score > 4096) return colorMap.legendary;
	if (score > 2048) return colorMap.rare;
	if (score > 1024) return colorMap.magic;
	return colorMap.normal;
}

// Utility to format clipboard text
export function formatClipboardText(pair: KeyPair): string {
	return `${pair.matches.join("_").toUpperCase()}_${Number(pair.score).toFixed(0)}=${pair.prettyPublicKey.join("")},${pair.privateKey}`;
}

// Hook for managing streamed key pairs
export function useStreamedKeys<T extends KeyPair>(
	streamableValue: StreamableValue<(T | number)[]>,
	size: number,
) {
	const [bestSet, setBestSet] = useState<T[]>([]);
	const [totalPairsSeen, setTotalPairsSeen] = useState<number>(0);
	const [error, setError] = useState<Error | null>(null);

	const copyToClipboard = useCallback((pair: T) => {
		navigator.clipboard.writeText(formatClipboardText(pair));
	}, []);

	useEffect(() => {
		let done = false;
		(async () => {
			for await (const pairs of readStreamableValue(streamableValue)) {
				if (!pairs) continue;
				if (done) break;

				// Update the total count of pairs seen
				setTotalPairsSeen(
					(prev) => pairs.find((p) => typeof p === "number") as number,
				);

				setBestSet((prev) => {
					// Filter out null values and sort the batch by score (highest first)
					const sortedBatch = (
						pairs.filter(
							(p): p is NonNullable<T> => p !== null && typeof p !== "number",
						) as NonNullable<T>[]
					).sort((a, b) => b.score - a.score);

					if (sortedBatch.length === 0) return prev;

					// If we have less than 2 items in prev, just merge and sort
					if (prev.length < 2) {
						const newSet = [...sortedBatch, ...prev]
							.filter((p): p is NonNullable<T> => p !== null)
							.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
						return newSet.slice(0, size);
					}

					// Ensure prev is sorted (it should be, but just in case)
					const sortedPrev = [...prev]
						.filter((p): p is NonNullable<T> => p !== null)
						.sort((a, b) => b.score - a.score);

					// Merge the sorted batch with the sorted previous set
					const merged: NonNullable<T>[] = [];
					let batchIndex = 0;
					let prevIndex = 0;

					// Merge while maintaining order
					while (
						merged.length < size &&
						(batchIndex < sortedBatch.length || prevIndex < sortedPrev.length)
					) {
						const batchItem = sortedBatch[batchIndex];
						const prevItem = sortedPrev[prevIndex];

						if (batchIndex >= sortedBatch.length) {
							// No more batch items, take from prev
							if (prevItem) {
								merged.push(prevItem);
							}
							prevIndex++;
						} else if (prevIndex >= sortedPrev.length) {
							// No more prev items, take from batch
							merged.push(batchItem);
							batchIndex++;
						} else if (batchItem.score > prevItem.score) {
							// Batch item has higher score
							merged.push(batchItem);
							batchIndex++;
						} else {
							// Prev item has higher or equal score
							merged.push(prevItem);
							prevIndex++;
						}
					}

					// If we couldn't fit all batch items and we're at capacity,
					// replace the last item with the first unprocessed batch item
					if (merged.length === size && batchIndex < sortedBatch.length) {
						const remainingBatchItem = sortedBatch[batchIndex];
						const lastMergedItem = merged[merged.length - 1];

						if (
							remainingBatchItem &&
							lastMergedItem &&
							remainingBatchItem.score > lastMergedItem.score
						) {
							merged[merged.length - 1] = remainingBatchItem;
						}
					}

					return merged;
				});
			}
		})().catch((e) => setError(e));

		return () => {
			setBestSet([]);
			setTotalPairsSeen(0);
			done = true;
		};
	}, [streamableValue, size]);

	return {
		bestSet,
		totalPairsSeen,
		error,
		copyToClipboard,
	};
}
