import { immer } from "zustand/middleware/immer";

type State = {
  did: string;
};

type Actions = {
  setDid: (name: string) => void;
};

export default immer<State & Actions>((set) => ({
  did: "",

  setDid: (name) =>
    set((state) => {
      state.did = name;
    }),
}));
