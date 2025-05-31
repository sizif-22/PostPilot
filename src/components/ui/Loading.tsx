import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-violet-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-violet-600 animate-pulse font-[PlaywriteHU]">
          PostPilot
        </h1>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-violet-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-violet-700 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
