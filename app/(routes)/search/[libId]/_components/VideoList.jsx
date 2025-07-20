import React from "react";

const VideoList = ({ videos }) => {
  // Use the videos prop directly
  const videoResults = videos || [];
  
  if (videoResults.length === 0) {
    return (
      <div className="mt-4">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🎥</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Videos Available
          </h3>
          <p className="text-gray-500">
            No videos found for this search. Try searching for specific video-related terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {videoResults.map((item, index) => (
        <div key={index} className="group cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/fallback.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <h3 className="text-white text-sm font-medium line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-white/80 text-xs mt-1">
                <span>{item.channel || 'Unknown Channel'}</span>
                {item.duration && (
                  <span>{item.duration}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList; 