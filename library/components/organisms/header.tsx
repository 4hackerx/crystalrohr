import { useAccount, useConnect } from "wagmi";
import DisconnectButton from "../../../app/Components/DisconnectButton";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const {isConnected,address} = useAccount();
  const [path,setPath] = useState("");
 
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
