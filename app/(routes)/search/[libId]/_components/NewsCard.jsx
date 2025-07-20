import React from "react";

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

const NewsCard = ({ news }) => {
  const description = news?.snippet || "No description available.";
  const url = news?.link;
  const title = news?.title || "No Title";
  const image = news?.thumbnail?.original || news?.thumbnail || news?.image || null;
  const domain = getDomain(url);
  const favicon = getFavicon(url);

  return (
    <div
      className="border rounded-2xl mt-6 cursor-pointer hover:shadow-lg transition bg-white"
      onClick={() => window.open(url, "_blank")}
      tabIndex={0}
      role="button"
      onKeyPress={e => { if (e.key === 'Enter') window.open(url, "_blank"); }}
    >
      <div className="w-full h-[180px] rounded-t-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
          />
        ) : (
          <img src={favicon} alt={domain} className="w-16 h-16 rounded" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {favicon && <img src={favicon} alt={domain} className="w-5 h-5 rounded" />}
          <span className="text-xs text-gray-500">{domain}</span>
        </div>
        <h2 className="text-xl font-bold line-clamp-2">{title}</h2>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default NewsCard;
