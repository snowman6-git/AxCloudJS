import { test, expect, mock } from "bun:test";
import { no_empty } from "./lib/SGears";

test("no_empty TEST", () => {
    expect(no_empty("a ")).toBe(false); //함수 쓰듯이 넣고, 우리가 되야하는 값을 tobe에 넣음 요약: 기대치
});