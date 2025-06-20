import { AccountToggle } from "./AccountToggle";
import NotificationSection from "./notification";
import { RouteSelect } from "./RouteSelect";
import { SettingsSection } from "./RouteSelect";
import { useChannel } from "@/context/ChannelContext";
export const Sidebar = ({
  Callbackfunc,
  route,
}: {
  Callbackfunc: (route: string) => void;
  route: string;
}) => {
  const { channel } = useChannel();
  return (
    <div>
      <div className="overflow-y-scroll h-[calc(100vh-32px-48px)]">
        <NotificationSection />
        <AccountToggle />
        {/* <Search /> */}
        <RouteSelect Callbackfunc={Callbackfunc} route={route} />
      </div>
      {channel?.authority == "Owner" && (
        <SettingsSection route={route} Callbackfunc={Callbackfunc} />
      )}
    </div>
  );
};
