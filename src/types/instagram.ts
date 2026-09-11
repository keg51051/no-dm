/** Instagram 게시물 데이터 */
export interface InstagramPost {
  url: string;
  shortcode: string;
  caption: string | null;
  imageUrls: string[];
  thumbnailUrl: string | null;
  videoUrl: string | null;
  locationName: string | null;
  hashtags: string[];
  authorUsername: string | null;
  timestamp: string | null;
}

/** Instagram oEmbed API 응답 */
export interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  type: string;
}

/** URL 파싱 결과 */
export interface ParsedInstagramUrl {
  isValid: boolean;
  shortcode: string | null;
  type: 'post' | 'reel' | 'unknown';
}
