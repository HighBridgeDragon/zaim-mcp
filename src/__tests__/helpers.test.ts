import { describe, expect, it } from "bun:test";

import {
  dateSchema,
  errorResult,
  isValidDate,
  successResult,
} from "../helpers.js";

describe("isValidDate", () => {
  it("正常な日付を受け入れる", () => {
    expect(isValidDate("2024-01-01")).toBe(true);
    expect(isValidDate("2024-12-31")).toBe(true);
    expect(isValidDate("2024-06-15")).toBe(true);
  });

  it("うるう年の2/29を受け入れる", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
  });

  it("非うるう年の2/29を拒否する", () => {
    expect(isValidDate("2023-02-29")).toBe(false);
  });

  it("月末境界を正しく判定する", () => {
    expect(isValidDate("2024-02-28")).toBe(true);
    expect(isValidDate("2024-04-30")).toBe(true);
    expect(isValidDate("2024-04-31")).toBe(false);
  });

  it("不正な月を拒否する", () => {
    expect(isValidDate("2024-13-01")).toBe(false);
    expect(isValidDate("2024-00-01")).toBe(false);
  });

  it("不正な日を拒否する", () => {
    expect(isValidDate("2024-01-32")).toBe(false);
    expect(isValidDate("2024-01-00")).toBe(false);
  });
});

describe("dateSchema", () => {
  it("正しい日付文字列をパースする", () => {
    const result = dateSchema.safeParse("2024-06-15");
    expect(result.success).toBe(true);
  });

  it("フォーマット不正を拒否する", () => {
    const result = dateSchema.safeParse("2024/06/15");
    expect(result.success).toBe(false);
  });

  it("存在しない日付を拒否する", () => {
    const result = dateSchema.safeParse("2024-02-30");
    expect(result.success).toBe(false);
  });

  it("数字以外を拒否する", () => {
    const result = dateSchema.safeParse("abcd-ef-gh");
    expect(result.success).toBe(false);
  });
});

describe("successResult", () => {
  it("データをJSON文字列として返す", () => {
    const result = successResult({ key: "value" });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ key: "value" });
  });

  it("isErrorが設定されない", () => {
    const result = successResult({});
    expect(result.isError).toBeUndefined();
  });

  it("ネストしたデータを扱える", () => {
    const data = { a: { b: [1, 2, 3] } };
    const result = successResult(data);
    expect(JSON.parse(result.content[0].text)).toEqual(data);
  });
});

describe("errorResult", () => {
  it("Errorメッセージを抽出する", () => {
    const result = errorResult(new Error("something failed"));
    expect(result.content[0].text).toBe("Error: something failed");
  });

  it("isErrorがtrueに設定される", () => {
    const result = errorResult(new Error("test"));
    expect(result.isError).toBe(true);
  });
});
