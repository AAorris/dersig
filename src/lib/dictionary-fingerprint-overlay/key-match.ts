import { load } from "./trie";

export interface Match {
	word: string;
	start: number;
	end: number;
}

export function keyMatch(value: string) {
	const trie = load();
	const input = value;
	const matches: Match[] = [];
	// slide a 5ch window over the input, trying 4ch and 3ch
	for (let i = 0; i < input.length - 4; i++) {
		let n = i + 3;
		let allowUpper = true;
		let node = trie?.find(input.slice(i, i + 3).toLowerCase());
		if (!node) continue;
		while (node?.hasChild(allowUpper ? input[n].toLowerCase() : input[n])) {
			// console.log(input[n], allowUpper, input[n] !== input[n].toUpperCase());
			if (allowUpper && input[n] !== input[n].toUpperCase()) {
				allowUpper = false;
			}
			if (!allowUpper && input[n] === input[n].toUpperCase()) {
				// if we've seen a lowercase letter, no more uppercase letters allowed
				break;
			}
			node = node.getChild(input[n].toLowerCase());
			n += 1;
		}
		while (!node.isEndOfWord()) {
			node = node.getParent();
			n -= 1;
		}
		if (n > 2) {
			const word = input.slice(i, n);
			console.log(i, n, word);
			matches.push({
				word,
				start: i,
				end: n,
			});
			i += n - i - 1;
		}

		// // rare; try 5ch
		// let word = input.slice(i, i + 5);
		// console.log(word);
		// const node5 = trie?.has(word);
		// if (node5) {
		// 	matches.push({
		// 		word: word,
		// 		start: i,
		// 		end: i + 5,
		// 	});
		// 	i += 4;
		// 	continue;
		// }
		// // unlikely; try 4ch
		// word = input.slice(i, i + 4);
		// const node4 = trie?.has(word);
		// if (node4) {
		// 	matches.push({
		// 		word: word,
		// 		start: i,
		// 		end: i + 4,
		// 	});
		// 	i += 3;
		// 	continue;
		// }
		// // try 3ch
		// word = input.slice(i, i + 3);
		// const node3 = trie?.has(word);
		// if (node3) {
		// 	matches.push({
		// 		word: word,
		// 		start: i,
		// 		end: i + 3,
		// 	});
		// 	i += 2;
		// }
	}
	return matches;
}
