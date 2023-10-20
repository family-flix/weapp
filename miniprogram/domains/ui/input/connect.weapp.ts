import { InputCore } from "./index";

export function connect(store: InputCore, $input: unknown) {
  store.focus = () => {
    // $input.focus();
  };
}
