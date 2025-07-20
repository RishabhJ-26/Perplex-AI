import React from "react";

const stripTags = (str) => str?.replace(/<strong>|<\/strong>/g, "") || "";

const SourceList = ({ webResult }) => {
  // Removed all console.log statements for production

  if (!Array.isArray(webResult) || webResult.length === 0) {
    return (
      <div className="text-gray-500 text-sm mt-3">
        No key information found for this search.
      </div>
    );
  }

  // Limit to first 5 results
  const limitedResults = webResult.slice(0, 5);

  // Show a summary grid of up to 5 results, with NO heading
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
      {limitedResults.map((item, idx) => (
        <div key={idx} className="bg-accent rounded-xl p-3 shadow hover:bg-[#e1e3da] transition cursor-pointer h-full flex flex-col" onClick={() => window.open(item.url || item.link, "_blank")}> 
          <h3 className="text-base font-semibold text-black line-clamp-2">{stripTags(item.title)}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{stripTags(item.description || item.snippet)}</p>
        </div>
      ))}
    </div>
  );
};

export default SourceList;
