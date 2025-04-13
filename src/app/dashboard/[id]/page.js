"use client";
import { useSelector } from "react-redux";
import {
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Firebase/firebase.config";
import { use } from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Facebook,
  Settings,
  User,
  Users,
  Edit,
  Trash2,
  EyeOff,
  Eye,
  Plus,
  Image as ImageIcon,
  Save,
} from "lucide-react";

const Page = ({ params }) => {
  const id = use(params).id;
  const user = useSelector((state) => state.user.userState);
  const [activeTab, setActiveTab] = useState("facebook");
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [settings, setSettings] = useState({
    facebook: {
      accessToken: "",
      pageId: "",
    },
    general: {
      autoPost: false,
      postInterval: "1",
      notification: true,
    },
  });
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState({
    email: "",
    role: "read",
  });
  const [newPost, setNewPost] = useState({
    content: "",
    scheduledTime: new Date().toISOString().slice(0, 16),
    images: [],
    status: "scheduled",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Fetch project data from Firebase
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectRef = doc(db, "project", id);
        const projectSnapshot = await getDoc(projectRef);

        if (projectSnapshot.exists()) {
          const data = projectSnapshot.data();
          setProjectData(data);

          // Update settings with data from Firebase
          setSettings({
            facebook: {
              accessToken: data.facebook?.accessToken || "",
              pageId: data.facebook?.pageId || "",
            },
            general: {
              autoPost: data.general?.autoPost || false,
              postInterval: data.general?.postInterval || "1",
              notification: data.general?.notification !== false,
            },
          });

          // Determine initial tab based on whether Facebook is configured
          if (data.facebook?.accessToken && data.facebook?.pageId) {
            setActiveTab("facebook");
          } else {
            setActiveTab("settings");
          }
        }

        // Fetch scheduled posts
        await fetchScheduledPosts();

        // Fetch collaborators
        await fetchCollaborators();

        setLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Fetch scheduled posts
  const fetchScheduledPosts = async () => {
    try {
      const postsRef = collection(db, "project", id, "posts");
      const postsSnapshot = await getDocs(postsRef);
      const posts = [];

      postsSnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate
            ? doc.data().scheduledTime.toDate().toISOString().slice(0, 16)
            : doc.data().scheduledTime,
        });
      });

      setScheduledPosts(posts);
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
    }
  };

  // Fetch collaborators
  const fetchCollaborators = async () => {
    try {
      const collabRef = collection(db, "project", id, "collaborators");
      const collabSnapshot = await getDocs(collabRef);
      const collaborators = [];

      collabSnapshot.forEach((doc) => {
        collaborators.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setCollaborators(collaborators);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  // Save settings to Firebase
  const saveSettings = async () => {
    try {
      const projectRef = doc(db, "project", id);
      await updateDoc(projectRef, {
        facebook: settings.facebook,
        general: settings.general,
      });
      alert("Settings saved successfully!");

      // Update projectData
      const updatedProjectData = {
        ...projectData,
        facebook: settings.facebook,
        general: settings.general,
      };
      setProjectData(updatedProjectData);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image from selection
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images and return URLs
  const uploadImages = async () => {
    const uploadPromises = imageFiles.map(async (file) => {
      const imageRef = ref(
        storage,
        `projects/${id}/posts/${Date.now()}-${file.name}`
      );
      await uploadBytes(imageRef, file);
      return getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
  };

  // Add new post
  const addNewPost = async () => {
    try {
      if (!newPost.content.trim()) {
        alert("Post content cannot be empty");
        return;
      }

      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      const postData = {
        ...newPost,
        images: imageUrls,
        scheduledTime: new Date(newPost.scheduledTime),
        createdAt: new Date(),
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
      };

      const postsRef = collection(db, "project", id, "posts");
      await addDoc(postsRef, postData);

      // Reset form
      setNewPost({
        content: "",
        scheduledTime: new Date().toISOString().slice(0, 16),
        images: [],
        status: "scheduled",
      });
      setImageFiles([]);
      setImagePreviewUrls([]);

      // Refresh posts
      await fetchScheduledPosts();

      alert("Post scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling post:", error);
      alert("Failed to schedule post.");
    }
  };

  // Update existing post
  const updatePost = async (postId, updatedPost) => {
    try {
      const postRef = doc(db, "project", id, "posts", postId);
      await updateDoc(postRef, {
        ...updatedPost,
        scheduledTime: new Date(updatedPost.scheduledTime),
        updatedAt: new Date(),
      });

      // Refresh posts
      await fetchScheduledPosts();

      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const postRef = doc(db, "project", id, "posts", postId);
        await deleteDoc(postRef);

        // Refresh posts
        await fetchScheduledPosts();

        alert("Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  // Add collaborator
  const addCollaborator = async () => {
    try {
      if (!newCollaborator.email.trim()) {
        alert("Email is required");
        return;
      }

      const collabRef = collection(db, "project", id, "collaborators");
      await addDoc(collabRef, {
        email: newCollaborator.email,
        role: newCollaborator.role,
        addedAt: new Date(),
        addedBy: user.uid,
      });

      setNewCollaborator({ email: "", role: "read" });
      await fetchCollaborators();

      alert("Collaborator added successfully!");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      alert("Failed to add collaborator.");
    }
  };

  // Update collaborator role
  const updateCollaboratorRole = async (collabId, newRole) => {
    try {
      const collabRef = doc(db, "project", id, "collaborators", collabId);
      await updateDoc(collabRef, {
        role: newRole,
        updatedAt: new Date(),
      });

      await fetchCollaborators();

      alert("Collaborator role updated!");
    } catch (error) {
      console.error("Error updating collaborator role:", error);
      alert("Failed to update collaborator role.");
    }
  };

  // Remove collaborator
  const removeCollaborator = async (collabId) => {
    if (confirm("Are you sure you want to remove this collaborator?")) {
      try {
        const collabRef = doc(db, "project", id, "collaborators", collabId);
        await deleteDoc(collabRef);

        await fetchCollaborators();

        alert("Collaborator removed successfully!");
      } catch (error) {
        console.error("Error removing collaborator:", error);
        alert("Failed to remove collaborator.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between px-6 h-16 items-center border-b border-gray-700">
        <h1 className="font-Jersey text-3xl select-none">Post Pilot</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Project ID:</span>
          <span className="bg-gray-800 px-3 py-1 rounded text-sm">{id}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div
            className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${
              activeTab === "facebook"
                ? "bg-blue-900/30 border-l-4 border-blue-500"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("facebook")}
          >
            <Facebook size={20} className="text-blue-400" />
            <span>Facebook Posts</span>
          </div>
          <div
            className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${
              activeTab === "settings"
                ? "bg-gray-800/30 border-l-4 border-gray-500"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} className="text-gray-400" />
            <span>Settings</span>
          </div>
          <div
            className={`flex items-center gap-3 px-4 py-4 cursor-pointer ${
              activeTab === "collaborators"
                ? "bg-green-900/30 border-l-4 border-green-500"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("collaborators")}
          >
            <Users size={20} className="text-green-400" />
            <span>Collaborators</span>
          </div>

          <div className="mt-auto p-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              <span className="text-sm truncate">{user?.email || "User"}</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "facebook" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Facebook Posts</h1>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-blue-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Facebook size={14} className="text-blue-400" />
                    {settings.facebook.pageId ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </div>

              {!settings.facebook.accessToken || !settings.facebook.pageId ? (
                <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                  <Facebook size={48} className="text-blue-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Facebook Not Connected
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Please configure your Facebook settings first
                  </p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    onClick={() => setActiveTab("settings")}
                  >
                    Go to Settings
                  </button>
                </div>
              ) : (
                <>
                  {/* New Post Form */}
                  <div className="bg-gray-800/50 rounded-lg p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-blue-400">
                      Create New Post
                    </h2>
                    <div className="mb-4">
                      <textarea
                        className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                        placeholder="What would you like to post?"
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                      />
                    </div>

                    {/* Image previews */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="w-24 h-24 rounded overflow-hidden">
                              <img
                                src={url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                          <ImageIcon size={18} />
                          <span>Add Images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <input
                          type="datetime-local"
                          className="bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newPost.scheduledTime}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              scheduledTime: e.target.value,
                            })
                          }
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>

                      <button
                        className="ml-auto bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded flex items-center gap-2"
                        onClick={addNewPost}
                      >
                        <Calendar size={18} />
                        Schedule Post
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Posts List */}
                  <h2 className="text-lg font-semibold mb-4">
                    Scheduled Posts
                  </h2>
                  {scheduledPosts.length === 0 ? (
                    <div className="bg-gray-800/30 rounded-lg p-8 text-center">
                      <p className="text-gray-400">No posts scheduled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduledPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-gray-800/30 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-400" />
                              <span className="text-sm text-gray-300">
                                {new Date(post.scheduledTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="p-1 hover:bg-gray-700 rounded"
                                onClick={() => {
                                  const updatedPost = {
                                    ...post,
                                    status:
                                      post.status === "scheduled"
                                        ? "paused"
                                        : "scheduled",
                                  };
                                  updatePost(post.id, updatedPost);
                                }}
                              >
                                {post.status === "scheduled" ? (
                                  <EyeOff size={16} className="text-gray-400" />
                                ) : (
                                  <Eye size={16} className="text-blue-400" />
                                )}
                              </button>
                              <button
                                className="p-1 hover:bg-gray-700 rounded"
                                onClick={() => {
                                  // Implement edit functionality
                                  // This would open a modal or expand the post for editing
                                  alert(
                                    "Edit feature will be implemented here"
                                  );
                                }}
                              >
                                <Edit size={16} className="text-gray-400" />
                              </button>
                              <button
                                className="p-1 hover:bg-gray-700 rounded"
                                onClick={() => deletePost(post.id)}
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                          <p className="mb-3">{post.content}</p>

                          {post.images && post.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {post.images.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="w-20 h-20 rounded overflow-hidden"
                                >
                                  <img
                                    src={imageUrl}
                                    alt="Post image"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <User size={12} />
                            <span>{post.creatorName || "Unknown user"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Configurations</h1>

              {/* Facebook Section */}
              <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-blue-400">
                  Facebook Integration
                </h2>
                <div className="grid grid-cols-3 gap-5 px-6 md:px-24 justify-items-start py-5">
                  <label className="col-span-1">Access Token:</label>
                  <input
                    className="col-span-2 w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.facebook.accessToken}
                    type="password"
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebook: {
                          ...settings.facebook,
                          accessToken: e.target.value,
                        },
                      })
                    }
                  />
                  <label className="col-span-1">Page ID:</label>
                  <input
                    className="col-span-2 w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.facebook.pageId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebook: {
                          ...settings.facebook,
                          pageId: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* General Settings Section */}
              <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-green-400">
                  General Settings
                </h2>
                <div className="grid grid-cols-3 gap-5 px-6 md:px-24 justify-items-start py-5">
                  <label className="col-span-1">Auto Posting:</label>
                  <div className="col-span-2 w-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.general.autoPost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              autoPost: e.target.checked,
                            },
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <label className="col-span-1">Post Interval (hours):</label>
                  <select
                    className="col-span-2 w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={settings.general.postInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          postInterval: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                  </select>

                  <label className="col-span-1">Notifications:</label>
                  <div className="col-span-2 w-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.general.notification}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              notification: e.target.checked,
                            },
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2"
                  onClick={saveSettings}
                >
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "collaborators" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Manage Collaborators</h1>

              {/* Add Collaborator Section */}
              <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-green-400">
                  Add New Collaborator
                </h2>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Email Address</label>
                    <input
                      className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="collaborator@example.com"
                      value={newCollaborator.email}
                      type="email"
                      onChange={(e) =>
                        setNewCollaborator({
                          ...newCollaborator,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm mb-1">Role</label>
                    <select
                      className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newCollaborator.role}
                      onChange={(e) =>
                        setNewCollaborator({
                          ...newCollaborator,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="read">Read Only</option>
                      <option value="edit">Edit</option>
                    </select>
                  </div>
                  <button
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2"
                    onClick={addCollaborator}
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Current Collaborators
                </h2>

                {collaborators.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No collaborators added yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-4">Email</th>
                          <th className="text-left py-2 px-4">Role</th>
                          <th className="text-left py-2 px-4">Added On</th>
                          <th className="text-right py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collaborators.map((collab) => (
                          <tr
                            key={collab.id}
                            className="border-b border-gray-700/50"
                          >
                            <td className="py-3 px-4">{collab.email}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  collab.role === "read"
                                    ? "bg-blue-900/30 text-blue-300"
                                    : "bg-green-900/30 text-green-300"
                                }`}
                              >
                                {collab.role === "read" ? "Read Only" : "Edit"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {collab.addedAt?.toDate
                                ? collab.addedAt.toDate().toLocaleDateString()
                                : "Unknown"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <select
                                  className="bg-gray-700 text-xs rounded px-2 py-1"
                                  value={collab.role}
                                  onChange={(e) =>
                                    updateCollaboratorRole(
                                      collab.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="read">Read Only</option>
                                  <option value="edit">Edit</option>
                                </select>
                                <button
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => removeCollaborator(collab.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    About Permissions
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>
                      <strong>Read Only:</strong> Can view scheduled posts but
                      cannot create, edit, or delete.
                    </li>
                    <li>
                      <strong>Edit:</strong> Can view, create, edit, and delete
                      scheduled posts.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
