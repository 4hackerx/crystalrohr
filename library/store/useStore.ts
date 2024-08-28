import { create } from "zustand";
import { devtools } from "zustand/middleware";
import createGlobalAppStateSlice from "./createGlobalAppStateSlice";

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown;

type State = StateFromFunctions<[typeof createGlobalAppStateSlice]>;

export const useStore = create<State>()(
  devtools(
    (set, get, store) => ({
      ...createGlobalAppStateSlice(set, get, store),
    }),
    { name: "Dekan Capital" }
  )
);
