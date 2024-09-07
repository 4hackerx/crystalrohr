"use client"
import React from 'react'
import LoginButton from '../Components/LoginButton';

const page = () => {
  return (
        <div className="w-screen min-h-screen flex flex-col items-center justify-start py-20 bg-black text-white px-4">
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3f169e] to-[#5211eb]">
          Choose Your Role
        </h1>
        <p className="text-xl text-gray-300">
          Are you here to create or to explore the vast universe of content?
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <LoginButton title="User" desc="Craft immersive experiences and share your vision with the world."/>
        <LoginButton title="Node" desc="Discover amazing content and embark on a journey through creativity."/>
      </div>
      </div>
  )
}

export default page
