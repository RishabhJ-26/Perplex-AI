import Image from "next/image";
import React from "react";

const ImageList = ({ images }) => {
  // Use the images prop directly
  const imageResults = images || [];
  
  if (imageResults.length === 0) {
    return (
      <div className="mt-4">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Images Available
          </h3>
          <p className="text-gray-500">
            No images found for this search. Try searching for specific image-related terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {imageResults.map((item, index) => {
        return (
          <div key={index} className="group cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                onError={e => {
                  if (!e.target.src.endsWith('/fallback.jpg')) {
                    e.target.src = '/fallback.jpg';
                  }
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-white/80 text-xs line-clamp-1">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageList;
