// "use client";
// import { useState, useRef, useEffect } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"
// import { SendHorizontal, Plus, Facebook, Instagram } from "lucide-react";
// import Image from "next/image";
// const validateFileType = (file) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "image/tiff",
//     "image/heif",
//     "image/webp",
//   ];
//   if (!allowedTypes.includes(file.type)) {
//     return false;
//   }
//   if (file.size > 4 * 1024 * 1024) {
//     return false;
//   }
//   return true;
// };

// const HomeSection = () => {

  

//   const scheduledPosts = [
//     {
//       id:"39244798247938473924_785274324720347",
//       message:"test",
//       scheduled_publish_time:17450804619,
//       created_time:"2025-04-19T17:43:39+0000"
//     },{
//       id:"39244798365938473924_782364324720347",
//       message:"test",
//       scheduled_publish_time:16420704619,
//       created_time:"2025-04-19T17:43:39+0000"
//     },{
//       id:"39244793867938473924_782484324720347",
//       message:"test",
//       scheduled_publish_time:19440803619,
//       created_time:"2025-04-19T17:43:39+0000"
//     },{
//       id:"39244793867938473924_782484324720347",
//       message:"test",
//       scheduled_publish_time:19440803619,
//       created_time:"2025-04-19T17:43:39+0000"
//     }
//   ];
//   const [date, setDate] = useState(new Date());
//   const [file, setFile] = useState(null);
//   const [imgs, setNewImg] = useState([]);
//   const inputRef = useRef(null);
//   useEffect(() => {
//     console.dir("file:" + file);
//   }, [file]);
//   return (
//     <div className=" h-[90vh] py-10 px-[80px] grid grid-cols-2 content-between">
//       <div className="">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={setDate}
//           className="rounded-md border w-fit"
//         />
//       </div>
//       <div className="row-span-2">
//         <ul className="h-[70vh] overflow-y-auto">
//           {scheduledPosts.map((post, index) => (
//             <li key={index} className="h-[20vh] w-[500px] my-2 pl-10">
//               <div className="bg-[#0b0a0a6a] w-full h-full rounded shadow-sm shadow-[#ffffff3c] py-2 px-2 flex flex-col gap-2">
//               <p>#{post.id}</p>
//               <p>message: {post.message}</p>
//               <p>publish time: {post.scheduled_publish_time}</p>
//               <p>created at: {post.created_time}</p>

//               </div>
//             </li>
//           ))}
//           <div className="h-[20vh] w-[500px] m-2"></div>
//         </ul>
//       </div>
//       <div className="h-48 flex items-start justify-between flex-col">
//         <div className="flex justify-between w-[90%]">
//           <div className="flex w-full gap-4">
//             <Facebook className=" hover:text-blue-900 transition-all" />
//             <Instagram className=" hover:text-pink-900 transition-all" />
//           </div>
//           <Input type="datetime-local" className="w-48"/>
//         </div>
//         <div className="w-full">
//           <div className="w-[90%] flex gap-1 overflow-x-auto">
//             <button
//               onClick={() => {
//                 inputRef.current.click();
//               }}
//               className="cursor-pointer border rounded text-3xl flex justify-center items-center my-2 w-[40px] h-[40px]"
//             >
//               <input
//                 className="hidden"
//                 ref={inputRef}
//                 onChange={(e) => {
//                   if (validateFileType(e.target.files[0])) {
//                     setNewImg([...imgs, e.target.files[0]]);
//                   } else {
//                     console.warn("de msh sora ya3mna");
//                   }
//                 }}
//                 type="file"
//                 accept="image/*"
//               />
//               <Plus />
//             </button>
//             {imgs.map((value, index) => (
//               <Image
//                 src={URL.createObjectURL(value)}
//                 key={index}
//                 alt="new image"
//                 width={200}
//                 height={200}
//                 className="w-[40px] my-2 h-[40px] object-cover"
//               />
//             ))}
//           </div>
//           <div className="flex w-[90%] gap-5 items-end">
//             <Textarea
//               placeholder="Type your message here."
//               className="resize-none max-h-[100px] w-[90%]"
//             />
//             <Button>
//               <SendHorizontal />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default HomeSection;
"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Plus, Facebook, Instagram, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";

const validateFileType = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/heif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  if (file.size > 4 * 1024 * 1024) {
    return false;
  }
  return true;
};

const scheduledPosts = [
  {
    id: "39244798247938473924_785274324720347",
    message: "Exciting product launch next week! Stay tuned for updates.",
    scheduled_publish_time: 1719878400, // April 22, 2025
    created_time: "2025-04-19T17:43:39+0000",
    platform: "facebook"
  },
  {
    id: "39244798365938473924_782364324720347",
    message: "Check out our latest blog post on sustainability initiatives!",
    scheduled_publish_time: 1719964800, // April 23, 2025
    created_time: "2025-04-19T17:43:39+0000",
    platform: "instagram"
  },
  {
    id: "39244793867938473924_782484324720347",
    message: "Behind the scenes look at our design team's creative process.",
    scheduled_publish_time: 1720051200, // April 24, 2025
    created_time: "2025-04-19T17:43:39+0000",
    platform: "facebook"
  },
  {
    id: "39244793867938473924_782484324758347",
    message: "Join us for our live Q&A session tomorrow at 3PM EST!",
    scheduled_publish_time: 1720137600, // April 25, 2025
    created_time: "2025-04-19T17:43:39+0000",
    platform: "instagram"
  }
];

