import Image from "next/image";
import React, { useState } from "react";

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch {
    return null;
  }
};

const FaviconOrFallback = ({ url, img, title }) => {
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const domain = getDomain(url);
  const initial = domain?.[0]?.toUpperCase() || "?";

  if (!faviconError) {
    return (
      <img
        src={getFavicon(url)}
        alt={domain}
        width={20}
        height={20}
        className="rounded w-5 h-5 object-cover border bg-white"
        onError={() => setFaviconError(true)}
      />
    );
  }
  if (img && !imgError) {
    return (
      <img
        src={img}
        alt={title}
        width={20}
        height={20}
        className="rounded w-5 h-5 object-cover border bg-white"
        onError={() => setImgError(true)}
      />
    );
  }
  // Fallback: colored circle with domain initial
  return (
    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border">
      {initial}
    </div>
  );
};

const SourceListTab = ({ chat }) => {
  // Filter to only show organic and knowledgeGraph results (not images/videos) - show all results
  const sourceResults = chat?.searchResult?.filter(item => 
    item.type === 'organic' || item.type === 'knowledgeGraph'
  ) || [];

  return (
    <div className="flex flex-col gap-2 mt-4">
      {sourceResults.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-2 hover:bg-gray-100 rounded transition cursor-pointer"
          onClick={() => window.open(item?.url, "_blank")}
        >
          <FaviconOrFallback url={item.url} img={item.img} title={item.title} />
          <div className="flex-1">
            <div className="text-xs text-gray-500 font-medium truncate max-w-[120px]">{getDomain(item.url)}</div>
            <div className="font-semibold text-gray-800 text-base line-clamp-2">{item.title}</div>
            {item.description && (
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourceListTab;
