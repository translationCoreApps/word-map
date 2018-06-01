import Token from "../Token";

describe("creates a token", () => {
  it("is empty", () => {
    const token = new Token({});
    expect(token.toString()).toEqual("");
  });

  it("is fully", () => {
    const token = new Token({text: "hello"});
    expect(token.toString()).toEqual("hello");
  });

  it("passes through metadata", () => {
    const token = new Token({text: "hello", extra: "value"});
    expect(token.meta.extra).toEqual("value");
  });
});
