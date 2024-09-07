"use client"
import React, { useState } from 'react'
import {coreKitInstance, verifierConfig} from '../web3auth/config';
import { useConnect } from 'wagmi';
import LoginButton from '../Components/LoginButton';
import Initializer from '../web3auth/Initializer';

const page = () => {
  return (
    <>
    <Initializer/>
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
            Create User
          </span>
        </h1>
      </div>
      <div className='w-full h-full flex py-10 justify-center gap-20'>
        <LoginButton Title='User'/>
        <LoginButton Title='Node'/>
      </div>
    </div>
    </>
  )
}

export default page