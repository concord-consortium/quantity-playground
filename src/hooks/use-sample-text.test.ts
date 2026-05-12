import { renderHook } from "@testing-library/react";
import { useSampleText } from "./use-sample-text";

describe("useSampleText", () => {
  it("returns Hello World", () => {
    const { result } = renderHook(() => useSampleText());
    expect(result.current).toEqual("Hello World");
  });
});
