export function stringify(query: Record<string, string | number | undefined>) {
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      return `${key}=${encodeURIComponent(query[key]!)}`;
    })
    .join("&");
}

export function parse() {

}
