import { InputCore } from "./index";

export function connect(
  store: InputCore,
  $input: {
    focus: () => void;
    blur: () => void;
  }
) {
  console.log("[DOMAIN]connect.weapp");
  store.setFocus = $input.focus;
  store.setBlur = $input.blur;
}
