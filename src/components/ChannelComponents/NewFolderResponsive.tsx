'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { FiPlus, FiFolder, FiFileText } from 'react-icons/fi'
import { Channel } from '@/interfaces/Channel'
import { Timestamp } from 'firebase/firestore'
import { createChannel } from '@/firebase/channel.firestore'
import { useUser } from '@/context/UserContext'

export function NewFolderResponsive({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { user } = useUser()
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [onProgress, setOnProgress] = useState(false)

  const handleCreateChannel = async () => {
    setOnProgress(true)
    if (channelName && user?.email && user.name) {
      const channel: Channel = {
        id: '',
        name: channelName,
        description: channelDescription,
        authority: 'Owner',
        createdAt: Timestamp.now(),
        posts: {},
        TeamMembers: [
          {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: 'Owner',
            status: 'active',
          },
        ],
      }
      await createChannel(channel, user)
      setChannelName('')
      setChannelDescription('')
      setOpen(false)
    }
    setOnProgress(false)
  }

  const form = (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiFolder className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Create New Collection
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Organize your social media content by creating a dedicated collection for your posts and campaigns.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-4">
        {/* Folder Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FiFolder className="w-4 h-4" />
            Collection Name
          </label>
          <input
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            type="text"
            placeholder="Enter collection name..."
            className="w-full border border-gray-200 dark:border-darkButtons focus:outline-1 focus:outline rounded-lg px-4 py-3 text-sm  dark:bg-darkBorder  dark:text-white placeholder-gray-400 dark:placeholder-white/70 transition-all"
          />
        </div>

        {/* Folder Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FiFileText className="w-4 h-4" />
            Collection Description
          </label>
          <textarea
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            placeholder="Describe what this collection will be used for..."
            rows={4}
            className=" resize-none w-full border border-gray-200 dark:border-darkButtons focus:outline-1 focus:outline dark:outline-white rounded-lg px-4 py-3 text-sm  dark:bg-darkBorder  dark:text-white placeholder-gray-400 dark:placeholder-white/70 transition-all"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {channelDescription.length}/500 characters
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-darkBorder">
        <Button
          disabled={onProgress}
          variant={'outline'}
          onClick={() => {
            setChannelName('')
            setChannelDescription('')
            setOpen(false)
          }}
          className="w-full sm:w-auto px-6 py-2.5 text-sm transition-colors">
          Cancel
        </Button>
        <Button
          onClick={handleCreateChannel}
          className={`w-full sm:w-auto px-6 py-2.5 text-sm transition-all duration-200  ${
            channelName.trim()
            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg '
            : 'cursor-not-allowed'
          }`}
            disabled={onProgress || !channelName.trim()}
          >
          {onProgress ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              <span>Create Collection</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md dark:text-white">
          <SheetHeader className="sr-only">
            <SheetTitle>Create New Folder</SheetTitle>
          </SheetHeader>
          <div className="pt-6">
            {form}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-xl dark:text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}