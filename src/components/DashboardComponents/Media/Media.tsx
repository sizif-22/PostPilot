"use client";
import React, { useState , useEffect } from 'react'
import { FaUpload } from 'react-icons/fa'

export const Media = () => {
  const [cols , setCols] = useState<number>(3);
  const photos = [
    'https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8',
    'https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg',
    'https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8',
    'https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg',
    'https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8',
    'https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FeRL0cLWK0q?alt=media&token=92094ae8-ee14-4cdc-ad55-7ddd728c95b7',
    'https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg',
  ];

  const getColumnPhotos = (colIndex: number) => {
    return photos.filter((_, index) => index % cols === colIndex);
  };

  useEffect(() => {
    
    const handleResize = () => {
      setCols(window.innerWidth < 768 ? 2 :
        window.innerWidth < 1024 ? 3 : 4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow">
      <div className='flex p-3 h-16 sticky top-0 z-10 bg-white justify-between items-center px-4 border-b border-stone-200'>
        <div className="flex  justify-between items-center w-full">
          <h2 className="font-bold text-xl">Media</h2>
          <button className='flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded'>
            <FaUpload className="text-violet-500"/>
            <span>Upload</span>
          </button>
        </div>
      </div>
      <div className={`grid ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'} px-8 py-4 gap-4 h-full`}>
        {[...Array(cols)].map((_, colIndex) => (
          <div key={colIndex} className="w-full h-fit pb-16 rounded-lg">
            {getColumnPhotos(colIndex).map((photo, index) => (
              <div key={index} className="relative group mb-4 rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt="photo" 
                  className="w-full h-fit max-h-[40vh]  lg:max-h-[60vh] md:min-h-[150px] min-h-[100px] shadow-md transition-all duration-300 object-cover rounded-lg" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
