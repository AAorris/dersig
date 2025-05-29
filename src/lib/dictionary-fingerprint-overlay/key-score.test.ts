import { keyScore } from "./key-score";
import { keyMatch } from "./key-match";

describe("keyScore", () => {
	it("should return the correct score", () => {
		const matches = keyMatch("aha65y0YJ-82pJZ6lLowIBA77T8YA0BLX9hHopeHkak");
		const score = keyScore(matches);
		expect(matches).toMatchInlineSnapshot(`
[
  {
    "end": 3,
    "start": 0,
    "word": "aha",
  },
  {
    "end": 20,
    "start": 17,
    "word": "Low",
  },
  {
    "end": 39,
    "start": 35,
    "word": "Hope",
  },
]
`);
		expect(score).toMatchInlineSnapshot(`241.2110088962254`);
	});
});
