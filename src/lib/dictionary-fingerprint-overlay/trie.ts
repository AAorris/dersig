import { Trie, TrieNode } from "@datastructures-js/trie";
// import { data } from "./dictionary";
import { freq } from "./unigram_freq";
import words from "./words";

const trie = new Trie();
let loaded = false;

export function load() {
	if (loaded) return;
	for (const word of Object.keys(freq)) {
		if (word.length > 2 && word.length < 8) {
			trie.insert(word);
		}
	}
	let word = "";
	for (let i = 0; i < words.length; i++) {
		const char = words[i];
		if (char === "\n") {
			if (word) {
				trie.insert(word);
				word = "";
			}
		} else {
			word += char;
		}
	}
	if (word) {
		trie.insert(word);
	}
	loaded = true;
	return trie;
}

const maxFreq = 501651226;
const maxFreqSquared = maxFreq * maxFreq;

function getFreqScore(length: number, freq: number) {
	const result = ((freq * freq) / maxFreqSquared) * 1024;
	return result;
}

const maxParts = 43;
function rawWordsScore(parts: number) {
	// less parts is better
	return ((maxParts - parts) / maxParts) * 64;
}

export function getMatchingStrings(rawWords: string[]) {
	load();
	const processedWords = rawWords.map((word, index) => {
		const lower = word.toLowerCase();
		// Create mapping from cleaned positions to original positions
		const cleanedToOriginal: number[] = [];
		let result = "";
		for (let i = 0; i < lower.length; i++) {
			const char = lower[i];
			if (char !== "-" && char !== "_") {
				cleanedToOriginal.push(i);
				result += char;
			}
		}
		return { cleaned: result, cleanedToOriginal, original: lower, index };
	});

	const matches = new Set<string>();
	const adjacentToSeparatorWords = new Set<string>();
	let score = 0;

	for (const wordInfo of processedWords) {
		const word = wordInfo.cleaned;
		if (word.length < 3) continue;
		if (trie.find(word)?.isEndOfWord()) {
			matches.add(word);

			// Check if this word was adjacent to a separator in the original
			const originalWord = wordInfo.original;
			let isAdjacentToSeparator = false;

			// Find where this cleaned word appears in the original
			if (wordInfo.cleanedToOriginal.length > 0) {
				const startPos = wordInfo.cleanedToOriginal[0];
				const endPos =
					wordInfo.cleanedToOriginal[wordInfo.cleanedToOriginal.length - 1];

				// Check if there's a separator before or after
				const hasSeparatorBefore =
					startPos > 0 &&
					(originalWord[startPos - 1] === "-" ||
						originalWord[startPos - 1] === "_");
				const hasSeparatorAfter =
					endPos < originalWord.length - 1 &&
					(originalWord[endPos + 1] === "-" ||
						originalWord[endPos + 1] === "_");

				isAdjacentToSeparator = hasSeparatorBefore || hasSeparatorAfter;
			}

			// Check if this word is in the first or last raw word
			const isInFirstOrLastWord =
				wordInfo.index === 0 || wordInfo.index === rawWords.length - 1;

			if (isAdjacentToSeparator || isInFirstOrLastWord) {
				adjacentToSeparatorWords.add(word);
			}

			score += getFreqScore(word.length, freq[word] ?? 1_000_000);
		}
	}

	const matchesArray = Array.from(matches);
	const matchCountBonus = {
		1: 0,
		2: 1000,
		3: 2000,
		4: 4000,
		5: 8000,
	}[matchesArray.length];
	const maxWordLengthBonus = {
		3: 0,
		4: 2000,
		5: 4000,
		6: 8000,
		7: 16000,
	}[Math.max(...matchesArray.map((word) => word.length))];
	const scaledScore =
		score +
		rawWordsScore(rawWords.length) +
		(matchCountBonus ?? 0) +
		(maxWordLengthBonus ?? 0);
	return {
		matches: matchesArray,
		score: scaledScore,
	};
}

export function getLongestMatchingPrefix(rawWord: string) {
	load();
	const word = rawWord.toLowerCase();
	let bestIndex = 0;
	for (let i = 3; i < word.length; i++) {
		const hasString = trie.has(word.substring(0, i + 1));
		if (!hasString) break;
		bestIndex = i;
	}
	let node = trie.find(word.substring(0, bestIndex + 1));
	if (!node) return null;
	while (!node.isEndOfWord) {
		bestIndex--;
		node = node.getParent();
	}
	return word.slice(0, bestIndex + 1);
}

