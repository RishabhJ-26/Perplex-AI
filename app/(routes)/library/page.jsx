"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import supabase from "../../../services/supabase";
import moment from "moment";
import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

function Library() {
  const { user } = useUser();
  const [libraryHistory, setLibraryHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      GetLibraryHistory();
    }
  }, [user]);

  const GetLibraryHistory = async () => {
    const { data: Library, error } = await supabase
      .from("Library")
      .select("*")
      .eq("userEmail", user?.primaryEmailAddress?.emailAddress)
      .order("id", { ascending: false });

    if (error) {
      // Removed all console.log and console.error statements for production
    } else {
      setLibraryHistory(Library || []);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32 mt-4 flex flex-col items-center justify-center">
      <h2 className="font-bold text-2xl">Library</h2>
      <div className="mt-6 space-y-2 w-full max-w-4xl mx-auto">
        {libraryHistory.length === 0 ? (
          <p className="text-gray-500">No search history found.</p>
        ) : (
          libraryHistory.map((item, index) => (
            <div key={index} onClick={() => router.push('/search/' + item.libId)} className="cursor-pointer">
               <div className="flex items-center justify-between">
                <h2 key={index} className="text-lg text-gray-800 font-bold">
                  {item.searchInput}
                </h2>
                <p className="text-xs text-gray-500">
                  {moment(item.created_at).fromNow()}
                </p>
              </div>
              <SquareArrowOutUpRight className="h-4 w-4" />
                <hr className="my-4" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Library;
