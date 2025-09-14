
import { MediaItem } from "@/interfaces/Media";

export interface PostOnLinkedInProps {
  accessToken: string;
  author: string;
  message: string;
  media?: MediaItem[];
}
