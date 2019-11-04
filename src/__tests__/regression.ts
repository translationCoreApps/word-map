import {WordMap} from "../core/WordMap";

describe("Regression Tests", () => {

  it("properly suggests the first token occurrence", () => {
    const map = new WordMap();
    map.appendAlignmentMemoryString("וַ⁠יַּ֕עַשׂ", "did");
    const source = "וַ⁠יִּקַּ֨ח גִּדְע֜וֹן עֲשָׂרָ֤ה אֲנָשִׁים֙ מֵֽ⁠עֲבָדָ֔י⁠ו וַ⁠יַּ֕עַשׂ כַּ⁠אֲשֶׁ֛ר דִּבֶּ֥ר אֵלָ֖י⁠ו יְהוָ֑ה וַ⁠יְהִ֡י כַּ⁠אֲשֶׁ֣ר יָרֵא֩ אֶת־ בֵּ֨ית אָבִ֜י⁠ו וְ⁠אֶת־ אַנְשֵׁ֥י הָ⁠עִ֛יר מֵ⁠עֲשׂ֥וֹת יוֹמָ֖ם וַ⁠יַּ֥עַשׂ לָֽיְלָה׃";
    const target = "So Gideon and ten of his servants did what Yahweh commanded. But they did it at night, because he was afraid what the other members of his family and the other men in town would do to him if they found out that he had done that.";
    const suggestions = map.predict(source, target, 10);
    const predictions = suggestions[0].getPredictions()
      .filter((p) => p.confidence >= 1);
    const token = predictions[0].target.getTokens()[0];
    expect(token.toString()).toEqual("did");
    expect(token.occurrence).toEqual(1);
  });

  it("suggests tokens in order of occurrence", () => {
    // We have found that sometimes tokens will be suggested out of order with it's occurrence.
    // The result is a mix of occurrences of the token in the predictions instead of a sequential occurrence.
    // This is due to the influence of alignment memory.
    const map = new WordMap();
    map.appendAlignmentMemoryString("Θεὸς", "the God");
    const source = "περὶ δὲ τῶν νεκρῶν, ὅτι ἐγείρονται, οὐκ ἀνέγνωτε ἐν τῇ βίβλῳ Μωϋσέως ἐπὶ τοῦ βάτου, πῶς εἶπεν αὐτῷ ὁ Θεὸς λέγων, ἐγὼ ὁ Θεὸς Ἀβραὰμ, καὶ ὁ Θεὸς Ἰσαὰκ, καὶ ὁ Θεὸς Ἰακώβ?";
    const target = "But concerning the dead that are raised, have you not read in the book of Moses, in the account about the bush, how God spoke to him, saying, ‘I am the God of Abraham and the God of Isaac and the God of Jacob’?";
    const suggestions = map.predict(source, target, 10);
    const predictions = suggestions[0].getPredictions();

    // ensure all usages of "God" are in order of occurrence
    let lastOccurrence = 0;
    for (const p of predictions) {
      for (const t of p.target.getTokens()) {
        if (t.toString() === "God") {
          expect(t.occurrence).toEqual(lastOccurrence + 1);
          lastOccurrence ++;
        }
      }
    }
  });

  it("suggests the correct n-gram occurrence", () => {
    // later occurrences were being preferred over earlier ones.
    const map = new WordMap();
    map.appendAlignmentMemoryString("עִם", "with the");
    const source = "וְ⁠הָ⁠עִבְרִ֗ים הָי֤וּ לַ⁠פְּלִשְׁתִּים֙ כְּ⁠אֶתְמ֣וֹל שִׁלְשׁ֔וֹם אֲשֶׁ֨ר עָל֥וּ עִמָּ֛⁠ם בַּֽ⁠מַּחֲנֶ֖ה סָבִ֑יב וְ⁠גַם־ הֵ֗מָּה לִֽ⁠הְיוֹת֙ עִם־ יִשְׂרָאֵ֔ל אֲשֶׁ֥ר עִם־ שָׁא֖וּל וְ⁠יוֹנָתָֽן׃";
    const target = "Before that, some of the Hebrew men had deserted their army and gone to join with the Philistine army. But now those men revolted and joined with the Saul and Jonathan and the other Israelite soldiers.";
    const suggestions = map.predict(source, target);
    const predictions = suggestions[0].getPredictions()
      .filter((p) => p.confidence >= 1);
    expect(predictions[0].alignment.key).toEqual(predictions[1].alignment.key);
    // expect target tokens to be used in order
    expect(predictions[0].alignment.targetNgram.getTokens()[0].occurrence)
      .toEqual(1);
    expect(predictions[1].alignment.targetNgram.getTokens()[0].occurrence)
      .toEqual(2);
  });

  it("suggest the correct word occurrence", () => {
    // later occurrences were being preferred over earlier ones.
    const map = new WordMap();
    map.appendAlignmentMemoryString("עִם", "with");
    const source = "וְ⁠הָ⁠עִבְרִ֗ים הָי֤וּ לַ⁠פְּלִשְׁתִּים֙ כְּ⁠אֶתְמ֣וֹל שִׁלְשׁ֔וֹם אֲשֶׁ֨ר עָל֥וּ עִמָּ֛⁠ם בַּֽ⁠מַּחֲנֶ֖ה סָבִ֑יב וְ⁠גַם־ הֵ֗מָּה לִֽ⁠הְיוֹת֙ עִם־ יִשְׂרָאֵ֔ל אֲשֶׁ֥ר עִם־ שָׁא֖וּל וְ⁠יוֹנָתָֽן׃";
    const target = "Before that, some of the Hebrew men had deserted their army and gone to join with the Philistine army. But now those men revolted and joined with Saul and Jonathan and the other Israelite soldiers.";
    const suggestions = map.predict(source, target);
    const predictions = suggestions[0].getPredictions()
      .filter((p) => p.confidence >= 1);
    expect(predictions[0].alignment.key).toEqual(predictions[1].alignment.key);
    // expect target tokens to be used in order
    expect(predictions[0].alignment.targetNgram.getTokens()[0].occurrence)
      .toEqual(1);
    expect(predictions[1].alignment.targetNgram.getTokens()[0].occurrence)
      .toEqual(2);
  });
});
