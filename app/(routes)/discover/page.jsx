"use client";
import axios from "axios";
import {
  Cpu,
  DollarSign,
  Globe,
  Palette,
  Star,
  Volleyball,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import NewsCard from "../../../app/(routes)/search/[libId]/_components/NewsCard";

const options = [
  { title: "Top", icon: Star },
  { title: "Tech & Science", icon: Cpu },
  { title: "Finance", icon: DollarSign },
  { title: "Art & Culture", icon: Palette },
  { title: "Sports", icon: Volleyball },
];

function Discover() {
  const [selectedOption, setSelectedOption] = useState("Top");
  const [latestNews, setLatestNews] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedOption) {
      GetSearchResult();
    }
  }, [selectedOption]);

  const GetSearchResult = async () => {
    setIsLoading(true);
    try {
      // Use 'Trending' in the search query for more relevant trending news
      let trendingQuery = "Trending " + selectedOption + " News";
      if (selectedOption === "Top") trendingQuery = "Trending News";
      const result = await axios.post("/api/serper-search-api", {
        searchInput: trendingQuery,
        searchType: "news",
      });
      // Use 'news' field if present, otherwise fallback to 'organic'
      const newsResults = result?.data?.news || result?.data?.organic || [];
      setLatestNews(newsResults);
    } catch (error) {
      setLatestNews([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="px-10 md:px-20 lg:px-36 xl:px-56 mt-4 w-full">
      <h2 className="font-bold text-3xl flex gap-2 items-center">
        <Globe />
        <span>Discover</span>
      </h2>

      <div className="flex mt-5 gap-4 flex-wrap">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => setSelectedOption(option.title)}
            className={`flex items-center gap-2 p-3 rounded-md hover:text-primary cursor-pointer ${
              selectedOption === option.title
                ? "bg-accent text-primary rounded-full"
                : ""
            }`}
          >
            <option.icon className="h-5 w-5 text-gray-500" />
            <span className="text-gray-800">{option.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border rounded-2xl mt-6 bg-gray-100 animate-pulse w-full h-[90px] flex flex-col" />
          ))
        ) : Array.isArray(latestNews) && latestNews.length > 0 ? (
          latestNews.map((item, index) => {
            const url = item.link;
            const domain = (() => {
              try {
                return new URL(url).hostname.replace(/^www\./, "");
              } catch {
                return url;
              }
            })();
            const favicon = (() => {
              try {
                const domain = new URL(url).hostname;
                return `https://www.google.com/s2/favicons?domain=${domain}`;
              } catch {
                return null;
              }
            })();
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded transition cursor-pointer border"
                onClick={() => window.open(url, "_blank")}
                tabIndex={0}
                role="button"
                onKeyPress={e => { if (e.key === 'Enter') window.open(url, "_blank"); }}
              >
                {favicon && <img src={favicon} alt={domain} className="w-5 h-5 rounded mt-1" />}
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-medium truncate max-w-[120px]">{domain}</div>
                  <div className="font-semibold text-gray-800 text-base line-clamp-2">{item.title}</div>
                  {item.snippet && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">{item.snippet}</div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground mt-6">No news found.</p>
        )}
      </div>
      {/* <div className="grid grid-cols-2 gap-2">
        {latestNews.map((item, index) => (
          <NewsCard news= {item} key={index}  />
        ))}
      </div> */}
    </div>
  );
}

export default Discover;
