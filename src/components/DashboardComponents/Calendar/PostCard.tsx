import { Post } from "@/interfaces/Channel";
import { format } from "date-fns";
import { FiFacebook, FiInstagram } from "react-icons/fi";
import { FaLinkedin, FaPlay } from "react-icons/fa";
import Image from "next/image";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { CiClock2, CiWarning } from "react-icons/ci";
import { IoMdDoneAll } from "react-icons/io";
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
        post.issues &&
        Object.values(post.issues).filter((i) => i.status === "open").length > 0
          ? "dark:bg-red-950/80 bg-red-700 text-red-200 dark:text-red-200"
          : post.draft === true
          ? "dark:bg-gray-500/80 bg-gray-500 text-gray-200"
          : "bg-violet-300 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400"
      }`}
      title={`${format(new Date(post.date.toDate()), "h:mm a")}`}>
      <div className="w-10 h-10 ml-0.5 rounded-sm relative">
        {post.media &&
        post.media[0] &&
        post.media[0].url &&
        !post.media[0].isVideo ? (
          <Image
            src={post.media[0].url}
            width={70}
            height={70}
            alt=""
            className="object-cover w-full h-full rounded-sm"
          />
        ) : post.media &&
          post.media[0] &&
          post.media[0].url &&
          post.media[0].isVideo ? (
          <>
            <video
              className="object-cover w-full h-full rounded-sm bg-violet-100 dark:bg-violet-900/30"
              preload="metadata">
              <source src={post.media[0].url} type="video/mp4" />
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
              className="object-cover rounded-sm "
              size={24}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between h-full w-[62%]">
        <div className="flex justify-start mt-1.5 text-sm ">
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
        <div className="flex justify-between items-center w-full text-xs h-2 mb-1 ">
          <div className="flex h-2 items-center mb-1 gap-0.5">
            <CiClock2 />
            {format(new Date(post.date.toDate()), "h:mm a")}
          </div>
          {Object.values(post.issues || {}) &&
            Object.values(post.issues || {}).filter((i) => i.status === "open")
              .length > 0 && (
              <div className="flex h-2 items-center mb-1 gap-0.5 dark:text-red-500">
                <CiWarning />
                {
                  Object.values(post.issues || {}).filter(
                    (i) => i.status === "open"
                  ).length
                }
              </div>
            )}
          {post.published == true && (
            <div className="flex h-2 items-center mb-1 gap-0.5 ">
              <IoMdDoneAll />
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
