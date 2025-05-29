import React, { useState } from 'react'
import { Command } from 'cmdk'
import { FiFacebook, FiInstagram, FiImage, FiX, FiCalendar, FiClock, FiRefreshCcw } from 'react-icons/fi'

interface Platform {
  id: string;
  name: string;
  icon: typeof FiFacebook;
  color: string;
}

const platforms: Platform[] = [
  { id: 'facebook', name: 'Facebook', icon: FiFacebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: FiInstagram, color: '#E4405F' },
];

export const CPDialog = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postText, setPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const resetForm = () => {
    setPostText('');
    setImageUrl('');
    setSelectedPlatforms([]);
    setScheduledDate('');
  };

  const handlePost = async (immediate: boolean = true) => {
    setIsPosting(true);
    try {
      const postData = {
        platforms: selectedPlatforms,
        content: postText,
        image: imageUrl,
        ...(immediate ? { immediate: true } : {
          scheduledDate,        })
      };
      
      console.log('Posting:', postData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOpen(false);
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const isFormValid = (postText.trim() || imageUrl.trim()) && selectedPlatforms.length > 0;
  const canSchedule = isFormValid && scheduledDate;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Create Post"
      className="fixed inset-0 bg-stone-950/50 outline-0 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-2xl bg-white rounded-lg shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold">Create New Post</h2>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <FiX className="text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Select Platforms</label>
            <div className="flex gap-2">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-stone-300 bg-stone-100'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <platform.icon 
                    style={{ color: platform.color }} 
                    className="text-lg"
                  />
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Post Content</label>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What would you like to share?"
              className="w-full h-32 p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Add Image</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors">
                <FiImage className="text-lg" />
              </button>
            </div>
          </div>

          {/* Schedule Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Schedule (Optional)</label>
            
              <div className="space-y-2">
                <label className="block text-xs text-stone-500">
                  <span className="flex items-center gap-2">
                    <FiCalendar className="text-stone-400" />
                    Date
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 pt-4">
            <button
              onClick={resetForm}
              type="button"
              className="p-2 text-red-500 hover:bg-stone-100 rounded-lg transition-colors"
              title="Reset form"
            >
              Reset
            </button>
            <div className='flex justify-end gap-2'>

            {(
              <button
                onClick={() => handlePost(false)}
                disabled={isPosting || !canSchedule}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isPosting || !canSchedule ? 'cursor-not-allowed text-stone-400' : 'text-violet-600 hover:bg-violet-50'
                }`}
              >
                {isPosting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <span>Schedule Post</span>
                )}
              </button>
            )}
            <button
              onClick={() => handlePost(true)}
              disabled={!isFormValid || isPosting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                isFormValid && !isPosting
                  ? 'bg-violet-500 hover:bg-violet-600'
                  : 'bg-stone-300 cursor-not-allowed'
              }`}
            >
              {isPosting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post Now</span>
              )}
            </button>
              </div>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
};

