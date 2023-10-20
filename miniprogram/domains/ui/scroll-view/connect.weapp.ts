import { ScrollViewCore } from "./index";

export function connect(store: ScrollViewCore, $container: unknown) {
  store.scrollTo = (position: Partial<{ left: number; top: number }>) => {
    // $container.scrollTo(position);
  };
}
