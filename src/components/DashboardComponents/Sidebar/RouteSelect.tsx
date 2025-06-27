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
      {/* {channel?.channel?.socialMedia?.facebook && (
        <Route
          Icon={FiFacebook}
          title={`Facebook-(${channel.channel.socialMedia.facebook.name})`}
          route={route}
          Callbackfunc={Callbackfunc} 
        />
      )} */}
      {/* {channel?.channel?.socialMedia?.instagram && (
        <Route
          Icon={FiInstagram}
          title={channel.channel.socialMedia.instagram.name}
          route={route}
          Callbackfunc={Callbackfunc}
        />
      )} */}
    </div>
  );
};
export const Route = ({
  Icon,
  title,
  route,
  Callbackfunc,
}: {
  Icon: IconType;
  title: string;
  route: string;
  Callbackfunc: (route: string) => void;
}) => {
  return (
    <button
      onClick={() => Callbackfunc(title)}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${
        title == route
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
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
  return (
    <div className="flex sticky top-[calc(100vh_-_48px_-_16px)] flex-col h-12 border-t px-2 border-stone-300 justify-end text-xs">
      <div className="flex items-center justify-between">
        <Route
          Icon={FiSettings}
          route={route}
          Callbackfunc={Callbackfunc}
          title="Configuration"
        />
        <ThemeToggle />
      </div>
    </div>
  );
};
