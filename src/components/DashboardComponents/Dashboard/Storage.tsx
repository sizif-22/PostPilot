import React from "react";
import { Progress } from "@/components/ui/progress";
import { FiHardDrive, FiFile, FiAlertCircle } from "react-icons/fi";

export const Storage = ({
  storageLimit,
  storageUsed,
  filesCount,
}: {
  storageLimit: number;
  storageUsed: number;
  filesCount: number;
}) => {
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="col-span-1 flex flex-col justify-around  row-span-1 border shadow-sm dark:shadow-lg rounded-lg p-2 h-[30vh] dark:bg-transparent dark:border-darkBorder">
      <div className="flex flex-col items-start justify-between">
        <div className="flex items-center gap-2">
          <FiHardDrive className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-lg dark:text-gray-100">Storage Overview</h2>
        </div>
        {storagePercentage >= 80 && (
          <div className="flex items-center gap-1 text-amber-500">
            <FiAlertCircle className="w-4 h-4" />
            <span className="text-xs">Storage almost full</span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {storageUsed}MB used of {storageLimit}MB
          </span>
          <span>{storagePercentage.toFixed(1)}%</span>
        </div>
        <Progress alert={true} value={storagePercentage} className={`h-2`} />
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded-lg p-2 dark:border-darkBorder">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiHardDrive className="w-4 h-4" />
            <span className="text-sm">Available</span>
          </div>
          <p className="text-lg font-semibold dark:text-gray-100">
            {storageLimit - storageUsed}MB
          </p>
        </div>

        <div className="border rounded-lg p-2 dark:border-darkBorder">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiFile className="w-4 h-4" />
            <span className="text-sm">Files</span>
          </div>
          <p className="text-lg font-semibold dark:text-gray-100">{filesCount}</p>
        </div>
      </div>
    </div>
  );
};
