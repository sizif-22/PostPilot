import { Post } from "@/interfaces/Channel";
import { format } from "date-fns";
import { FiFacebook, FiInstagram } from "react-icons/fi";
import { FaLinkedin, FaPlay } from "react-icons/fa";
import Image from "next/image";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { CiClock2, CiWarning } from "react-icons/ci";

import { BsFillChatRightTextFill } from "react-icons/bs";
export const PostCard = ({
  callbackFunc,
  post,
}: {
  callbackFunc: () => void;
  post: Post;
}) => {
  return (
    <button
      key={post.id}
      onClick={callbackFunc}
      className={`w-full h-12 text-left  flex gap-1.5 items-center p-1 text-[10px] sm:text-xs truncate rounded b transition-colors ${
        post.issues && post.issues.length > 0
          ? "bg-red-950/80"
          : post.draft === true
          ? "bg-gray-500/80"
          : post.published
          ? "bg-green-950/80"
          : "g-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400"
      }`}
      title={`${format(new Date(post.date.toDate()), "h:mm a")}`}>
      <div className="w-10 h-10  rounded-sm relative">
        {post.imageUrls &&
        post.imageUrls[0] &&
        post.imageUrls[0].url &&
        !post.imageUrls[0].isVideo ? (
          <Image
            src={post.imageUrls[0].url}
            width={70}
            height={70}
            alt=""
            className="object-cover w-full h-full rounded-sm"
          />
        ) : post.imageUrls &&
          post.imageUrls[0] &&
          post.imageUrls[0].url &&
          post.imageUrls[0].isVideo ? (
          <>
            <video
              className="object-cover w-full h-full rounded-sm"
              preload="metadata">
              <source src={post.imageUrls[0].url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <FaPlay size={12} className="text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BsFillChatRightTextFill
              className="object-cover  rounded-sm"
              size={24}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between h-full w-[60%]">
        <div className="flex gap-1 justify-start mt-1.5 text-sm">
          {post.platforms?.map((platform, index) =>
            platform === "facebook" ? (
              <FiFacebook key={index} />
            ) : platform === "instagram" ? (
              <FiInstagram key={index} />
            ) : platform === "x" ? (
              <FaXTwitter key={index} />
            ) : platform === "tiktok" ? (
              <FaTiktok key={index} />
            ) : platform === "linkedin" ? (
              <FaLinkedin key={index} />
            ) : null
          )}
        </div>
        <div className="flex justify-between items-center w-full text-xs h-2 mb-1">
          <div className="flex h-2 items-center mb-1 gap-0.5">
            <CiClock2 />
            {format(new Date(post.date.toDate()), "h:mm a")}
          </div>
          {post.issues?.length && post.issues?.length > 0 && (
            <div className="flex h-2 items-center mb-1 gap-0.5">
              <CiWarning />
              {post.issues?.length}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
