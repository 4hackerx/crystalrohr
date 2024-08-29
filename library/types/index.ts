import { SIWEConfig } from "connectkit";
import { Address } from "viem";

export type SIWESession = {
  address: Address;
  chainId: number;
  did?: string;
};

export interface CustomSIWEConfig extends Omit<SIWEConfig, "getSession"> {
  getSession: () => Promise<SIWESession | null>;
}
