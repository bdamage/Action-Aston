import {useEffect} from "react";
import {useGameStore} from "../state/gameStore";

export function useInputBindings() {
  useEffect(() => {
    const store = useGameStore;
    const keys = new Set<string>();
    const interactiveTags = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

    const updateMovement = () => {
      const x =
        (keys.has("arrowright") || keys.has("d") ? 1 : 0) -
        (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
      const y =
        (keys.has("arrowup") || keys.has("w") ? 1 : 0) -
        (keys.has("arrowdown") || keys.has("s") ? 1 : 0);
      store.getState().setMovement({x, y});
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (interactiveTags.has(target.tagName) || target.isContentEditable)
      ) {
        return;
      }

      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
          " ",
          "enter",
          "escape",
          "p",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      const state = store.getState();
      if (key === "enter") {
        if (state.phase === "menu") {
          state.startGame();
          return;
        }
        if (state.phase === "gameover") {
          state.restartGame();
          return;
        }
      }
      if (key === "escape" || key === "p") {
        if (state.phase === "playing") {
          state.setPhase("paused");
          return;
        }
        if (state.phase === "paused") {
          state.setPhase("playing");
          return;
        }
        if (state.phase === "alignment") {
          state.setPhase("menu");
          return;
        }
      }

      keys.add(key);
      if (key === " ") {
        store.getState().setShooting(true);
      }
      updateMovement();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.delete(key);
      if (key === " ") {
        store.getState().setShooting(false);
      }
      updateMovement();
    };

    const onMouseDown = () => store.getState().setShooting(true);
    const onMouseUp = () => store.getState().setShooting(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      store.getState().setMovement({x: 0, y: 0});
      store.getState().setShooting(false);
    };
  }, []);
}
