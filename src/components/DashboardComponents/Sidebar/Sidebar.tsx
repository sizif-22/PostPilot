import { AccountToggle } from "./AccountToggle";
import NotificationSection from "./notification";
import { RouteSelect } from "./RouteSelect";
import { SettingsSection } from "./RouteSelect";
export const Sidebar = ({
  Callbackfunc,
  route,
}: {
  Callbackfunc: (route: string) => void;
  route: string;
}) => {
  return (
    <div>
      <div className="overflow-y-scroll h-[calc(100vh-32px-48px)]">
        <NotificationSection pageName="folders/id" />
        <AccountToggle />
        <RouteSelect Callbackfunc={Callbackfunc} route={route} />
      </div>
      <SettingsSection route={route} Callbackfunc={Callbackfunc} />
    </div>
  );
};
