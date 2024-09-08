import { useAccount, useConnect } from "wagmi";
import DisconnectButton from "../../../app/Components/DisconnectButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import Web3AuthConnectorInstance, { web3AuthInstance } from "@/web3auth/config";
import { sepolia } from "viem/chains";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { useSwitchChain } from 'wagmi'

const Header = () => {
  const {isConnected,address} = useAccount();
  const [path,setPath] = useState("");
  const { chains, switchChain } = useSwitchChain()

  const switchChains = async ()=>{
    await web3AuthInstance.addChain({
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x7a31c7",
      rpcTarget: "https://api.helium.fhenix.zone",
      displayName: "Fhenix Helium",
      blockExplorerUrl: "https://explorer.helium.fhenix.zone",
      ticker: "tFHE",
      tickerName: "tFHE",
      logo: "https://img.cryptorank.io/coins/fhenix1695737384486.png",
    }).then(async()=>{
      await web3AuthInstance.switchChain({ chainId: "0xaa36a7" });
    })
  }
  return( 
    <header className="bg-black backdrop-blur-md shadow-md ">
    <div className="container px-4 py-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-[#550EFB]"><span className="text-[#550EFB]">C</span>rystal<span className="text-[#550EFB]">R</span>ohr</h1>
      {/* <a href="#problem" className="text-white p-2 border border-3 border-transparent hover:border-b-[#550EFB]">{isConnected??<DisconnectButton/>}</a>     */}
      {address?
      <>
      <div className="w-full flex items-start justify-start px-8 py-4 gap-5">
  
        <Link href="/token-management"><span className="text-lg text-white font-bold hover:border-b-2 hover:border-b-[#550EFB] focus:border-b-2 focus:border-b-[#550EFB]">Wallet</span></Link>
        <Link href="/account-settings"><span className="text-lg text-white font-bold hover:border-b-2 hover:border-b-[#550EFB] focus:border-b-2 focus:border-b-[#550EFB]">Profile</span></Link>
      </div>




    <div>
      {chains.map((chain) => (
        <button className="text-white p-4 bg-red-299" key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
          {chain.name}
        </button>
      ))}
    </div>
  

      <DisconnectButton/>
      </>
     :
    "Get Started"}
    </div>
  </header>
  )
  ;
};

export default Header;
