import React from 'react'
import { Progress } from "@/components/ui/progress"
import { FiHardDrive, FiFile, FiAlertCircle } from 'react-icons/fi'

export const Storage = () => {
  const storageLimit = 500;
  const storageUsed = 350;
  const filesCount = 100;
  const storagePercentage = (storageUsed / storageLimit) * 100;
  
  return (
    <div className="col-span-1 flex flex-col justify-around  row-span-1 border shadow-sm rounded-lg p-2 h-[30vh]">
      <div className="flex flex-col items-start justify-between">
        <div className="flex items-center gap-2">
          <FiHardDrive className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-lg">Storage Overview</h2>
        </div>
        {storagePercentage >= 80 && (
          <div className="flex items-center gap-1 text-amber-500">
            <FiAlertCircle className="w-4 h-4" />
            <span className="text-xs">Storage almost full</span>
          </div>
        )}
      </div>

        {/* Progress Section */}
        <div className='flex flex-col gap-2'>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{storageUsed}MB used of {storageLimit}MB</span>
            <span>{storagePercentage.toFixed(1)}%</span>
          </div>
          <Progress
            value={storagePercentage} 
            className={`h-2`}
          />
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-lg p-2 ">
            <div className="flex items-center gap-2 text-gray-600">
              <FiHardDrive className="w-4 h-4" />
              <span className="text-sm">Available</span>
            </div>
            <p className="text-lg font-semibold">{storageLimit - storageUsed}MB</p>
          </div>
          
          <div className="border rounded-lg p-2 ">
            <div className="flex items-center gap-2 text-gray-600 ">
              <FiFile className="w-4 h-4" />
              <span className="text-sm">Files</span>
            </div>
            <p className="text-lg font-semibold">{filesCount}</p>
          </div>
        </div>
      </div>
  )
}
