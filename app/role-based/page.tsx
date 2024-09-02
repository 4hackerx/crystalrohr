"use client"
import React from 'react'
import {coreKitInstance, verifierConfig} from '../web3auth/config';

const page = () => {
  const login = async ()=>{
      await coreKitInstance.loginWithOAuth(verifierConfig)
      .then((data)=>console.log(data));
  }
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
            Create User
          </span>
        </h1>
      </div>
      <div className='w-full h-full flex py-10 justify-center gap-20'>
        <div id="box" className='bg-[#550EFB] h-[20rem] w-[25rem] rounded-xl px-5 py-3 flex items-center justify-center' onClick={login}>
            <span className='text-2xl text-white font-bold'>User</span>
        </div>
        <div id="box" className='bg-[#550EFB] h-[20rem] w-[25rem] rounded-xl px-5 py-3' onClick={login}>
        <span className='text-2xl text-white font-bold'>Node</span>
        </div>
      </div>
    </div>
  )
}

export default page