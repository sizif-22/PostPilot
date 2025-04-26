import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingSection = () => {
  const socialMediaPlatforms = [{ name: "Facebook" }, { name: "Instagram" }];
  return (
    <div className=" h-[90vh] py-10 px-[80px] overflow-y-auto grid grid-cols-3 gap-2">
      <div className="">
        <a href="#general">General</a>
        <br />
        <a href="#Facebook">Facebook</a>
        <br />
        <a href="#Instagram">Instagram</a>
      </div>
      <div className="col-span-2 overflow-y-auto">
        <h1 className="text-2xl" id="general">
          General
        </h1>
        <hr />
        <br />
        <div>
          <label>Channel Name</label>
          <br />
          <div className="flex">
            <Input className="w-1/2" />
            <Button variant="outline" className="text-black">
              Rename
            </Button>
          </div>
          <br />
        </div>
        <br />
        {socialMediaPlatforms.map((value, index) => (
          <div key={index}>
            <h1 className="text-2xl" id={value.name}>
              {value.name} Configuration
            </h1>
            <hr />
            <br />
            <div>
              <Button
                variant="outline"
                className="text-black"
                onClick={() => {
                  if (value.name == "Facebook") {
                    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=2475636742798573&redirect_uri=postpilot-22.vercel.app&scope=pages_manage_posts,pages_show_list&response_type=code`;
                  }
                }}
              >
                Connect
              </Button>
            </div>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};
export default SettingSection;
