import {Token} from "wordmap-lexer";
import {AlignmentPosition} from "../";
import {Alignment, Ngram, Prediction} from "../../core/";

describe("AlignmentPosition", () => {
  it("has a perfect score", () => {
    const engine = new AlignmentPosition();
    const prediction: Prediction = new Prediction(new Alignment(
      new Ngram([
        new Token({
          text: "hello",
          position: 2,
          characterPosition: 5,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })]),
      new Ngram([
        new Token({
          text: "hallo",
          position: 2,
          characterPosition: 5,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })])
    ));
    const result = engine.
    execute(prediction);
    expect(result.getScores()).toEqual({
      "alignmentPosition": 1
    });
  });

  it("is offset by one space", () => {
    const engine = new AlignmentPosition();
    const prediction: Prediction = new Prediction(new Alignment(
      new Ngram([
        new Token({
          text: "hello",
          position: 2,
          characterPosition: 1,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })]),
      new Ngram([
        new Token({
          text: "hallo",
          position: 3,
          characterPosition: 1,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })])
    ));
    const result = engine.execute(prediction);
    expect(result.getScores()).toEqual({
      "alignmentPosition": 0.75
    });
  });

  it("is offset by two spaces", () => {
    const engine = new AlignmentPosition();
    const prediction: Prediction = new Prediction(new Alignment(
      new Ngram([
        new Token({
          text: "hello",
          position: 2,
          characterPosition: 1,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })]),
      new Ngram([
        new Token({
          text: "hallo",
          position: 4,
          characterPosition: 1,
          sentenceTokenLen: 5,
          sentenceCharLen: 5
        })])
    ));
    const result = engine.execute(prediction);
    expect(result.getScores()).toEqual({
      "alignmentPosition": .5
    });
  });
});