const HomeSection = () => {
  const [date, setDate] = useState(new Date());
  const [imgs, setNewImg] = useState([]);
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    facebook: true,
    instagram: false
  });
  const [highlightedPost, setHighlightedPost] = useState(null);
  
  const inputRef = useRef(null);
  const postsContainerRef = useRef(null);
  const postRefs = useRef({});

  // Prepare calendar data - mark days with posts
  const daysWithPosts = useMemo(() => {
    const days = {};
    scheduledPosts.forEach(post => {
      const postDate = new Date(post.scheduled_publish_time * 1000);
      const dateStr = postDate.toISOString().split('T')[0];
      days[dateStr] = true;
    });
    return days;
  }, [scheduledPosts]);

  // Filter posts by selected date
  const filteredPosts = useMemo(() => {
    if (!date) return scheduledPosts;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);
    
    return scheduledPosts.filter(
      post => post.scheduled_publish_time >= startTimestamp && post.scheduled_publish_time <= endTimestamp
    );
  }, [scheduledPosts, date]);

  // Handle calendar day modifiers
  const dayModifiers = useMemo(() => {
    return {
      hasPost: (day) => {
        const dateStr = day.toISOString().split('T')[0];
        return daysWithPosts[dateStr];
      }
    };
  }, [daysWithPosts]);

  // Handle calendar day click
  const handleDayClick = (selectedDate) => {
    setDate(selectedDate);
    
    // Find posts for this day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);
    
    const dayPosts = scheduledPosts.filter(
      post => post.scheduled_publish_time >= startTimestamp && post.scheduled_publish_time <= endTimestamp
    );
    
    if (dayPosts.length > 0) {
      // Scroll to the first post for this day
      const firstPostId = dayPosts[0].id;
      if (postRefs.current[firstPostId] && postsContainerRef.current) {
        postRefs.current[firstPostId].scrollIntoView({ behavior: 'smooth' });
        
        // Highlight the post
        setHighlightedPost(firstPostId);
        setTimeout(() => setHighlightedPost(null), 2000);
      }
    }
  };

  // Format date-time for input
  const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Set default scheduled time to current time + 1 hour
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    setScheduledTime(formatDateTimeForInput(defaultTime));
  }, []);

  // Handle image removal
  const removeImage = (index) => {
    setNewImg(imgs.filter((_, i) => i !== index));
  };

  // Handle platform selection
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Format post time for display
  const formatPostTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-[90vh] py-4 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
      <div className="flex flex-col h-full space-y-4">
        <div className="bg-black/10 w-fit backdrop-blur-sm p-3 rounded-lg shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDayClick}
            className="rounded-md border w-full max-w-fit"
            modifiers={dayModifiers}
            modifiersClassNames={{
              hasPost: "bg-blue-100 dark:bg-blue-900/30 rounded-md font-bold"
            }}
          />
        </div>
        
        <div className="bg-black/10 dark:bg-white/5 backdrop-blur-sm p-4 rounded-lg shadow-sm flex-1 flex flex-col">
          <div className="flex items-center space-x-3 mb-3">
            <button 
              onClick={() => togglePlatform('facebook')} 
              className={`p-1.5 rounded-full ${selectedPlatforms.facebook ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Facebook size={18} />
            </button>
            <button 
              onClick={() => togglePlatform('instagram')} 
              className={`p-1.5 rounded-full ${selectedPlatforms.instagram ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Instagram size={18} />
            </button>
            <Input 
              type="datetime-local" 
              className="ml-auto w-48 text-xs" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
          
          <Textarea
            placeholder="What would you like to share?"
            className="resize-none max-h-[70px] flex-1 w-full text-sm mb-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => inputRef.current.click()}
              className="cursor-pointer border rounded-md flex justify-center items-center h-8 px-3 gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
            >
              <input
                className="hidden"
                ref={inputRef}
                onChange={(e) => {
                  if (validateFileType(e.target.files[0])) {
                    setNewImg([...imgs, e.target.files[0]]);
                  } else {
                    console.warn("Invalid file type or size");
                  }
                }}
                type="file"
                accept="image/*"
              />
              <ImageIcon size={14} />
              <span>Add Image</span>
            </button>
            
            <Button size="sm" className="ml-auto text-xs h-8">
              <SendHorizontal className="mr-1" size={14} />
              Schedule Post
            </Button>
          </div>
          
          {imgs.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-1 p-2  rounded-md">
              {imgs.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Upload preview"
                    width={60}
                    height={60}
                    className="w-14 h-14 object-cover rounded-md"
                  />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Scheduled Posts</h3>
          {filteredPosts.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} scheduled
            </span>
          )}
        </div>
        
        <div 
          ref={postsContainerRef} 
          className="flex-1 overflow-y-auto pr-2 space-y-3"
        >
          {filteredPosts.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 rounded-lg text-sm">
              No posts scheduled for this date
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <div 
                key={index} 
                ref={el => postRefs.current[post.id] = el}
                className={`bg-black/10 dark:bg-white/5 backdrop-blur-sm p-3 rounded-lg transition-all duration-500 ${highlightedPost === post.id ? 'shadow-lg shadow-blue-500/50 dark:shadow-blue-400/30 scale-[1.02]' : 'shadow-sm'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {post.platform === 'facebook' ? (
                      <Facebook size={16} className="text-blue-600" />
                    ) : (
                      <Instagram size={16} className="text-pink-600" />
                    )}
                    <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                      {formatPostTime(post.scheduled_publish_time)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs my-1.5">{post.message}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Created: {new Date(post.created_time).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSection;