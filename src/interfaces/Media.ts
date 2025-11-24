export type MediaEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLDivElement>;
export interface MediaItem {
  url: string;
  name: string;
  path: string;
  isVideo: boolean;
  contentType?: string;
  thumbnailUrl?: string;
  size?: number; // size in bytes (optional)
  duration?: number; // duration in seconds (optional)
}
export interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: MediaItem[];
  initialIndex: number;
}
export interface MediaPreviewProps {
  file: File;
  onRemove: (file: File) => void;
}
