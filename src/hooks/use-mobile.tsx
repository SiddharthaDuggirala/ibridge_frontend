import {useSyncExternalStore} from "react";

const MOBILE_BREAKPOINT = 768;
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

// Tell React how to listen for screen-size changes...
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

// ...and how to read the current value.
function getSnapshot() {
  return window.matchMedia(query).matches;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot);
}