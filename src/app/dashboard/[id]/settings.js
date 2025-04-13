const SettingSection = () => {
  return (
    <div className=" h-[90vh] py-10 px-[80px] overflow-y-auto">
      <div>
        <h1 className="text-4xl">Configurations:</h1>
        <div className="px-[80px] py-10">
          <h2 className="text-2xl">Facebook Configuration</h2>
          <div className="grid grid-cols-3 gap-5 px-6 md:px-24 justify-items-start py-5">
            <label className="col-span-1">Access Token:</label>
            <input
              className="col-span-2 w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
            />
            <label className="col-span-1">Page ID:</label>
            <input className="col-span-2 w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingSection;
