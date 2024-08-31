"use client"
import React, { useState } from 'react';
import { User, Users } from 'lucide-react';

const RoleSelectionPage = () => {
    const [role, setRole]= useState("Client");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="absolute inset-0"></div>
      
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3f169e] to-[#5211eb]">
          Choose Your Role
        </h1>
        <p className="text-xl text-gray-300">
          Are you here to create or to explore the vast universe of content?
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1 bg-gradient-to-r from-[#3f169e] to-[#5e2dd0] rounded-lg p-6">
          <div className="bg-black bg-opacity-30 rounded-lg p-5 h-full flex flex-col items-center justify-center border-2 border-transparent ">
            <User size={64} className="mb-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
            <h2 className="text-2xl text-white font-semibold mb-2">Client</h2>
            <p className="text-gray-300 text-center">
              Craft immersive experiences and share your vision with the world.
            </p>
            <button onClick={()=>setRole('Client')} className='text-blue-600'>Login</button>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-r from-[#3f169e] to-[#550EFB] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
          <div className="bg-black bg-opacity-30 rounded-lg p-6 h-full flex flex-col items-center justify-center">
            <Users size={64} className="mb-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            <h2 className="text-2xl font-semibold mb-2">Node</h2>
            <p className="text-gray-300 text-center">
              Discover amazing content and embark on a journey through creativity.
            </p>
            <button onClick={()=>setRole('Node')}><a href="" className='text-blue-600'>Login</a></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;