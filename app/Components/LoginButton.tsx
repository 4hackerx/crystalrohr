"use client"
import React from 'react'
import { useConnect } from 'wagmi'
import { web3AuthConnector } from '../../library/providers/wagmi/connector';
import Initializer from '../web3auth/Initializer';

const LoginButton = ({Title}:{Title:string}) => {
    const {connect,connectors} = useConnect();
    async function connectThroughWeb3Auth() {
      try {
          console.log("Connectors:", connectors[0]);
          if (connectors.length > 0) {
              await connect({ connector: connectors[0] });
          } else {
              console.error("No connectors available");
          }
      } catch (error) {
          console.error("Error connecting through Web3Auth:", error);
      }
  }
  return (
    <>
    <div id="box" className='bg-[#550EFB] h-[20rem] w-[25rem] rounded-xl px-5 py-3 flex items-center justify-center' onClick={connectThroughWeb3Auth}>
            <span className='text-2xl text-white font-bold'>{Title}</span>
    </div>
    
    </>
  )
}

export default LoginButton