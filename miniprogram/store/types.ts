// import { JSX } from "solid-js/jsx-runtime";
// import { NamedExoticComponent } from "react";

import { Application } from "@/domains/app";
import { HistoryCore } from "@/domains/history";
import { RouteViewCore } from "@/domains/route_view";
import { ScrollViewCore } from "@/domains/ui";
import { HttpClientCore } from "@/domains/http_client";
// import { BottomMenuCore } from "@/domains/bottom_menu";
import { StorageCore } from "@/domains/storage";

import { PageKeys, RouteConfig } from "./routes";
import { storage } from "./storage";

export type GlobalStorageValues = (typeof storage)["values"];
export type ViewComponentProps = {
  app: Application<{ storage: typeof storage }>;
  history: HistoryCore<PageKeys, RouteConfig>;
  client: HttpClientCore;
  view: RouteViewCore;
  storage: StorageCore<GlobalStorageValues>;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};
