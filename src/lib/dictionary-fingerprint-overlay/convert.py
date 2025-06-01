# https://www.kaggle.com/datasets/rtatman/english-word-frequency?resource=download
import csv

word_set = set()
words = {}


def load_word_set():
    global word_set
    with open("dictionary.csv") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header row
        for row in reader:
            word_set.add(row[0])


def generate_dictionary():
    global words
    with open("unigram_freq.csv") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header row
        for row in reader:
            value = int(row[1])
            if (
                value < 501651226
                and value > 100000
                and len(row[0]) > 2
                and len(row[0]) < 6
                and row[0] in word_set
            ):
                words[row[0]] = value


if __name__ == "__main__":
    load_word_set()
    generate_dictionary()
    # print(words)
    with open("unigram_freq.ts", "w") as out:
        out.write(
            f'export const freq: Record<string, number> = ({{\n  {",\n".join([f"'{word}': {words[word]}" for word in words])}\n}});'
        )
