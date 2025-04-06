"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/getScheduledPosts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewMessage(post.message);
    setNewTime(
      new Date(post.scheduled_publish_time * 1000).toISOString().slice(0, 16)
    );
  };

  const saveEdit = async () => {
    try {
      const res = await fetch("/api/editPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: editingPost.id,
          message: newMessage,
          time: new Date(newTime).getTime() / 1000,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      setPosts(
        posts.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                message: newMessage,
                scheduled_publish_time: new Date(newTime).getTime() / 1000,
              }
            : p
        )
      );
      setEditingPost(null);
    } catch (err) {
      alert("Failed to save changes. Please try again.");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/deletePost?postId=${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleCreatePost = async () => {
    if (!createMessage) {
      alert("Please enter a message for your post");
      return;
    }

    try {
      setIsCreating(true);

      const payload = {
        message: createMessage,
        published: false,
      };

      // Handle scheduling logic
      if (createTime) {
        const scheduledTime = new Date(createTime).getTime() / 1000;
        const now = Date.now() / 1000;
        const tenMinutesFromNow = now + 10 * 60;
        const sixMonthsFromNow = now + 180 * 24 * 60 * 60;

        // Validate scheduling time
        if (scheduledTime < tenMinutesFromNow) {
          throw new Error(
            "Scheduled time must be at least 10 minutes in the future"
          );
        }

        if (scheduledTime > sixMonthsFromNow) {
          throw new Error(
            "Scheduled time cannot be more than 6 months in the future"
          );
        }

        payload.scheduled_publish_time = Math.floor(scheduledTime);
      } else {
        // Post immediately if no time specified
        payload.published = true;
      }

      const res = await fetch("/api/createPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      // Refresh the posts list
      await fetchPosts();

      // Reset form and close modal
      setCreateMessage("");
      setCreateTime("");
      setShowCreateModal(false);
    } catch (err) {
      alert(`Failed to create post: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = () => {
    // Set default time to 1 hour from now
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);

    setCreateTime(defaultTime.toISOString().slice(0, 16));
    setCreateMessage("");
    setShowCreateModal(true);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Scheduled Posts</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-600 text-center">No scheduled posts found</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
            >
              <div className="space-y-2">
                <p className="text-gray-800">{post.message}</p>
                <p className="text-sm text-gray-500">
                  Scheduled for:{" "}
                  {new Date(
                    post.scheduled_publish_time * 1000
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Post message"
            />
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={saveEdit}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPost(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            <textarea
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What would you like to post?"
            />
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Schedule for later (leave empty to post immediately)
              </label>
              <input
                type="datetime-local"
                value={createTime}
                onChange={(e) => setCreateTime(e.target.value)}
                min={new Date(Date.now() + 10 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                max={new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCreatePost}
                disabled={isCreating}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors disabled:bg-green-300"
              >
                {isCreating ? "Creating..." : "Create Post"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
