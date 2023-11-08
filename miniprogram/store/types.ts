// import { JSX } from "solid-js/jsx-runtime";
// import { NamedExoticComponent } from "react";

import { Application } from "@/domains/app/index";
import { HistoryCore } from "@/domains/history/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { ScrollViewCore } from "@/domains/ui/index";
import { StorageCore } from "@/domains/storage/index";
import { HttpClientCore } from "@/domains/http_client/index";

import { PageKeys, RouteConfig } from "./routes";
import { storage } from "./storage";

export type GlobalStorageValues = (typeof storage)["values"];
export type ViewComponentProps = {
  app: Application;
  history: HistoryCore<PageKeys, RouteConfig>;
  client: HttpClientCore;
  view: RouteViewCore;
  storage: StorageCore<GlobalStorageValues>;
  pages: Omit<Record<PageKeys, ViewComponent | ViewComponentWithMenu>, "root">;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};
export type ViewComponent = string;
export type ViewComponentWithMenu = string;
