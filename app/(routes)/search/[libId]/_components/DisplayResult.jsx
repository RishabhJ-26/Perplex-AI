import React, { useEffect, useState, useRef } from "react";
import {
  ArrowUp,
  LucideImage,
  LucideList,
  LucideSparkles,
  LucideVideo,
  Send,
} from "lucide-react";
import axios from "axios";
import AnswerDisplay from "./AnswerDisplay";
import ImageList from "./ImageList";
import VideoList from "./VideoList";
import SourceListTab from "./SourceListTab";
import { useParams } from "next/navigation";
import supabase from "../../../../../services/supabase";
import { Button } from "../../../../../components/ui/button";

const tabs = [
  {
    label: "Answer",
    icon: LucideSparkles,
  },
  {
    label: "Images",
    icon: LucideImage,
  },
  {
    label: "Videos",
    icon: LucideVideo,
  },
  {
    label: "Sources",
    icon: LucideList,
  },
];

const DisplayResult = ({ searchInputRecord }) => {
  const [activeTab, setActiveTab] = useState("Answer");
  const [searchResult, setSearchResult] = useState(null); // or [] if expected to be an array
  const { libId } = useParams();
  const [userInput, setUserInput] = useState("");
  const hasSearchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false); // <-- Add loading state

  useEffect(() => {
    if (searchInputRecord && !hasSearchedRef.current) {
      
      if (searchInputRecord?.Chats?.length === 0) {
        hasSearchedRef.current = true;
        GetSearchApiResult();
      } else {
        GetSearchRecords();
      }
      
      setSearchResult(searchInputRecord);
    }
  }, [searchInputRecord]);

  const GetSearchApiResult = async () => {
    setIsLoading(true); // <-- Set loading true on send
    const inputToUse = userInput || searchInputRecord?.searchInput;

    try {
      const result = await axios.post("/api/serper-search-api", {
        searchInput: inputToUse,
        searchType: searchInputRecord?.searchType ?? "Search",
      });
      
      const searchResp = result.data;
      
      // Make additional API calls for images and videos
      let imagesResp = null;
      let videosResp = null;
      
      try {
        // Get images
        const imagesResult = await axios.post("/api/serper-search-api", {
          searchInput: inputToUse,
          searchType: "Images",
        });
        imagesResp = imagesResult.data;
      } catch (error) {
        // console.error("Images API call failed:", error.message);
      }
      
      try {
        // Get videos
        const videosResult = await axios.post("/api/serper-search-api", {
          searchInput: inputToUse,
          searchType: "Videos",
        });
        videosResp = videosResult.data;
      } catch (error) {
        // console.error("Videos API call failed:", error.message);
      }

      // Format Serper API results - include knowledgeGraph, organic, images, and videos
      let formattedResult = [];
      
      // Add knowledgeGraph as first result if available
      if (searchResp?.knowledgeGraph) {
        const kg = searchResp.knowledgeGraph;
        formattedResult.push({
          title: kg.title,
          description: kg.description,
          long_name: kg.descriptionSource || "Knowledge Graph",
          img: kg.imageUrl,
          url: kg.descriptionLink,
          thumbnail: kg.imageUrl,
          type: 'knowledgeGraph',
          position: 0,
        });
      }
      
      // Add organic results
      if (searchResp?.organic) {
        const organicResults = searchResp.organic.map((item) => ({
          title: item.title,
          description: item.snippet,
          long_name: item.displayedLink || item.source,
          img: null,
          url: item.link,
          thumbnail: null,
          type: 'organic',
          position: item.position,
          date: item.date,
          sitelinks: item.sitelinks,
        }));
        formattedResult = [...formattedResult, ...organicResults];
      }
      
      // Add images results
      if (imagesResp?.images) {
        const imageResults = imagesResp.images.map((item) => ({
          title: item.title,
          description: item.snippet,
          img: item.imageUrl,
          url: item.link,
          thumbnail: item.imageUrl,
          type: 'image',
          position: item.position,
        }));
        formattedResult = [...formattedResult, ...imageResults];
      }
      
      // Add videos results
      if (videosResp?.videos) {
        const videoResults = videosResp.videos.map((item) => ({
          title: item.title,
          description: item.snippet,
          img: item.imageUrl,
          url: item.link,
          thumbnail: item.imageUrl,
          type: 'video',
          position: item.position,
          duration: item.duration,
          channel: item.channel,
        }));
        formattedResult = [...formattedResult, ...videoResults];
      }
      
      const { data, error } = await supabase
        .from("Chats")
        .insert([
          {
            libId: libId,
            searchResult: formattedResult,
            userSearchInput: inputToUse,
          },
        ])
        .select();

      if (error) {
        // console.error("Supabase insert error:", error);
        return;
      }

      if (data && data.length > 0) {
        await GenerateAiResponse(formattedResult, data[0].id);
      }

      await GetSearchRecords();
      setIsLoading(false); // <-- Set loading false after all
    } catch (error) {
      setIsLoading(false); // <-- Set loading false on error
      // console.error("Error in GetSearchApiResult:", error);
    }
  };

  const GenerateAiResponse = async (formattedResult, recordId) => {
    try {
      const inputToUse = userInput || searchInputRecord?.searchInput;
      
      const requestData = {
        searchInput: inputToUse,
        searchResult: formattedResult || [],
        recordId: recordId,
      };
      
      let runId;
      try {
        const res = await axios.post("/api/llm-model", requestData);
        runId = res.data;
      } catch (error) {
        // console.error("LLM API Error:", error && (error.response?.data || error.message || error.toString()), error);
        setIsLoading(false); // Ensure loading is stopped on error
        // Continue without AI response if there's an error
        return;
      }

      // Check if the AI response is already completed (direct response)
      if (runId === "ai-completed") {
        await GetSearchRecords();
        return;
      }

      // Poll for AI completion with timeout
      let pollCount = 0;
      const maxPolls = 30; // e.g., 30*2s = 60 seconds max
      const interval = setInterval(async () => {
        pollCount++;
        if (pollCount > maxPolls) {
          clearInterval(interval);
          setIsLoading(false);
          // console.error("AI response polling timed out.");
          return;
        }
        try {
          // Check the chat record directly for AI response
          const { data: chatData, error: chatError } = await supabase
            .from("Chats")
            .select("aiResp")
            .eq("id", recordId)
            .single();

          if (chatError) {
            // console.error("Error checking chat status:", chatError);
            clearInterval(interval);
            setIsLoading(false);
            return;
          }

          if (chatData?.aiResp) {
            await GetSearchRecords();
            clearInterval(interval);
            setIsLoading(false);
          }
        } catch (error) {
          // console.error("Error checking AI status:", error && (error.response?.data || error.message || error.toString()), error);
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 2000); // Check every 2 seconds
    } catch (error) {
      // console.error("Error starting LLM task:", error);
      // Continue without AI response if there's an error
    }
  };

 const GetSearchRecords = async () => {
  let { data, error } = await supabase
    .from("Library")
    .select("*, Chats(*)")
    .eq("libId", libId)
    .order("id", { foreignTable: "Chats", ascending: true }); 

  if (error) {
    // console.error("Supabase error:", error);
    return;
  }

  setSearchResult(data?.[0]); 
 };


  return (
    <div className="pb-32">
      {searchResult?.Chats && searchResult.Chats.length > 0 ? (
        searchResult.Chats.map((chat, idx) => (
          <div key={chat.id || idx}>
            <h2 className="font-medium text-3xl line-clamp-2">
              {chat?.userSearchInput}
            </h2>
            <div className="flex gap-4 mt-4">
              {tabs.map(({ label, icon: Icon }) => {
                let badge = null;
                if (label === "Sources" && chat?.searchResult) {
                  badge = chat.searchResult.filter(item => item.type === 'organic' || item.type === 'knowledgeGraph').length;
                } else if (label === "Images" && chat?.searchResult) {
                  badge = chat.searchResult.filter(item => item.type === 'image').length;
                } else if (label === "Videos" && chat?.searchResult) {
                  badge = chat.searchResult.filter(item => item.type === 'video').length;
                }
                return (
                  <button
                    key={label}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md ${
                      activeTab === label
                        ? "bg-gray-200 text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => setActiveTab(label)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                    {badge && badge > 0 && (
                      <span className="bg-gray-300 text-gray-800 rounded-full px-2 text-xs font-medium">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Tab Content */}
            <div>
              {activeTab === "Answer" ? (
                isLoading ? (
                  <div className="mt-7 flex flex-col gap-3">
                    {/* Loading skeleton cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 min-h-[90px] mt-3 flex flex-col gap-2">
                          <div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 w-2/3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <AnswerDisplay chat={chat} />
                )
              ) : activeTab === "Sources" ? (
                isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 min-h-[90px] mt-3 flex flex-col gap-2">
                        <div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SourceListTab chat={chat} />
                )
              ) : activeTab === "Images" ? (
                <ImageList images={chat?.searchResult?.filter(item => item.type === 'image') || []} />
              ) : activeTab === "Videos" ? (
                <VideoList videos={chat?.searchResult?.filter(item => item.type === 'video') || []} />
              ) : null}
            </div>
            <hr className="my-5" />
          </div>
        ))
      ) : (
        // Show heading and loading skeletons if loading and no chats yet
        <>
          <h2 className="font-medium text-3xl line-clamp-2">
            {searchInputRecord?.searchInput || userInput}
          </h2>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 min-h-[90px] mt-3 flex flex-col gap-2">
                  <div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
       <div className="bg-white w-full border rounded-lg shadown-md p-3 px-5 mb-10 flex justify-between fixed bottom-6 xl:max-w-3xl">
        <input
          type="text"
          placeholder="Type anything..."
          className="outline-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userInput && userInput.trim() && !isLoading) {
              const trimmedInput = userInput.trim();
              if (!trimmedInput) return;
              setUserInput(""); // Clear input immediately
              GetSearchApiResult();
            }
          }}
        />
        {userInput?.length > 0 && userInput.trim() && !isLoading ? (
          <Button
            onClick={() => {
              const trimmedInput = userInput.trim();
              if (!trimmedInput) return;
              setUserInput(""); // Clear input immediately
              GetSearchApiResult();
            }}
          >
            <Send />
          </Button>
        ) : isLoading ? (
          <Button disabled>
            <span className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default DisplayResult;
