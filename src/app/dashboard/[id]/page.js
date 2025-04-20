// "use client";
// import Loading from "../../loading";
// import { useState, use, useEffect, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { getDoc, doc } from "firebase/firestore";
// import { db } from "../../Firebase/firebase.config";
// import FacebookSection from "./facebookSection";
// import InstagramSection from "./instagramSection";
// import MediaSection from "./media";
// import HomeSection from "./home";
// import SettingSection from "./settings";
// const Page = ({ params }) => {
//   const user = useSelector((state) => state.user.userState);
//   const id = use(params).id;
//   const [loading, setLoading] = useState(true);
//   const [project, setProject] = useState(null);
//   const [section, setSection] = useState(0);
//   const [imgs, setImgs] = useState([]);
//   const [isChanged, setIsChanged] = useState(false);
//   const [storageUsed, setStorageUsed] = useState(0); // in MB
//   const fetchImgs = useCallback(async () => {
//     console.log("start fetchImgs");
//     try {
//       const { ref, listAll, getDownloadURL } = await import("firebase/storage");
//       const { storage } = await import("@/app/Firebase/firebase.config");

//       const storageRef = ref(storage, id.toString());
//       const result = await listAll(storageRef);

//       // Calculate storage used
//       calculateStorageUsed(result.items);

//       const urlPromises = result.items.map(async (imageRef) => {
//         try {
//           const url = await getDownloadURL(imageRef);
//           return {
//             url,
//             path: imageRef.fullPath,
//             name: imageRef.name,
//           };
//         } catch (err) {
//           console.error(`Error getting URL for ${imageRef.fullPath}:`, err);
//           return null;
//         }
//       });

//       const urlObjects = await Promise.all(urlPromises);
//       // Filter out any null values from failed downloads
//       const validUrlObjects = urlObjects.filter((obj) => obj !== null);
//       setImgs(validUrlObjects);
//     } catch (error) {
//       console.error("Error fetching images:", error);
//       setImgs([]);
//     }
//   }, [id, isChanged]);
//   const calculateStorageUsed = useCallback(
//     async (items) => {
//       console.log("start calculating storage used");
//       try {
//         const { ref, getMetadata } = await import("firebase/storage");
//         const { storage } = await import("@/app/Firebase/firebase.config");

//         let totalSize = 0;
//         const metadataPromises = items.map(async (imageRef) => {
//           try {
//             const metadata = await getMetadata(imageRef);
//             return metadata.size; // size in bytes
//           } catch (err) {
//             console.error(
//               `Error getting metadata for ${imageRef.fullPath}:`,
//               err
//             );
//             return 0;
//           }
//         });

//         const sizes = await Promise.all(metadataPromises);
//         totalSize = sizes.reduce((acc, size) => acc + size, 0);

//         // Convert bytes to MB
//         const sizeInMB = totalSize / (1024 * 1024);
//         setStorageUsed(parseFloat(sizeInMB.toFixed(1)));
//       } catch (error) {
//         console.error("Error calculating storage:", error);
//       }
//     },
//     [id, isChanged, imgs]
//   );

