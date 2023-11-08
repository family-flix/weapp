type RouteLocation = {
  host: string;
  protocol: string;
  origin: string;
  pathname: string;
  href: string;
  search: string;
  query: string;
};

export function parse(path: string): RouteLocation {
  if (path.match(/^\/pages/)) {
    // 小程序路径
    const [pathname, search = ""] = path.split("?");
    return {
      host: "",
      protocol: "",
      origin: "",
      pathname,
      href: path,
      search: `?${search}`,
      query: search,
    };
  }
  const [prefix, search = ""] = path.split("?");
  const r = prefix.match(/^(https{0,1}:){0,1}(\/\/){0,1}([^/]{1,})/);
  if (!r) {
    return {
      host: "",
      protocol: "",
      origin: "",
      pathname: path,
      href: path,
      search: `?${search}`,
      query: search,
    };
  }
  const [, protocol = "", tmp, domain = ""] = r;
  const pathname = prefix.replace(r[0], "");
  return {
    host: domain,
    protocol,
    origin: protocol ? `${protocol}//${domain}` : domain,
    pathname,
    href: path,
    search: search ? `?${search}` : "",
    query: search,
  };
}
