import { Web3AuthMPCCoreKit, WEB3AUTH_NETWORK, SubVerifierDetailsParams } from "@web3auth/mpc-core-kit";
import { tssLib } from "@toruslabs/tss-dkls-lib";

export let coreKitInstance: Web3AuthMPCCoreKit;
if(typeof window != "undefined"){

    coreKitInstance  = new Web3AuthMPCCoreKit({ web3AuthClientId: "BAf-TMvY5A8y73hRyyj_GBRkUmd_Yz5bZ8sFvExZp9Zl40BzI8LBktJ2piFwoeP5HxMWoPG8yD23vYwRXtkHa8M",
        web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET, manualSync: true, // This is the recommended approach
        tssLib: tssLib, storage: window.localStorage,redirectPathName:"user-dashboard" });
}

export const verifierConfig = {
    subVerifierDetails: {
      typeOfLogin: "google",
      verifier: "custom-test-2",
      clientId: "97655760426-ahm01c10i9arv4orohdpgrljdi7dshk6.apps.googleusercontent.com"
    },
  } as SubVerifierDetailsParams;

