"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import Image from "next/image";
import { Compass, GalleryHorizontalEnd, LogIn, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

const MenuOptions = [
  {
    title: "Home",
    icon: Search,
    path: "/",
  },
  {
    title: "Discover",
    icon: Compass,
    path: "/discover",
  },
  {
    title: "Library",
    icon: GalleryHorizontalEnd,
    path: "/library",
  },
  {
    title: "Sign In",
    icon: LogIn,
    path: "/sign-in",
  },
];

const AppSidebar = () => {
  const path = usePathname();
  const { user } = useUser();

  // Filter out "Sign In" if user exists
  const filteredMenuOptions = user
    ? MenuOptions.filter((option) => option.title !== "Sign In")
    : MenuOptions;

  return (
    <Sidebar className="fixed left-0 top-0 h-screen z-30">
      <SidebarHeader className="bg-accent flex items-center py-5">
        <Image src={"/logo.png"} alt="Logo" width={180} height={140} priority />
      </SidebarHeader>
      <SidebarContent className="bg-accent">
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {filteredMenuOptions.map((option, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className={`p-5 py-6 hover:bg-transparent hover:font-bold ${
                      path?.includes(option.path) ? "font-bold" : ""
                    }`}
                  >
                    <a href={option.path}>
                      <option.icon className="h-8 w-8" />
                      <span className="text-lg">{option.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {!user ? (
              <SignUpButton mode="modal">
                <Button className="rounded-full mx-4 mt-4">Sign Up</Button>
              </SignUpButton>
            ) : (
              <SignOutButton>
                <Button className="rounded-full mx-4 mt-4">Logout</Button>
              </SignOutButton>
            )}
          </SidebarContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 flex flex-col">
          <h2 className="text-gray-500">Try Pro</h2>
          <p className="text-gray-400">
            Upgrade for image upload, smarter AI & more copilot
          </p>
          <Button variant={"secondary"} className={"text-gray-700 mb-3"}>
            Learn More
          </Button>
          <UserButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
