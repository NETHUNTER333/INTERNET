import type { Category, BiasRating } from '@/types';

export interface YouTubeSource {
  channelName: string;
  channelId: string;
  category: Category;
  bias: BiasRating;
  region?: string;
}

export const YOUTUBE_SOURCES: YouTubeSource[] = [
  // World
  { channelName: 'BBC News', channelId: 'UC16niRr50-MSBwiO3YDb3RA', category: 'world', bias: 'center', region: 'UK' },
  { channelName: 'Al Jazeera English', channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg', category: 'world', bias: 'lean_left', region: 'QA' },
  { channelName: 'Sky News', channelId: 'UCoMdktPbSTkAyGAyeYinByg', category: 'world', bias: 'center', region: 'UK' },
  { channelName: 'DW News', channelId: 'UCknLrEdhRCp1aegoMqRaCZg', category: 'world', bias: 'center', region: 'DE' },
  { channelName: 'France 24', channelId: 'UCCff-PxgkdE4Z0g_0LMgIeA', category: 'world', bias: 'center', region: 'FR' },
  { channelName: 'WION', channelId: 'UC_gEE_Qv9GaI_va16R4CzKQ', category: 'world', bias: 'center', region: 'IN' },
  { channelName: 'NHK World Japan', channelId: 'UCSPEjw8F2nQD1Ukx7Nt5x5g', category: 'world', bias: 'center', region: 'JP' },
  { channelName: 'TRT World', channelId: 'UC7fWeoxHxCtrRIdo83vDZSw', category: 'world', bias: 'center', region: 'TR' },

  // Politics
  { channelName: 'Fox News', channelId: 'UCXIJgqnII2ZOINSVNOg35ul', category: 'politics', bias: 'right', region: 'US' },
  { channelName: 'CNN', channelId: 'UCupvZG-5ko_eiXAupbDfxWw', category: 'politics', bias: 'lean_left', region: 'US' },
  { channelName: 'MSNBC', channelId: 'UCaXkIU1QidjPwi_IFuAgypg', category: 'politics', bias: 'left', region: 'US' },
  { channelName: 'ABC News', channelId: 'UCBi2mrWuNuyYy4gbM6fU18Q', category: 'politics', bias: 'lean_left', region: 'US' },
  { channelName: 'CBS News', channelId: 'UC8p1vwvWtl6T73RiR3Xf3qQ', category: 'politics', bias: 'lean_left', region: 'US' },
  { channelName: 'NBC News', channelId: 'UCeY0bbntWzzVI5223LQUUSg', category: 'politics', bias: 'lean_left', region: 'US' },

  // Business
  { channelName: 'Bloomberg', channelId: 'UCIALMKvObZNtJ6AmdCLP7Lg', category: 'business', bias: 'center', region: 'US' },
  { channelName: 'CNBC Television', channelId: 'UCrp_UI8X5YsswNQAJ2lO9uA', category: 'business', bias: 'center', region: 'US' },
  { channelName: 'Yahoo Finance', channelId: 'UCEAZeUI3Qq8aaaePk7G1rlg', category: 'business', bias: 'center', region: 'US' },

  // Technology
  { channelName: 'Wired', channelId: 'UCftwRNsjfRo08xYQw7N2Z0g', category: 'technology', bias: 'lean_left', region: 'US' },
  { channelName: 'TechCrunch', channelId: 'UCxC5Zuxjt2J7HCr7XTkbsYA', category: 'technology', bias: 'center', region: 'US' },
  { channelName: 'The Verge', channelId: 'UCddiUEpeqJcYeBxX1IVBK9Q', category: 'technology', bias: 'lean_left', region: 'US' },
  { channelName: 'Marques Brownlee', channelId: 'UCBJycsmduvYEL83R_U4JriQ', category: 'technology', bias: 'center', region: 'US' },
  { channelName: 'Linus Tech Tips', channelId: 'UCXuqSBlHAE6Xw-yeJA0tunw', category: 'technology', bias: 'center', region: 'CA' },

  // Science - informative channels
  { channelName: 'NASA', channelId: 'UCryGec9PdUCLjpJW2mgCuLw', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'Veritasium', channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'Kurzgesagt', channelId: 'UCsXVk37bltHxDI5D6cg3JVg', category: 'science', bias: 'center', region: 'DE' },
  { channelName: 'Vsauce', channelId: 'UC6nSFpj9HTLZb0WQ1yXrIYQ', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'SmarterEveryDay', channelId: 'UC610QW3v5kARxV2D3K5xX2Q', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'Mark Rober', channelId: 'UCYlk8qLttA1WJM2BSz5kM7w', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'Fern', channelId: 'UC2Fe2pZLhZ6UgqA7Jz9VU0Q', category: 'science', bias: 'center', region: 'US' },
  { channelName: '3Blue1Brown', channelId: 'UCYO_jab_j5EWzLc6jO5fXwQ', category: 'science', bias: 'center', region: 'US' },
  { channelName: 'SciShow', channelId: 'UCZYTClx2T2v5qL3r3yY6zQw', category: 'science', bias: 'center', region: 'US' },

  // Health
  { channelName: 'Dr. Mike', channelId: 'UC2vlY3xAL3wgfXxZ6G1kDwQ', category: 'health', bias: 'center', region: 'US' },
  { channelName: 'Healthcare Triage', channelId: 'UCtbLgKQMN1FAtmEkS5j3zFQ', category: 'health', bias: 'center', region: 'US' },

  // Sports
  { channelName: 'ESPN', channelId: 'UCiWIg65pX9j4Ek6RgR_QeDg', category: 'sports', bias: 'center', region: 'US' },
  { channelName: 'NBA', channelId: 'UCWJ2lWNubArHWmf3FIYb3WA', category: 'sports', bias: 'center', region: 'US' },
  { channelName: 'F1', channelId: 'UCuortaVZwzOd_p2UJCpl0Vw', category: 'sports', bias: 'center', region: 'UK' },
  { channelName: 'NFL', channelId: 'UCDVY_QpQXIpwEofVjLeB98w', category: 'sports', bias: 'center', region: 'US' },

  // Entertainment
  { channelName: 'The Tonight Show', channelId: 'UC8-Th83bH_thdKZDJCrn88g', category: 'entertainment', bias: 'lean_left', region: 'US' },
  { channelName: 'Late Show Colbert', channelId: 'UCMtFAi84ThTSf3oV5J2t2Mg', category: 'entertainment', bias: 'lean_left', region: 'US' },
  { channelName: 'IGN', channelId: 'UCKy1dAqELo0zrOtPkf0e-mw', category: 'entertainment', bias: 'center', region: 'US' },

  // Environment
  { channelName: 'Our Changing Climate', channelId: 'UCaYxN1sa4aE0f2eO5e1uJNQ', category: 'environment', bias: 'lean_left', region: 'US' },

  // Education
  { channelName: 'TED-Ed', channelId: 'UCsooa4ybcf2Vpe8hI8jtcKQ', category: 'education', bias: 'center', region: 'US' },
  { channelName: 'CrashCourse', channelId: 'UCX6b17PVsYBQ0ip5gyjm-qg', category: 'education', bias: 'center', region: 'US' },

  // Opinion
  { channelName: 'Ben Shapiro', channelId: 'UCn1VLPi9xY_sJ_qi6YtQf4g', category: 'opinion', bias: 'right', region: 'US' },
  { channelName: 'Vox', channelId: 'UCLXo7UDZvByw2izzpH0yt5Q', category: 'opinion', bias: 'lean_left', region: 'US' },

  // Space
  { channelName: 'NASA', channelId: 'UCryGec9PdUCLjpJW2mgCuLw', category: 'space', bias: 'center', region: 'US' },
  { channelName: 'SpaceX', channelId: 'UCtI0HnU4wKM2JjiHqAr4TFQ', category: 'space', bias: 'center', region: 'US' },
  { channelName: 'Everyday Astronaut', channelId: 'UC6u1m7E4U8NRA1Q3UO7mFpQ', category: 'space', bias: 'center', region: 'US' },

  // AI
  { channelName: 'Two Minute Papers', channelId: 'UCbfYPy5Qbo48gZ8TLOD5D5g', category: 'ai', bias: 'center', region: 'US' },
  { channelName: 'Yannic Kilcher', channelId: 'UCZH5QjmN5WWwa2_8m1PP6xw', category: 'ai', bias: 'center', region: 'CH' },
  { channelName: 'AI Explained', channelId: 'UCvsCzyOOgJX5Keees6R5lHw', category: 'ai', bias: 'center', region: 'UK' },

  // Crypto
  { channelName: 'Coin Bureau', channelId: 'UCsXnVE7wc6pvHjGAYyyqXwQ', category: 'crypto', bias: 'center', region: 'US' },

  // Startups
  { channelName: 'Y Combinator', channelId: 'UCNf6qUO2vp9KpYv9Kq6q6qQ', category: 'startup', bias: 'center', region: 'US' },

  // Design
  { channelName: 'Dribbble', channelId: 'UC0St2aGxJ7Z5p6fQ6fQ6fQ6f', category: 'design', bias: 'center', region: 'US' },
];
