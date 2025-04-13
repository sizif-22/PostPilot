"use client";
import Loading from "../../loading";
import { useState, use, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase/firebase.config";
import FacebookSection from "./facebookSection";
import SettingSection from "./settings";
const Page = ({ params }) => {
  const user = useSelector((state) => state.user.userState);
  const id = use(params).id;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [section, setSection] = useState(0);
  useEffect(() => {
    const fetchingData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "project", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject(data);
          console.log("Project data:", project);
          if (project?.FacebookConnected) {
            setSection(1);
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchingData();
  }, []);
  useEffect(() => {
    if (user && project != null) {
      if (!user.isLoggedIn) {
        router.replace("/");
      } else {
        if (project?.FacebookConnected) {
          setSection(1);
        }
        setLoading(false);
        console.log(project);
      }
    }
  }, [user, project]);
  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white px-[70px] selection:bg-[#111]">
      <div className="flex justify-between h-[10vh] items-center">
        <h1 className="font-Jersey text-4xl select-none">Post Pilot</h1>
        <div className="flex gap-5">
          {project.FacebookConnected && (
            <button
              onClick={() => {
                setSection(1);
              }}
              className={`${section == 1 && "underline"} `}
            >
              Facebook
            </button>
          )}
          <button
            onClick={() => {
              setSection(0);
            }}
            className={`${section == 0 && "underline"} `}
          >
            Setting
          </button>
        </div>
      </div>
      {section == 1 ? <FacebookSection /> : <SettingSection />}
    </div>
  );
};
export default Page;
