import { CreditCard, MessageSquare, Smartphone } from "lucide-react";
import type { SocialPlatformMatcher } from "./social-platform-matcher";

export const SOCIAL_PLATFORM_MATCHERS: SocialPlatformMatcher[] = [
  {
    hostPatterns: ["wa.me", "whatsapp.com", "api.whatsapp.com"],
    resolve: (_hostname, pathname) => {
      const phoneMatch = /(\d+)/.exec(pathname);
      const phone = phoneMatch ? phoneMatch[1] : null;
      return {
        name: "WhatsApp",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            WhatsApp
          </span>
        ),
        extractedInfo: phone ? (
          <a href={`tel:+${phone}`} className="font-mono text-xs text-primary hover:underline">
            +{phone}
          </a>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["facebook.com", "fb.com", "fb.me", "m.facebook.com"],
    resolve: () => ({
      name: "Facebook",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
          Facebook
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["instagram.com", "instagr.am"],
    resolve: (_hostname, pathname) => {
      const usernameMatch = /^\/([^/]+)/.exec(pathname);
      const username =
        usernameMatch && !["p", "reel", "stories", "explore"].includes(usernameMatch[1])
          ? usernameMatch[1]
          : null;
      return {
        name: "Instagram",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
            Instagram
          </span>
        ),
        extractedInfo: username ? (
          <span className="font-mono text-xs">@{username}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["twitter.com", "x.com", "t.co"],
    resolve: (_hostname, pathname) => {
      const usernameMatch = /^\/([^/]+)/.exec(pathname);
      const username =
        usernameMatch && !["search", "explore", "home", "i", "intent"].includes(usernameMatch[1])
          ? usernameMatch[1]
          : null;
      return {
        name: "X (Twitter)",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white dark:bg-white dark:text-black">
            𝕏
          </span>
        ),
        extractedInfo: username ? (
          <span className="font-mono text-xs">@{username}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["youtube.com", "youtu.be", "m.youtube.com"],
    resolve: (hostname, pathname, urlObj) => {
      let videoId: string | null = null;
      if (hostname.includes("youtu.be")) {
        videoId = pathname.slice(1).split("?")[0];
      } else {
        const vParam = urlObj.searchParams.get("v");
        if (vParam) videoId = vParam;
      }
      return {
        name: "YouTube",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
            ▶ YouTube
          </span>
        ),
        extractedInfo: videoId ? (
          <span className="font-mono text-xs">Video: {videoId}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["linkedin.com", "lnkd.in"],
    resolve: () => ({
      name: "LinkedIn",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-white">
          LinkedIn
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["tiktok.com", "vm.tiktok.com"],
    resolve: (_hostname, pathname) => {
      const usernameMatch = /^\/@([^/]+)/.exec(pathname);
      return {
        name: "TikTok",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white">
            ♪ TikTok
          </span>
        ),
        extractedInfo: usernameMatch ? (
          <span className="font-mono text-xs">@{usernameMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["t.me", "telegram.me", "telegram.org"],
    resolve: (_hostname, pathname) => {
      const usernameMatch = /^\/([^/]+)/.exec(pathname);
      return {
        name: "Telegram",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500 text-white">
            Telegram
          </span>
        ),
        extractedInfo: usernameMatch ? (
          <span className="font-mono text-xs">@{usernameMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["discord.gg", "discord.com", "discordapp.com"],
    resolve: () => ({
      name: "Discord",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
          Discord
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["snapchat.com", "snap.com"],
    resolve: () => ({
      name: "Snapchat",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
          👻 Snapchat
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["reddit.com", "redd.it"],
    resolve: (_hostname, pathname) => {
      const subredditMatch = /^\/r\/([^/]+)/.exec(pathname);
      return {
        name: "Reddit",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-600 text-white">
            Reddit
          </span>
        ),
        extractedInfo: subredditMatch ? (
          <span className="font-mono text-xs">r/{subredditMatch[1]}</span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["pinterest.com", "pin.it"],
    resolve: () => ({
      name: "Pinterest",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-700 text-white">
          Pinterest
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["apps.apple.com", "itunes.apple.com"],
    resolve: () => ({
      name: "App Store",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          App Store
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["play.google.com"],
    resolve: () => ({
      name: "Google Play",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          Google Play
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["spotify.com", "open.spotify.com"],
    resolve: () => ({
      name: "Spotify",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
          ♫ Spotify
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["github.com", "gist.github.com"],
    resolve: (_hostname, pathname) => {
      const repoMatch = /^\/([^/]+)\/([^/]+)/.exec(pathname);
      return {
        name: "GitHub",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800">
            GitHub
          </span>
        ),
        extractedInfo: repoMatch ? (
          <span className="font-mono text-xs">
            {repoMatch[1]}/{repoMatch[2]}
          </span>
        ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["paypal.com", "paypal.me"],
    resolve: (hostname, pathname) => {
      const usernameMatch = /^\/([^/]+)/.exec(pathname);
      return {
        name: "PayPal",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            PayPal
          </span>
        ),
        extractedInfo:
          usernameMatch && hostname.includes("paypal.me") ? (
            <span className="font-mono text-xs">@{usernameMatch[1]}</span>
          ) : undefined,
      };
    },
  },
  {
    hostPatterns: ["venmo.com"],
    resolve: () => ({
      name: "Venmo",
      badge: (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400 text-white flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Venmo
        </span>
      ),
    }),
  },
  {
    hostPatterns: ["cash.app"],
    resolve: (_hostname, pathname) => {
      const cashtagMatch = /^\/(\$[^/]+)/.exec(pathname);
      return {
        name: "Cash App",
        badge: (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Cash App
          </span>
        ),
        extractedInfo: cashtagMatch ? (
          <span className="font-mono text-xs">{cashtagMatch[1]}</span>
        ) : undefined,
      };
    },
  },
];