export function getLongestMatchingSubstrings(rawWord: string) {
	load();
	const word = rawWord.toLowerCase();
	const matches = new Set<string>();
	for (let i = 0; i < word.length; i++) {
		for (let j = Math.min(i + 3, word.length); j <= word.length; j++) {
			const substring = word.substring(i, j);
			const match = getLongestMatchingPrefix(substring);
			if (match) matches.add(match);
		}
	}
	return Array.from(matches).sort((l, r) => r.length - l.length);
}

interface WordCandidate {
	completedWords: string[];
	currentPartial: string;
	score: number;
	position: number;
}

export function getOptimalWordSequence(input: string) {
	load();
	const cleanInput = input.toLowerCase().replace(/[^a-z]/g, "");

	// Start with one candidate with empty state
	let candidates: WordCandidate[] = [
		{
			completedWords: [],
			currentPartial: "",
			score: 0,
			position: 0,
		},
	];

	// Process each character
	for (let charIndex = 0; charIndex < cleanInput.length; charIndex++) {
		const char = cleanInput[charIndex];
		const newCandidates: WordCandidate[] = [];

		for (const candidate of candidates) {
			const newPartial = candidate.currentPartial + char;

			// Check if this partial word exists in trie
			const trieNode = trie.find(newPartial);
			const hasChildren = trieNode && trieNode.childrenCount() > 0;
			const isCompleteWord = trieNode?.isEndOfWord();

			// If we can continue building this word
			if (hasChildren || isCompleteWord) {
				// Option 1: Continue building the current word
				if (hasChildren) {
					newCandidates.push({
						...candidate,
						currentPartial: newPartial,
						position: charIndex + 1,
					});
				}

				// Option 2: Complete the current word and start a new one (if it's a valid word)
				if (isCompleteWord && newPartial.length >= 3) {
					const wordScore = getFreqScore(
						newPartial.length,
						freq[newPartial] ?? 1_000_000,
					);
					newCandidates.push({
						completedWords: [...candidate.completedWords, newPartial],
						currentPartial: "",
						score: candidate.score + wordScore,
						position: charIndex + 1,
					});
				}
			}

			// Option 3: If current partial is a valid word, complete it and start fresh
			if (candidate.currentPartial.length >= 3) {
				const currentNode = trie.find(candidate.currentPartial);
				if (currentNode?.isEndOfWord()) {
					const wordScore = getFreqScore(
						candidate.currentPartial.length,
						freq[candidate.currentPartial] ?? 1_000_000,
					);
					newCandidates.push({
						completedWords: [
							...candidate.completedWords,
							candidate.currentPartial,
						],
						currentPartial: char,
						score: candidate.score + wordScore,
						position: charIndex + 1,
					});
				}
			}

			// Option 4: Skip this character and continue with current partial (for handling non-word chars)
			if (candidate.currentPartial.length > 0) {
				newCandidates.push({
					...candidate,
					position: charIndex + 1,
				});
			}
		}

		// Prune candidates to keep only the best ones (prevent exponential explosion)
		candidates = newCandidates.sort((a, b) => b.score - a.score).slice(0, 50); // Keep top 50 candidates

		// If no candidates remain, start fresh
		if (candidates.length === 0) {
			candidates = [
				{
					completedWords: [],
					currentPartial: char,
					score: 0,
					position: charIndex + 1,
				},
			];
		}
	}

	// Finalize candidates by completing any remaining partial words
	const finalCandidates = candidates.map((candidate) => {
		let finalScore = candidate.score;
		const finalWords = [...candidate.completedWords];

		// Try to complete the current partial word
		if (candidate.currentPartial.length >= 3) {
			const node = trie.find(candidate.currentPartial);
			if (node?.isEndOfWord()) {
				const wordScore = getFreqScore(
					candidate.currentPartial.length,
					freq[candidate.currentPartial] ?? 1_000_000,
				);
				finalScore += wordScore;
				console.log(candidate.currentPartial, wordScore);
				finalWords.push(candidate.currentPartial);
			}
		}

		// Apply bonuses similar to existing scoring system
		const matchCountBonus =
			{
				1: 0,
				2: 1000,
				3: 2000,
				4: 4000,
				5: 8000,
			}[finalWords.length] ?? 10000;

		const maxWordLengthBonus =
			finalWords.length > 0
				? ({
						3: 0,
						4: 2000,
						5: 4000,
						6: 8000,
						7: 16000,
					}[Math.max(...finalWords.map((word) => word.length))] ?? 20000)
				: 0;

		const partsBonus = rawWordsScore(finalWords.length);

		return {
			words: finalWords,
			score: finalScore + matchCountBonus + maxWordLengthBonus + partsBonus,
			coverage: finalWords.join("").length / cleanInput.length,
		};
	});

	// Sort by score and return the best options
	return finalCandidates
		.filter((c) => c.words.length > 0)
		.sort((a, b) => b.score - a.score)[0]; //.slice(0, 10); // Return top 10 candidates
}
