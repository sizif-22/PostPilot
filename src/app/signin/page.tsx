"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import {  addUserWithFacebook, addUserWithGoogle } from "@/firebase/auth";
const Signin = () => {
  return (
    <main className="h-screen flex justify-center items-center">
      <div className="h-fit transition-all bg-white rounded-lg py-4 px-6 flex flex-col gap-4">
        <h1 className="font-bold text-2xl">
          Welcome to{" "}
          <span className="font-PlaywriteHU text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-violet-700 to-black">
            PostPilot
          </span>
        </h1>

        <Tabs defaultValue="sign-in">
          <TabsList
            className="grid lg:w-[30vw] md:w-[50vw] w-[70vw] max-w-[350px] grid-cols-2 font-RobotoMono"
            duration-1000
          >
            <TabsTrigger
              value="sign-in"
              className="transition-all duration-200 data-[state=active]:font-bold"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className="transition-all duration-200 data-[state=active]:font-bold"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="sign-in"
            className="transition-all duration-300 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            <div className="w-full  space-y-4 transition-all duration-300 transform data-[state=inactive]:translate-x-4 data-[state=active]:translate-x-0">
              <Input
                type="email"
                placeholder="Email"
                className="transition-all duration-200"
              />
              <Input
                type="password"
                placeholder="Password"
                className="transition-all duration-200"
              />
              <Button className="w-full transition-all duration-200 hover:opacity-95">
                Log In
              </Button>
              <Oauth />
            </div>
          </TabsContent>

          <TabsContent
            value="sign-up"
            className="transition-all duration-300 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            <div className="w-full space-y-4 transition-all duration-300 transform data-[state=inactive]:translate-x-4 data-[state=active]:translate-x-0">
              <Input
                type="text"
                placeholder="Name"
                className="transition-all duration-200"
              />
              <Input
                type="email"
                placeholder="Email"
                className="transition-all duration-200"
              />
              <Input
                type="password"
                placeholder="Password"
                className="transition-all duration-200"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                className="transition-all duration-200"
              />
              <Button className="w-full transition-all duration-200 hover:opacity-95">
                Sign Up
              </Button>
              <Oauth />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

const Oauth = () => {
  return (
    <>
      <hr className="my-4" />
      <h2 className="text-sm font-medium">Or continue with</h2>
      <div className="flex gap-2 mt-4">
        <Button className="flex-1 transition-all duration-200 hover:opacity-95" onClick={() => addUserWithGoogle()}>
          <span className="mr-2">
            <FaGoogle />
          </span>
          Google
        </Button>
        <Button className="flex-1 transition-all duration-200 hover:opacity-95" onClick={() => addUserWithFacebook()}>
          <span className="mr-2">
            <FaFacebook />
          </span>
          Facebook
        </Button>
      </div>
    </>
  );
};

export default Signin;
