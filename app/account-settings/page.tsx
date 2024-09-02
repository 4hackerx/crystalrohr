"use client"
import React, { useState } from 'react';
import { User, Video, Upload, Edit } from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/api/placeholder/150/150',
  });

  const [translatedVideos, setTranslatedVideos] = useState([
    { id: 1, title: 'Nature Documentary', date: '2024-08-15' },
    { id: 2, title: 'Cooking Tutorial', date: '2024-08-10' },
    { id: 3, title: 'Tech Review', date: '2024-08-05' },
  ]);

  
  return (
    <div className="min-h-screen bg-black text-white">
      
      <main className="container mx-auto mt-8 px-4">
        <div className="bg-black shadow-lg rounded-lg overflow-hidden border-2 border-[#550EFB]">
          <div className="bg-[#550EFB] p-6 flex items-center">
            <div className="relative">
              {/* <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white" /> */}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer">
                <Upload size={20} className="text-[#550EFB]" />
              </label>
              <input id="avatar-upload" type="file" className="hidden" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-white opacity-80">{user.email}</p>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Profile Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <User size={20} className="text-[#550EFB] mr-2" />
                <span>Name: {user.name}</span>
                <button className="ml-auto text-[#550EFB]">
                  <Edit size={16} />
                </button>
              </div>
              <div className="flex items-center">
                <Video size={20} className="text-[#550EFB] mr-2" />
                <span>Videos Translated: {translatedVideos.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-black shadow-lg rounded-lg overflow-hidden  border-2 border-[#550EFB]">
          <div className="bg-[#360C99] text-white p-4">
            <h3 className="text-xl font-semibold">Translated Video History</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {translatedVideos.map((video) => (
              <li key={video.id} className="p-4 hover:bg-neutral-800">
                <div className="flex justify-between">
                  <span className="font-medium">{video.title}</span>
                  <span className="text-gray-500">{video.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
