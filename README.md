# Multi-Lingual Word Alignment Prediction (Word MAP)

# Introduction

Word alignment is the process of mapping/associating words from some primary text with corresponding words in a secondary text.

This tool uses algorithms to predict word alignments with a computed level of confidence.

## Terms

* `Primary Text`: The original biblical texts (historically referred to as "source text").
* `Primary Languages`: The languages used in a `primary text`.
* `Secondary Text`: The translation of a `primary text`.
* `Secondary Languages`: The languages used in a `secondary text`.
* `Gateway (Secondary) Languages`: Those languages that compose the minimum set of trade languages in the world.
* `Ternary Text`: The translation of a `secondary text`.
* `Minor (Ternary) Language`: A non-trade language spoken by a small group of people. i.e. a language that is not a `gateway language`. The language used in a `ternary text`.
* `n-gram (word or phrase)`: Is a contiguous sequence of n items from a given sample of text. An n-gram of size 1 is referred to as a "unigram"; size 2 is a "bigram", etc. For example: "hello" is a unigram, while "hello world" is a bigram.
* `Unaligned Sentence Pair`: A sentence in the primary text and matching sentence in the secondary text that needs to be aligned. This is input provided by the user. The response is a list of suggested alignments for the sentence pair.
* `Alignment`: An individual n-gram in the primary text that has been aligned to an n-gram in the secondary text.
* `Saved Alignment`: An alignment that has been approved/corrected by the user.
* `Engine`: Contains a index of every permutation of possible n-gram alignments. And a index of `saved alignments`.
* `Corpus`: The input dataset which is the primary and secondary text aligned by sentences. This is used in training the engine. Note: This is a list of `unaligned sentence pairs` though not input provided by the user.
* `Tokenization`: Separating a sentence into individual words and punctuation.
* `Normalization`: A text might use several different utf8 characters to represent the same visual character. The process of normalization reduces visual character representation to a single utf8 character. A text using a single utf8 standard is considered normalized.

> Note: it is important to understand that n-grams are "contiguous". It is possible
> and even beneficial to support non-contiguous n-grams, however this greatly
> increases the resources required by the system.

## Primary Use Case

Taking a primary text and mapping it a secondary text e.g. when generating mapping for gateway languages.

And, look for inconsistencies in the alignment.

This ensures that all terms and phrases in the primary text have a proper translation in the secondary text.

## Secondary Use Case

Taking a secondary text and mapping it to a ternary text.

## Vision

These tools would provide a basis for taking a primary text and mapping i* Easy to add manually saved alignments.t to a ternary text.

We must use the primary and secondary use cases to fulfill this vision.

## The Need

Existing tools require large data sets, complex running environments, and are usually limited to running in a server environment.

We need a tool that:

* runs on the client with minimal configuration.
* works with existing web browser technology.
* works without an Internet connection.
* does not have a minimal corpus size.

# Requirements

## Tool Requirements

* Learn and adapt to regularly changing input without relying on previously stored engines.
* Must not store trained engines.
* Easy to add new lines of corpus.
* Easy to add manually saved alignments.
* Be fast enough to be usable in real time.
* Differentiate multiple occurrences of the same word.

> TODO: Support for metadata like strong's numbers and parts of speech.

## Input Prerequisites

* The corpus must tokenized
* The unaligned sentence pairs must be tokenized.
* The corpus and unaligned sentence pairs must be in the same primary and secondary languages.
* Input must be in utf8.
* Input characters should be normalized for optimum results.

## Overview of Operation

The following is a non-technical description of how this tool would be used.

1. The tool is initialized with some corpus and previously saved alignments.
1. The tool trains a new engine using the provided corpus.
1. The user gives the tool an unaligned sentence pair.
1. The tool generates and returns a list of possible alignments for the sentence pair provided by the user.
1. The user chooses the correct alignment to use in their work.
1. The alignment chosen by the user is given back to the tool to increase accuracy of future predictions.

# Engine Training

An engine is composed of two indices. The corpus index and saved alignments index.


## Corpus Index
This index is generated by iterating over the corpus.
For each unaligned sentence pair in the corpus
1. Filter out punctuation from the corpus.
1. Generate n-grams for each sentence (n-grams are often limited to lengths of 1 to 3).
1. Generate permutations of all possible combinations of n-grams between primary and secondary sentences so that we can:
1. Tally the occurrences of each permutation across the entire corpus.


Code samples:
```js
corpus = [
 [["a", "b", "c", "."], ["d", "e", "f", "|"]],
 // e.g. [["primary", "language", "sentence", "."], [...]]
 ...
];

// first sentence in primary text
ngrams[0][0] = [
  ["a"], ["b"], ["c"],
  ["a", "b"], ["b", "c"],
  ["a", "b", "c"]
];

// first sentence in secondary text
ngrams[0][1] = [
  ["d"], ["e"], ["f"],
  ["d", "e"], ["e", "f"],
  ["d", "e", "f"]
];

// temporary calculations
permutations = [
  // permutations of first sentence
  [
    // [<primary n-gram>, <secondary n-gram>], ...
    [["a"],["d"]], [["a"],["e"]], [["a"],["f"]],
    [["b"],["d"]], [["b"],["e"]], [["b"],["f"]],
    [["c"],["d"]], [["c"],["e"]], [["c"],["f"]],
    ...
    [["b","c"],["d"]], [["b","c"],["e"]], [["b","c"],["f"]],
    [["b","c"],["d","e"]], [["b","c"],["e","f"]],
    [["b","c"],["d","e","f"]],
    ...
  ],
  // permutations of other sentences
  ...
];

// keyed by n-grams in the primary text
primaryTallyIndex = {
  "a": {
    "d": 1,
    "e": 3,
    "f": 12,
    ...
  },
  "b": {
    "d": 4,
    "e": 1,
    "f": 1,
    ...
  },
  "b c": {
    "d": 1,
    "e": 1,
    "f": 1,
    "d e": 1,
    "e f": 1,
    "d e f": 1
  }
  ...
}

// keyed by n-grams in the secondary text
secondaryTallyIndex = {
  "d": {
    "a": 1,
    "b": 2,
    "c": 12,
    ...
  },
  "e": {
    "a": 4,
    "b": 1,
    "c": 1,
    ...
  },
  ...
}

```

## Save Alignments Index
This index is generated by iterating over all saved alignments.
For each saved alignment, it tallies occurrences.
Since the alignments are verified there is no need for generating n-grams or permutations.

See the code examples for the Corpus Index above.

## Performance Notes

Most other engines require millions of lines of corpus on which they are trained.
This amount of data takes enormous amounts of time to process.
Also, these engines include in their training, heavy statistical algorithms that are computed on every permutation.
Only a small percentage of the data is used in the decoding of the alignment for a single sentence.
The result is a lot of wasted time and resources.

In our engine implementation the corpus is first indexed and stored without running statistical algorithms.
This allows us to dynamically add new corpus to the index quickly without running expensive algorithms.

When a sentence is decoded we only use the relevant data from the index.
Since we are only using a subset of the data our statistical algorithms can run exponentially faster.

# Alignment Prediction

# Algorithms
