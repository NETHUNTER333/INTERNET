import type { Category, SubCategory } from '@/types';

export const SUB_CATEGORIES: Record<Category, SubCategory[]> = {
  politics: [
    'us-politics', 'eu-politics', 'uk-politics', 'indian-politics', 'china-politics',
    'middle-east-politics', 'africa-politics', 'latin-america-politics',
    'elections', 'congress', 'supreme-court', 'foreign-policy', 'defense',
    'immigration', 'campaigns', 'lobbying', 'scandals', 'policy-wonk',
    'fact-check', 'political-theory', 'democracy', 'authoritarianism',
    'human-rights', 'civil-liberties', 'privacy', 'surveillance',
  ],
  technology: [
    'ai-ml', 'cybersecurity', 'startups', 'gadgets', 'software',
    'hardware', 'mobile', 'crypto', 'web3', 'cloud',
    'devops', 'programming', 'open-source', 'social-media', 'streaming',
    'gaming-tech', 'autonomous-vehicles', 'space-tech', 'quantum', 'biotech',
    'fintech', 'edtech', 'agritech', 'climate-tech', 'robotics',
    'semiconductors', 'telecom', '5g', 'data-privacy', 'tech-regulation',
  ],
  world: [
    'africa', 'americas', 'asia', 'europe', 'middle-east',
    'oceania', 'un', 'conflicts', 'humanitarian', 'refugees',
    'trade', 'sanctions', 'summits', 'breakaway-regions', 'border-disputes',
    'natural-disasters', 'pandemics', 'epidemics', 'global-health',
    'climate-crisis', 'terrorism', 'espionage', 'diplomacy',
  ],
  business: [
    'markets', 'stocks', 'crypto-markets', 'real-estate', 'startups-biz',
    'earnings', 'm-and-a', 'ipo', 'venture-capital', 'private-equity',
    'banking', 'insurance', 'energy', 'oil-gas', 'renewable-energy',
    'retail', 'e-commerce', 'supply-chain', 'manufacturing', 'agriculture-biz',
    'airlines', 'automotive-biz', 'pharma-biz', 'media-biz', 'telecom-biz',
    'economy', 'inflation', 'jobs', 'trade-wars', 'tariffs',
  ],
  science: [
    'astronomy', 'physics', 'chemistry', 'biology', 'genetics',
    'neuroscience', 'climate-science', 'geology', 'archaeology',
    'paleontology', 'materials-science', 'mathematics', 'oceanography',
    'meteorology', 'ecology', 'zoology', 'botany', 'microbiology',
    'quantum-physics', 'particle-physics', 'space-exploration',
    'mars', 'exoplanets', 'dark-matter', 'ai-research',
  ],
  health: [
    'covid', 'flu', 'mental-health', 'nutrition', 'fitness',
    'pharma', 'drug-discovery', 'clinical-trials', 'fda', 'healthcare-policy',
    'medicare', 'insurance-health', 'public-health', 'epidemiology',
    'vaccines', 'cancer-research', 'diabetes', 'heart-disease',
    'alzheimers', 'pediatrics', 'geriatrics', 'telemedicine',
    'alternative-medicine', 'wellness', 'addiction', 'obesity',
  ],
  sports: [
    'football', 'basketball', 'baseball', 'soccer', 'cricket',
    'tennis', 'golf', 'hockey', 'mma', 'boxing',
    'f1', 'nascar', 'cycling', 'athletics', 'swimming',
    'gymnastics', 'skiing', 'snowboarding', 'surfing', 'skateboarding',
    'esports', 'rugby', 'volleyball', 'badminton', 'table-tennis',
    'wrestling', 'weightlifting', 'archery', 'shooting', 'sailing',
  ],
  entertainment: [
    'movies', 'tv', 'music', 'streaming-ent', 'awards',
    'celebrity', 'gaming', 'anime', 'manga', 'comics',
    'theater', 'dance', 'opera', 'reality-tv', 'podcasts',
    'book-reviews', 'bestsellers', 'festivals', 'concerts', 'comedy',
    'influencers', 'tiktok-stars', 'youtube-creators',
  ],
  education: [
    'k-12', 'higher-ed', 'admissions', 'student-loans', 'scholarships',
    'online-learning', 'moocs', 'stem-education', 'literacy', 'edtech-tools',
    'teacher-training', 'curriculum', 'standardized-testing', 'special-ed',
    'language-learning', 'study-abroad', 'vocational', 'research-funding',
  ],
  environment: [
    'climate-change', 'deforestation', 'ocean-pollution', 'air-quality',
    'water-crisis', 'biodiversity', 'endangered-species', 'wildfires',
    'hurricanes', 'floods', 'droughts', 'heatwaves', 'recycling',
    'renewable-energy-env', 'carbon-capture', 'electric-vehicles',
    'plastic-waste', 'nuclear-waste', 'mining-impact', 'overfishing',
  ],
  culture: [
    'art', 'literature', 'poetry', 'photography', 'sculpture',
    'museums', 'heritage', 'indigenous', 'folklore', 'languages-culture',
    'religion', 'spirituality', 'food-culture', 'fashion', 'design',
    'architecture', 'film-criticism', 'music-history', 'pop-culture',
    'internet-culture', 'memes', 'subcultures',
  ],
  opinion: [
    'editorials', 'op-eds', 'columns', 'letters', 'commentary',
    'longform', 'essays', 'reviews', 'analysis', 'perspectives',
    'debate', 'roundtable', 'reader-letters', 'punditry',
  ],
  space: [
    'space-exploration', 'mars', 'exoplanets', 'dark-matter', 'black-holes',
    'stars', 'galaxies', 'cosmology', 'asteroids', 'comets',
    'space-station', 'satellites', 'rockets', 'space-telescopes',
  ],
  ai: [
    'machine-learning', 'large-language-models', 'computer-vision', 'nlp',
    'robotics-ai', 'ai-safety', 'ai-ethics', 'generative-ai', 'transformers',
    'reinforcement-learning', 'neural-networks', 'deep-learning',
  ],
  crypto: [
    'bitcoin', 'ethereum', 'defi', 'nft', 'web3', 'blockchain',
    'crypto-regulation', 'crypto-markets', 'stablecoins', 'mining',
  ],
  startup: [
    'venture-capital', 'seed-funding', 'series-a', 'accelerators',
    'product-launch', 'founder-stories', 'pivot', 'acquisition', 'ipo-startup',
  ],
  design: [
    'ux-design', 'ui-design', 'typography', 'architecture', 'industrial-design',
    'graphic-design', 'brand-identity', 'motion-design', 'design-systems',
  ],
};

export const SUB_CATEGORY_LABELS: Record<string, string> = Object.values(SUB_CATEGORIES).flat().reduce((acc, sub) => {
  acc[sub] = sub.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return acc;
}, {} as Record<string, string>);

export const CATEGORY_GROUPS: { category: Category; subCategories: SubCategory[] }[] = (Object.keys(SUB_CATEGORIES) as Category[]).map((category) => ({
  category,
  subCategories: SUB_CATEGORIES[category],
}));

export const TOTAL_SUB_CATEGORIES = Object.values(SUB_CATEGORIES).reduce((sum, subs) => sum + subs.length, 0);
