import { describe, expect, it } from "vitest";
import { escapeHtml, textToHtml } from "./html";

describe("textToHtml", () => {
  it("escapes HTML and preserves paragraphs", () => {
    const html = textToHtml("Hello <script>alert(1)</script>\n\nSecond paragraph");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>");
    expect(html).toContain("<p>Second paragraph</p>");
  });

  it("turns single newlines into breaks", () => {
    expect(textToHtml("line one\nline two")).toBe("<p>line one<br>line two</p>");
  });

  it("returns an empty paragraph for blank input", () => {
    expect(textToHtml("   ")).toBe("<p></p>");
  });
});

describe("escapeHtml", () => {
  it("escapes the common HTML metacharacters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
