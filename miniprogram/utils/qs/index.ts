export function stringify(query: Record<string, any>) {
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      // @ts-ignore
      return `${key}=${encodeURIComponent(query[key]!)}`;
    })
    .join("&");
}

export function parse(search: string, options: Partial<{ ignoreQueryPrefix: boolean }> = {}) {
  const result: Record<string, string> = {};
  if (!search || search === "?") {
    return result;
  }
  search = options.ignoreQueryPrefix ? search : search.slice(1);
  search.split("&").forEach((item) => {
    const pair = item.split("=");
    const key = decodeURIComponent(pair[0]);
    const value = pair.length > 1 ? decodeURIComponent(pair[1]) : "";
    result[key] = value;
  });
  return result;
}

export default {
  stringify,
  parse,
};
