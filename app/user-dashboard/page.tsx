"use client"
import React, { useState } from 'react';
import { Upload, UploadCloud, RefreshCw, ChevronRight, Play, Clock, Layers, Divide, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { coreKitInstance} from '../web3auth/config';

const VideoProcessingPage = () => {
  type VideoDetails = {
    totalWords: number;
    totalLength: string;
    totalScenes: number;
    // Other properties...
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [videoDetails, setVideoDetails] = useState<VideoDetails>({
    totalWords: 0,
    totalLength: '',
    totalScenes: 0,
  });
  
  const [file, setFile]= useState<File|null>(null);
  const [Url, setURL] = useState("");

 

  const handleFileUpload = (event:any) => {
    const File = event.target.files[0];
    const formData = new FormData();
    formData.append("inputFile", File);
    console.log(formData.get("inputFile"));
    if (File.type=="video/mp4") {
      setFile(file=>file=File);
      console.log(file);
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);
    }
    else{
      setUploadProgress(-1);
    }
  };

  const handleGetStatus = () => {
    const interval = setInterval(() => {
      setTranslationProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setVideoDetails({
            totalWords: 1500,
            totalLength: '5:30',
            totalScenes: 12,
          });
          return 100;
        }
        return prevProgress + 20;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
            Video Processing Hub
          </span>
        </h1>

          {/* Video Upload Section */}
          <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg w-[70%]">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Upload className="mr-2" /> Upload Your Video
            </h2>
          

            {!file ?
               <div className="bg-black bg-opacity-30 rounded-xl p-6">
                <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#550EFB] border-dashed rounded-lg cursor-pointer hover:bg-[#550EFB] hover:bg-opacity-10 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-[#550EFB]" />
                  <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">MP4, AVI, or MOV (MAX. 800MB)</p>
                </div>
                <input id="video-upload" type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div> 
                :
                <div className="flex flex-col items-center justify-center">
                  <p className="mb-2 text-sm">{file.name} is uploading. <span className="font-semibold">Please wait</span></p>
                  <X className='w-5 h-5 self-end' onClick={()=>{
                    setUploadProgress(0);
                    setFile(null);
                  }}/>
                </div>
                }
                
                
            {uploadProgress < 0 && (
              <div className='font-light mt-7 text-center text-sm text-gray-500'>Upload video of type mp4</div>
            )}
            {uploadProgress > 0 && uploadProgress<100 && (
              <div className="mt-6">
                {/* <p className="text-sm font-medium mb-2 flex justify-between">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </p>
                <Progress value={uploadProgress} className="w-full h-2 bg-black bg-opacity-30" indicatorClassName="bg-[#550EFB]" /> */}
                <p>Uploading...</p>
              </div>
            )}
            {uploadProgress==100 &&(
              <Button onClick={handleGetStatus} className="w-full bg-[#1f0a4f] hover:bg-[#360C99] transition-colors duration-300 mt-8" >
                Get Status <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </section>

          {/* Translation Progress Section */}
          {/* <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <RefreshCw className="mr-2" /> Translation Progress
            </h2>
            <div className="bg-black bg-opacity-30 rounded-xl p-6">
              <Progress value={translationProgress} className="w-full h-4 mb-4 bg-black bg-opacity-30" indicatorClassName="bg-[#550EFB]" />
              <p className="text-sm font-medium mb-6 flex justify-between">
                <span>Progress</span>
                <span>{translationProgress}%</span>
              </p>
              
            </div>
          </section> */}
        {/* Video Details Section */}
        {videoDetails && (
          <section className="mt-8 bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg w-[70%] flex flex-col ">
            <h2 className="text-2xl font-semibold mb-6">Video Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                <Play className="w-8 h-8 mb-4 text-[#550EFB]" />
                <p className="text-sm font-medium mb-2 text-gray-400">Total Words</p>
                <p className="text-3xl font-bold">{videoDetails.totalWords}</p>
              </div>
              <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                <Clock className="w-8 h-8 mb-4 text-[#550EFB]" />
                <p className="text-sm font-medium mb-2 text-gray-400">Total Length</p>
                <p className="text-3xl font-bold">{videoDetails.totalLength}</p>
              </div>
              <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                <Layers className="w-8 h-8 mb-4 text-[#550EFB]" />
                <p className="text-sm font-medium mb-2 text-gray-400">Total Scenes</p>
                <p className="text-3xl font-bold">{videoDetails.totalScenes}</p>
              </div>
            </div>
            <Button className= "w-full bg-[#1f0a4f] hover:bg-[#360C99] transition-colors duration-300 mt-8">Download Caption</Button>
          </section>
        )}
      </div>
    </div>
  );
};

export default VideoProcessingPage;
