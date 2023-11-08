/**
 * @file
 */
import { describe, expect, test } from "vitest";

import { parse } from "../url-parse";

describe("url-parse", () => {
  test("带有所有元素的链接", () => {
    const result = parse(
      "https://developers.weixin.qq.com/doc/search.html?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709"
    );
    expect(result).toStrictEqual({
      host: "developers.weixin.qq.com",
      protocol: "https:",
      origin: "https://developers.weixin.qq.com",
      href: "https://developers.weixin.qq.com/doc/search.html?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      pathname: "/doc/search.html",
      search:
        "?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      query:
        "source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
    });
  });

  test("没有协议", () => {
    const result = parse(
      "developers.weixin.qq.com/doc/search.html?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709"
    );
    expect(result).toStrictEqual({
      host: "developers.weixin.qq.com",
      protocol: "",
      origin: "developers.weixin.qq.com",
      href: "developers.weixin.qq.com/doc/search.html?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      pathname: "/doc/search.html",
      search:
        "?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      query:
        "source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
    });
  });

  test("没有search", () => {
    const result = parse("https://developers.weixin.qq.com/doc/search.html");
    expect(result).toStrictEqual({
      host: "developers.weixin.qq.com",
      protocol: "https:",
      origin: "https://developers.weixin.qq.com",
      href: "https://developers.weixin.qq.com/doc/search.html",
      pathname: "/doc/search.html",
      search: "",
      query: "",
    });
  });

  test("小程序完整元素", () => {
    const result = parse(
      "/pages/doc/search/index?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709"
    );
    expect(result).toStrictEqual({
      host: "",
      protocol: "",
      origin: "",
      href: "/pages/doc/search/index?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      pathname: "/pages/doc/search/index",
      search:
        "?source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
      query:
        "source=enter&query=url%20%E8%A7%A3%E6%9E%90&doc_type=miniprogram&jumpbackUrl=%2Fdoc%2F&timestamp=1707537709",
    });
  });
});
