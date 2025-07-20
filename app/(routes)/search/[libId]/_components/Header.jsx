import { UserButton } from "@clerk/nextjs";
import React from "react";
import { Clock, Link2, Share } from "lucide-react";
import moment from "moment";
import { Button } from "../../../../../components/ui/button";

const Header = ({ searchInputRecord }) => {
  return (
    <div className="px-6 py-4 border-b flex items-center w-full gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <UserButton />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{moment(searchInputRecord?.created_at).fromNow()}</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <h2 className="text-base font-medium line-clamp-1 max-w-md text-gray-800 text-center">
          {searchInputRecord?.searchInput}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Link2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Header;
