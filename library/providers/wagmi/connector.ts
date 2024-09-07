import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { coreKitInstance } from "../../../app/web3auth/config";

export const web3AuthConnector = new (Web3AuthConnector as any)({
    // Your Web3Auth configuration
    web3AuthInstance:coreKitInstance,
})