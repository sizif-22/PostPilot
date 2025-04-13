"use client";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import mainImage from "../imgs/w-out bg.png";
import { addUser, addUserWithFacebook } from "./Firebase/firebase.auth";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useRouter } from "next/navigation";

const Home = () => {
  const userState = useSelector((state) => state.user.userState);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (userState) {
      setLoading(false);
    }
  }, [userState]);

  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white px-[70px] selection:bg-[#111]">
      <div className="flex justify-between h-[10vh] items-center">
        <h1 className="font-Jersey text-4xl select-none">Post Pilot</h1>
        {userState.isLoggedIn && <p>hi {userState.name} 👋.</p>}
      </div>
      <div className=" flex flex-col items-center justify-between py-16 h-[90vh]">
        <h1 className=" text-4xl">Schedule Smarter. Post Everywhere.</h1>
        <p className=" text-[#555]">
          Plan, schedule, and publish your social posts across platforms — all
          in one place.
        </p>
        {!userState.isLoggedIn ? (
          <div className="flex gap-2 my-10">
            <button
              onClick={addUserWithFacebook}
              className="flex items-center gap-2 border  px-4 py-2 rounded border-blue-700 hover:bg-[#00000020]"
            >
              <FaFacebookF className="text-blue-700" /> Sign-in with Facebook
            </button>
            <button
              onClick={addUser}
              className="flex items-center gap-2 px-4 py-2 border-white border  rounded  hover:bg-[#00000020]"
            >
              <FcGoogle /> Sign-in with Google
            </button>
          </div>
        ) : (
          <div className="flex gap-2 my-10">
            <button
              onClick={() => {
                router.push("/dashboard");
              }}
              className="flex items-center gap-2 px-4 py-2 border-white border  rounded  hover:bg-[#00000020]"
            >
              Get Started
            </button>
          </div>
        )}
        <Image
          src={mainImage}
          width={1000}
          height={1000}
          priority={true}
          alt="post Pilot image"
          className="h-80 w-80 rounded-xl"
        />
      </div>
    </div>
  );
};

export default Home;
