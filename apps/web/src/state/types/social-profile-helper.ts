export interface SocialProfileHelper {
  platform:
    | "linkedin"
    | "twitter"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "youtube"
    | "github"
    | "other";
  username: string;
}
