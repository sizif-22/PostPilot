export type MediaEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLDivElement>;
export interface MediaItem {
  url: string;
  name: string;
  isVideo: boolean;
  type?: string;
  thumbnailUrl?: string;
  size?: number; // size in bytes (optional)
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
