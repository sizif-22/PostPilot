import { Post } from "@/interfaces/Collection";
import { format } from "date-fns";
import { FiFacebook, FiInstagram } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { CiClock2, CiWarning } from "react-icons/ci";
import { IoMdDoneAll } from "react-icons/io";
import { BsFillChatRightTextFill } from "react-icons/bs";

export const HorizontalPostCard = ({
    post,
    onClick,
    compact = false,
}: {
    post: Post;
    onClick: () => void;
    compact?: boolean;
}) => {
    const hasIssues =
        post.issues &&
        Object.values(post.issues).filter((i) => i.status === "open").length > 0;

    return (
        <button
            onClick={onClick}
            className={`
        ${compact ? "w-full h-8" : "w-full h-10"}
        text-left flex gap-1.5 items-center p-1 text-[10px] sm:text-xs 
        rounded transition-colors
        ${hasIssues
                    ? "dark:bg-red-950/80 bg-red-700 text-red-200"
                    : post.draft === true
                        ? "dark:bg-gray-500/80 bg-gray-500 text-gray-200"
                        : "bg-violet-300 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400"
                }
      `}
            title={`${format(new Date(post.date.toDate()), "h:mm a")}`}
        >
            {/* Media Thumbnail */}
            <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-sm relative shrink-0`}>
                {post.media && post.media[0] && post.media[0].url && !post.media[0].isVideo ? (
                    <Image
                        src={post.media[0].url}
                        width={32}
                        height={32}
                        alt=""
                        className="object-cover w-full h-full rounded-sm"
                    />
                ) : post.media && post.media[0] && post.media[0].url && post.media[0].isVideo ? (
                    <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 rounded-sm flex items-center justify-center">
                        <BsFillChatRightTextFill size={compact ? 10 : 12} />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BsFillChatRightTextFill size={compact ? 10 : 12} />
                    </div>
                )}
            </div>

            {/* Post Info */}
            <div className="flex-1 flex items-center justify-between gap-1 min-w-0">
                <div className="flex items-center gap-1">
                    {/* Platform Icons */}
                    {post.platforms?.slice(0, compact ? 2 : 3).map((platform, index) => {
                        const iconSize = compact ? 10 : 12;
                        if (platform === "facebook") {
                            return <FiFacebook key={index} size={iconSize} />;
                        } else if (platform === "instagram") {
                            return <FiInstagram key={index} size={iconSize} />;
                        } else if (platform === "x") {
                            return <FaXTwitter key={index} size={iconSize} />;
                        } else if (platform === "tiktok") {
                            return <FaTiktok key={index} size={iconSize} />;
                        } else if (platform === "linkedin") {
                            return <FaLinkedin key={index} size={iconSize} />;
                        }
                        return null;
                    })}
                </div>

                {/* Time & Status */}
                <div className="flex items-center gap-1">
                    <CiClock2 size={compact ? 10 : 12} />
                    <span className="text-[10px]">
                        {format(new Date(post.date.toDate()), "h:mm a")}
                    </span>
                    {hasIssues && (
                        <CiWarning size={compact ? 10 : 12} className="text-red-500" />
                    )}
                    {post.published && <IoMdDoneAll size={compact ? 10 : 12} />}
                </div>
            </div>
        </button>
    );
};
