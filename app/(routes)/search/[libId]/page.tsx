"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import supabase from "../../../../services/supabase";
import Header from "../[libId]/_components/Header";
import DisplayResult from "./_components/DisplayResult";

function SearchQueryResult() {
  const { libId } = useParams();
  const [searchInputRecord, setSearchInputRecord] = useState(null);

  useEffect(() => {
    // Add a small delay to ensure the database record is created
    const timer = setTimeout(() => {
      getSearchQueryResult();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const getSearchQueryResult = async () => {
    try {
      // First, let's test a simple query to see if Supabase is working
      const { data: testData, error: testError } = await supabase
        .from("Library")
        .select("count")
        .limit(1);
      
      if (testError) {
        return;
      }
      
      // Now try the actual query
      const { data: Library, error } = await supabase
        .from("Library")
        .select("*,Chats(*)")
        .eq("libId", libId)

      if (error) {
        return;
      }

      if (Library && Library.length > 0) {
        setSearchInputRecord(Library[0]);
      } else {
        setSearchInputRecord(null);
      }
    } catch (catchError) {
      console.error("Caught error in getSearchQueryResult:", catchError);
      console.error("Error stack:", catchError.stack);
    }
  };

  return (
    <div className="w-full">
      {searchInputRecord && <Header searchInputRecord={searchInputRecord} />}
      <div className="px-10 md:px-20 lg:px-36 xl:px-56 mt-4">
        {searchInputRecord && (
          <DisplayResult searchInputRecord={searchInputRecord} />
        )}
      </div>
    </div>
  );
}

export default SearchQueryResult;
