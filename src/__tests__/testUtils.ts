// @ts-ignore
import stringTokenizer from "string-punctuation-tokenizer";
import DataIndex from "../DataIndex";
import Algorithm from "../interfaces/Algorithm";
import KeyStore from "../interfaces/KeyStore";
import Alignment from "../structures/Alignment";
import Ngram from "../structures/Ngram";
import Token from "../structures/Token";

/**
 * Generates a sample alignment from a sentence
 * @param {String} sentence - a raw sentence from which to generate a mock alignment
 * @return {Array<Alignment>} a mock alignment
 */
export function alignSentence(sentence: string): Alignment[] {
  let alignments: Alignment[] = [];
  const tokens = tokenizeSentence(sentence);
  while (tokens.length) {
    const ngramLength = randNgramLength(tokens.length, 1);
    alignments = [
      ...alignments,
      alignTokens(tokens.slice(0, ngramLength)),
    ];
    tokens.splice(0, ngramLength);
  }

  return alignments;
}

/**
 * Generates a sample alignment
 * @param {Array<Token>} tokens - An array of tokens to align
 * @return {Alignment} a sample alignment
 */
function alignTokens(tokens: Token[]): Alignment {
  const source = new Ngram(tokens);
  const flippedTokens: Token[] = [];
  for (const token of tokens) {
    flippedTokens.push(
      new Token(token.toString().split("").reverse().join("")),
    );
  }
  const target = new Ngram(flippedTokens);
  return new Alignment(source, target);
}

/**
 * Converts a sentence to an array of Tokens
 * @param {String} sentence - a raw sentence to convert into tokens
 * @return {Array<Token>} an array of tokens
 */
export function tokenizeSentence(sentence: string): Token[] {
  const words = stringTokenizer.tokenize(sentence);
  const tokens: Token[] = [];
  for (const word of words) {
    tokens.push(new Token(word));
  }
  return tokens;
}

/**
 * Generates the length of an n-gram.
 * n-grams are limited to lengths of 3.
 * @param {number} numTokens - the number of tokens available for use in the n-gram.
 * @param {number} [maxLength=3] - the maximum length of the n-gram
 * @return {number} an n-gram size
 */
function randNgramLength(numTokens: number, maxLength: number = 3): number {
  const ceiling = Math.min(numTokens, maxLength);
  return Math.floor(Math.random() * ceiling) + 1;
}

export class MockAlgorithm implements Algorithm {
  public name: string = "mock algorithm";

  public execute(
    state: KeyStore, corpusIndex: DataIndex, savedAlignmentsIndex: DataIndex,
    unalignedSentencePair: [Token[], Token[]]): KeyStore {
    return {};
  }
}