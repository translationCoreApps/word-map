import Algorithm from "../Algorithm";
import CorpusIndex from "../index/CorpusIndex";
import NumberObject from "../index/NumberObject";
import SavedAlignmentsIndex from "../index/SavedAlignmentsIndex";
import Prediction from "../structures/Prediction";

/**
 * This algorithm calculates the frequency of n-gram occurrences.
 */
export default class NgramFrequency implements Algorithm {

  /**
   * Performs a numerical addition with the value of a key in a number object.
   * TODO: move this into it's own class?
   *
   * @param {NumberObject} object
   * @param {string} key
   * @param {number} value
   */
  private static addObjectNumber(object: NumberObject, key: string, value: number) {
    if (!(key in object)) {
      object[key] = 0;
    }
    object[key] += value;
  }

  /**
   * Performs a numerical division.
   * Division by zero will result in 0.
   * TODO: move this into a math utility?
   *
   * @param {number} dividend
   * @param {number} divisor
   * @return {number}
   */
  private static divideSafe(dividend: number, divisor: number): number {
    if (divisor === 0) {
      return 0;
    } else {
      return dividend / divisor;
    }
  }

  public name: string = "n-gram frequency";

  public execute(predictions: Prediction[], cIndex: CorpusIndex, saIndex: SavedAlignmentsIndex): Prediction[] {
    const alignmentFrequencyCorpusSums: NumberObject = {};
    const alignmentFrequencySavedAlignmentsSums: NumberObject = {};

    for (const p  of predictions) {
      // alignment permutation frequency
      const alignmentFrequencyCorpus = cIndex.permutations.alignmentFrequency.read(
        p.alignment);
      const alignmentFrequencySavedAlignments = saIndex.alignmentFrequency.read(
        p.alignment);

      // n-gram permutation frequency
      const ngramFrequencyCorpusSource = cIndex.permutations.sourceNgramFrequency.read(
        p.alignment.source);
      const ngramFrequencySavedAlignmentsSource = saIndex.sourceNgramFrequency.read(
        p.alignment.source);
      const ngramFrequencyCorpusTarget = cIndex.permutations.targetNgramFrequency.read(
        p.alignment.target);
      const ngramFrequencySavedAlignmentsTarget = saIndex.targetNgramFrequency.read(
        p.alignment.target);

      // n-gram static frequency
      // const ngramStaticFrequencyCorpusSource = cIndex.static.sourceNgramFrequency.read(
      //   p.alignment.source);
      // const ngramStaticFrequencyCorpusTarget = cIndex.static.targetNgramFrequency.read(
      //   p.alignment.target);

      // permutation frequency ratio
      const frequencyRatioCorpusSource: number = NgramFrequency.divideSafe(
        alignmentFrequencyCorpus,
        ngramFrequencyCorpusSource
      );
      const frequencyRatioCorpusTarget: number = NgramFrequency.divideSafe(
        alignmentFrequencyCorpus,
        ngramFrequencyCorpusTarget
      );
      const frequencyRatioSavedAlignmentsSource: number = NgramFrequency.divideSafe(
        alignmentFrequencySavedAlignments,
        ngramFrequencySavedAlignmentsSource
      );
      const frequencyRatioSavedAlignmentsTarget: number = NgramFrequency.divideSafe(
        alignmentFrequencySavedAlignments,
        ngramFrequencySavedAlignmentsTarget
      );

      // store scores
      p.setScores({
        // permutation scores
        alignmentFrequencyCorpus,
        alignmentFrequencySavedAlignments,

        ngramFrequencyCorpusSource,
        ngramFrequencyCorpusTarget,
        ngramFrequencySavedAlignmentsSource,
        ngramFrequencySavedAlignmentsTarget,

        frequencyRatioCorpusSource,
        frequencyRatioCorpusTarget,
        frequencyRatioSavedAlignmentsSource,
        frequencyRatioSavedAlignmentsTarget
      });

      // sum alignment frequencies
      NgramFrequency.addObjectNumber(
        alignmentFrequencyCorpusSums,
        p.key,
        alignmentFrequencyCorpus
      );
      NgramFrequency.addObjectNumber(
        alignmentFrequencySavedAlignmentsSums,
        p.key,
        alignmentFrequencySavedAlignments
      );
    }

    // calculate filtered frequency ratios
    for (const p of predictions) {
      const alignmentFrequencyCorpus = p.getScore("alignmentFrequencyCorpus");
      const alignmentFrequencySavedAlignments = p.getScore(
        "alignmentFrequencySavedAlignments");

      // alignment frequency in the filtered corpus and saved alignments
      const alignmentFrequencyCorpusFiltered = alignmentFrequencyCorpusSums[p.key];
      const alignmentFrequencySavedAlignmentsFiltered = alignmentFrequencySavedAlignmentsSums[p.key];

      // source and target frequency ratio for the corpus and saved alignments
      const frequencyRatioCorpusSourceFiltered: number = NgramFrequency.divideSafe(
        alignmentFrequencyCorpus,
        alignmentFrequencyCorpusFiltered
      );
      const frequencyRatioSavedAlignmentsFiltered: number = NgramFrequency.divideSafe(
        alignmentFrequencySavedAlignments,
        alignmentFrequencySavedAlignmentsFiltered
      );

      // store scores
      p.setScores({
        alignmentFrequencyCorpusFiltered,
        alignmentFrequencySavedAlignmentsFiltered,

        frequencyRatioCorpusSourceFiltered,
        frequencyRatioSavedAlignmentsFiltered
      });
    }

    return predictions;
  }

}