//   useEffect(() => {
//     if (id) {
//       fetchImgs();
//     }
//   }, [id, isChanged]);
//   useEffect(() => {
//     const fetchingData = async () => {
//       try {
//         const docSnap = await getDoc(doc(db, "project", id));
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setProject(data);
//           console.log("Project data:", project);
//           if (project?.FacebookConnected) {
//             setSection(1);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching document:", error);
//       }
//     };
//     fetchingData();
//   }, []);
//   useEffect(() => {
//     if (user && project != null) {
//       if (!user.isLoggedIn) {
//         router.replace("/");
//       } else {
//         if (project?.FacebookConnected || project?.InstagramConnected) {
//           setSection(1);
//         }
//         setLoading(false);
//         console.log(project);
//       }
//     }
//   }, [user, project]);
//   return loading ? (
//     <Loading />
//   ) : (
//     <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white px-[70px] selection:bg-[#111]">
//       <div className="flex justify-between h-[10vh] items-center">
//         <h1 className="font-Jersey text-4xl select-none">Post Pilot</h1>
//         <div className="flex gap-5">
//           {(project.FacebookConnected || project.InstagramConnected) && (
//             <button
//               onClick={() => {
//                 setSection(1);
//               }}
//               className={`${section == 1 && "underline"} `}
//             >
//               Home
//             </button>
//           )}
//           {project.FacebookConnected && (
//             <button
//               onClick={() => {
//                 setSection(2);
//               }}
//               className={`${section == 2 && "underline"} `}
//             >
//               Facebook
//             </button>
//           )}
//           {project.InstagramConnected && (
//             <button
//               onClick={() => {
//                 setSection(3);
//               }}
//               className={`${section == 3 && "underline"} `}
//             >
//               Instagram
//             </button>
//           )}
//           <button
//             onClick={() => {
//               setSection(4);
//             }}
//             className={`${section == 4 && "underline"} `}
//           >
//             Media
//           </button>
//           <button
//             onClick={() => {
//               setSection(0);
//             }}
//             className={`${section == 0 && "underline"} `}
//           >
//             Setting
//           </button>
//         </div>
//       </div>
//       {section == 1 ? (
//         <HomeSection />
//       ) : section == 2 ? (
//         <FacebookSection />
//       ) : section == 3 ? (
//         <InstagramSection />
//       ) : section == 4 ? (
//         <MediaSection
//           id={id}
//           imgs={imgs}
//           isChanged={isChanged}
//           setIsChanged={setIsChanged}
//           storageUsed={storageUsed}
//         />
//       ) : (
//         <SettingSection />
//       )}
//     </div>
//   );
// };
// export default Page;
"use client";
import Loading from "../../loading";
import { useState, use, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase/firebase.config";
import FacebookSection from "./facebookSection";
import InstagramSection from "./instagramSection";
import MediaSection from "./media";
import HomeSection from "./home";
import SettingSection from "./settings";
import { useRouter } from "next/navigation";

const Page = ({ params }) => {
  const router = useRouter();
  const user = useSelector((state) => state.user.userState);
  const id = use(params).id;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [section, setSection] = useState(0);
  const [imgs, setImgs] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0); // in MB

  // Fixed calculateStorageUsed with proper dependencies
  const calculateStorageUsed = useCallback(async (items) => {
    console.log("start calculating storage used");
    try {
      const { ref, getMetadata } = await import("firebase/storage");
      const { storage } = await import("@/app/Firebase/firebase.config");

      let totalSize = 0;
      const metadataPromises = items.map(async (imageRef) => {
        try {
          const metadata = await getMetadata(imageRef);
          return metadata.size; // size in bytes
        } catch (err) {
          console.error(
            `Error getting metadata for ${imageRef.fullPath}:`,
            err
          );
          return 0;
        }
      });

      const sizes = await Promise.all(metadataPromises);
      totalSize = sizes.reduce((acc, size) => acc + size, 0);

      // Convert bytes to MB
      const sizeInMB = totalSize / (1024 * 1024);
      setStorageUsed(parseFloat(sizeInMB.toFixed(1)));
    } catch (error) {
      console.error("Error calculating storage:", error);
    }
  }, []);

  // Fixed fetchImgs with proper dependencies and reference to calculateStorageUsed
  const fetchImgs = useCallback(async () => {
    console.log("start fetchImgs");
    try {
      const { ref, listAll, getDownloadURL, getMetadata } = await import("firebase/storage");
      const { storage } = await import("@/app/Firebase/firebase.config");
  
      const storageRef = ref(storage, id.toString());
      const result = await listAll(storageRef);
  
      // Calculate storage used
      calculateStorageUsed(result.items);
  
      const urlPromises = result.items.map(async (itemRef) => {
        try {
          // Get both the URL and metadata for each item
          const [url, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef)
          ]);
          
          // Determine file type from contentType in metadata
          const isVideo = metadata.contentType ? metadata.contentType.startsWith('video/') : false;
          
          return {
            url,
            path: itemRef.fullPath,
            name: itemRef.name,
            contentType: metadata.contentType,
            isVideo, // Add this flag to easily identify videos
            size: metadata.size,
            timeCreated: metadata.timeCreated,
          };
        } catch (err) {
          console.error(`Error getting URL or metadata for ${itemRef.fullPath}:`, err);
          return null;
        }
      });
  
      const urlObjects = await Promise.all(urlPromises);
      // Filter out any null values from failed downloads
      const validUrlObjects = urlObjects.filter((obj) => obj !== null);
      setImgs(validUrlObjects);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImgs([]);
    }
  }, [id, calculateStorageUsed]);
  
  // Fixed useEffect with proper dependency on fetchImgs
  useEffect(() => {
    if (id) {
      fetchImgs();
    }
  }, [id, isChanged, fetchImgs]);

  useEffect(() => {
    const fetchingData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "project", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject(data);
          console.log("Project data:", data);
          if (data?.FacebookConnected) {
            setSection(1);
          }
        } else {
          console.log("Document does not exist");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchingData();
  }, [id]);

  useEffect(() => {
    if (user && project != null) {
      if (!user.isLoggedIn) {
        router.replace("/");
      } else {
        if (project?.FacebookConnected || project?.InstagramConnected) {
          setSection(1);
        }
        setLoading(false);
        console.log(project);
      }
    }
  }, [user, project, router]);

  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white px-[70px] selection:bg-[#111]">
      <div className="flex justify-between h-[10vh] items-center">
        <h1 className="font-Jersey text-4xl select-none">Post Pilot</h1>
        <div className="flex gap-5">
          {(project.FacebookConnected || project.InstagramConnected) && (
            <button
              onClick={() => {
                setSection(1);
              }}
              className={`${section == 1 && "underline"} `}
            >
              Home
            </button>
          )}
          {project.FacebookConnected && (
            <button
              onClick={() => {
                setSection(2);
              }}
              className={`${section == 2 && "underline"} `}
            >
              Facebook
            </button>
          )}
          {project.InstagramConnected && (
            <button
              onClick={() => {
                setSection(3);
              }}
              className={`${section == 3 && "underline"} `}
            >
              Instagram
            </button>
          )}
          <button
            onClick={() => {
              setSection(4);
            }}
            className={`${section == 4 && "underline"} `}
          >
            Media
          </button>
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
      {section == 1 ? (
        <HomeSection />
      ) : section == 2 ? (
        <FacebookSection />
      ) : section == 3 ? (
        <InstagramSection />
      ) : section == 4 ? (
        <MediaSection
          id={id}
          imgs={imgs}
          isChanged={isChanged}
          setIsChanged={setIsChanged}
          storageUsed={storageUsed}
        />
      ) : (
        <SettingSection />
      )}
    </div>
  );
};
export default Page;