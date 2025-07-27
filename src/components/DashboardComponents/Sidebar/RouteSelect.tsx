import { IconType } from "react-icons";
import {
  FiHome,
  FiCalendar,
  FiSettings,
  FiUsers,
  FiFacebook,
  FiInstagram,
  FiImage,
} from "react-icons/fi";
import { CiWarning } from "react-icons/ci";

import { IoAnalyticsSharp } from "react-icons/io5";
import { TbPresentationAnalytics } from "react-icons/tb";
import { useChannel } from "@/context/ChannelContext";
export const RouteSelect = ({
  Callbackfunc,
  route,
}: {
  Callbackfunc: (route: string) => void;
  route: string;
}) => {
  const channel = useChannel();
  const Button = [
    {
      Icon: FiHome,
      title: "Dashboard",
    },
    {
      Icon: TbPresentationAnalytics,
      title: "Analysis",
    },
    {
      Icon: FiImage,
      title: "Media",
    },
    {
      Icon: FiCalendar,
      title: "Calendar",
    },
    {
      Icon: FiUsers,
      title: "Team",
    },
    {
      Icon: CiWarning,
      title: "Issues",
    },
  ];
  return (
    <div className="space-y-1">
      {Button.map((button) => (
        <Route
          key={button.title}
          Icon={button.Icon}
          title={button.title}
          route={route}
          Callbackfunc={Callbackfunc}
        />
      ))}
    </div>
  );
};
export const Route = ({
  Icon,
  className,
  title,
  route,
  Callbackfunc,
}: {
  Icon: IconType;
  className?: string;
  title: string;
  route: string;
  Callbackfunc: (route: string) => void;
}) => {
  return (
    <button
      onClick={() => Callbackfunc(title)}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color]   ${className} ${
        title == route
          ? "bg-white text-stone-950 shadow dark:bg-darkBorder dark:text-white"
          : "hover:bg-stone-200 dark:hover:bg-darkButtons bg-transparent text-stone-500 dark:text-stone-400 shadow-none"
      }`}>
      <Icon className={title == route ? "text-violet-500" : ""} />
      <span>{title}</span>
    </button>
  );
};

import { ThemeToggle } from "./ThemeToggle";

export const SettingsSection = ({
  route,
  Callbackfunc,
}: {
  route: string;
  Callbackfunc: (route: string) => void;
}) => {
  const { channel } = useChannel();
  return (
    <div className="flex sticky top-[calc(100vh_-_48px_-_16px)] flex-col h-12 border-t px-2 border-stone-300 dark:border-stone-800 justify-end text-xs">
      <div className="flex items-center gap-1 justify-between">
        {channel?.authority == "Owner" ? (
          <>
            <Route
              Icon={FiSettings}
              route={route}
              Callbackfunc={Callbackfunc}
              title="Configuration"
            />
            <ThemeToggle className="h-full rounded" />
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <ThemeToggle className=" rounded" />
          </div>
        )}
      </div>
    </div>
  );
};
