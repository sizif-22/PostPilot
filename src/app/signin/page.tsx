"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle } from "@/firebase/auth";
import { FormEvent, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signInServer } from "../home/action";
import { redirect } from "next/navigation";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await signInServer(idToken, { name, email });
      redirect("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await signInServer(idToken, { name, email });
      redirect("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="h-screen flex justify-center items-center dark:text-white dark:bg-darkBackground">
      <div className="h-fit transition-all bg-white dark:bg-secondDarkBackground rounded-lg py-4 px-6 flex flex-col gap-4">
        <h1 className="font-bold text-2xl">
          Welcome to{" "}
          <span className="font-PlaywriteHU text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-violet-700 to-black dark:to-white">
            PostPilot
          </span>
        </h1>

        <Tabs defaultValue="sign-in">
          <TabsList
            className="grid lg:w-[30vw] md:w-[50vw] w-[70vw] max-w-[350px] grid-cols-2 font-RobotoMono dark:bg-darkButtons"
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
            <form
              onSubmit={handleSignIn}
              className="w-full  space-y-4 transition-all duration-300 transform data-[state=inactive]:translate-x-4 data-[state=active]:translate-x-0"
            >
              <Input
                type="email"
                placeholder="Email"
                className="transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                className="transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:opacity-95 dark:bg-darkButtons text-white"
              >
                Log In
              </Button>
              <Oauth />
            </form>
          </TabsContent>

          <TabsContent
            value="sign-up"
            className="transition-all duration-300 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            <form
              onSubmit={handleSignUp}
              className="w-full space-y-4 transition-all duration-300 transform data-[state=inactive]:translate-x-4 data-[state=active]:translate-x-0"
            >
              <Input
                type="text"
                placeholder="Name"
                className="transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                className="transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                className="transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                className="transition-all duration-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:opacity-95 dark:text-white dark:bg-darkButtons"
              >
                Sign Up
              </Button>
              <Oauth />
            </form>
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
        <Button
          className="flex-1 transition-all duration-200 hover:opacity-95 dark:text-white dark:bg-darkButtons"
          onClick={() => signInWithGoogle()}
        >
          <span className="mr-2">
            <FaGoogle />
          </span>
          Google
        </Button>
      </div>
    </>
  );
};

export default Signin;