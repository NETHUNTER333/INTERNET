import type { AthleteSocial } from '@/types';

export const ATHLETE_SOCIALS: AthleteSocial[] = [
  // Soccer
  { name: 'Cristiano Ronaldo', sport: 'soccer', instagram: '@cristiano', twitter: '@Cristiano', category: 'sports' },
  { name: 'Lionel Messi', sport: 'soccer', instagram: '@leomessi', twitter: '@TeamMessi', category: 'sports' },
  { name: 'Neymar Jr', sport: 'soccer', instagram: '@neymarjr', twitter: '@neymarjr', category: 'sports' },
  { name: 'Kylian Mbappé', sport: 'soccer', instagram: '@k.mbappe', category: 'sports' },
  { name: 'Vinicius Jr', sport: 'soccer', instagram: '@vinijr', category: 'sports' },
  { name: 'Mohamed Salah', sport: 'soccer', instagram: '@mosalah', twitter: '@MoSalah', category: 'sports' },
  { name: 'Harry Kane', sport: 'soccer', instagram: '@harrykane', category: 'sports' },
  { name: 'Kevin De Bruyne', sport: 'soccer', instagram: '@kevindebruyne', category: 'sports' },
  // Basketball
  { name: 'LeBron James', sport: 'basketball', instagram: '@kingjames', twitter: '@KingJames', category: 'sports' },
  { name: 'Stephen Curry', sport: 'basketball', instagram: '@stephencurry30', twitter: '@StephenCurry30', category: 'sports' },
  { name: 'Kevin Durant', sport: 'basketball', instagram: '@easymoneysniper', twitter: '@KDTrey5', category: 'sports' },
  { name: 'Giannis Antetokounmpo', sport: 'basketball', instagram: '@giannis_anthropomormo', category: 'sports' },
  { name: 'Luka Dončić', sport: 'basketball', instagram: '@luka7doncic', category: 'sports' },
  { name: 'Ja Morant', sport: 'basketball', instagram: '@jamorant', category: 'sports' },
  // Football (American)
  { name: 'Patrick Mahomes', sport: 'football', instagram: '@patrickmahomes', twitter: '@PatrickMahomes', category: 'sports' },
  { name: 'Tom Brady', sport: 'football', instagram: '@tombrady', twitter: '@TomBrady', category: 'sports' },
  { name: 'Travis Kelce', sport: 'football', instagram: '@killatravis', twitter: '@tkelce', category: 'sports' },
  { name: 'Justin Jefferson', sport: 'football', instagram: '@justinjefferson', category: 'sports' },
  // Cricket
  { name: 'Virat Kohli', sport: 'cricket', instagram: '@virat.kohli', twitter: '@imVkohli', category: 'sports' },
  { name: 'MS Dhoni', sport: 'cricket', instagram: '@mahi7781', twitter: '@msdhoni', category: 'sports' },
  { name: 'Rohit Sharma', sport: 'cricket', instagram: '@rohitsharma45', twitter: '@ImRo45', category: 'sports' },
  { name: 'Babar Azam', sport: 'cricket', instagram: '@babarazam', twitter: '@babarazam', category: 'sports' },
  { name: 'Ben Stokes', sport: 'cricket', instagram: '@stokesy', category: 'sports' },
  // Tennis
  { name: 'Roger Federer', sport: 'tennis', instagram: '@rogerfederer', category: 'sports' },
  { name: 'Rafael Nadal', sport: 'tennis', instagram: '@rafaelnadal', twitter: '@RafaelNadal', category: 'sports' },
  { name: 'Novak Djokovic', sport: 'tennis', instagram: '@djokernole', category: 'sports' },
  { name: 'Serena Williams', sport: 'tennis', instagram: '@serenawilliams', category: 'sports' },
  { name: 'Coco Gauff', sport: 'tennis', instagram: '@cocogauff', category: 'sports' },
  { name: 'Carlos Alcaraz', sport: 'tennis', instagram: '@carlitosalcarazz', category: 'sports' },
  // F1
  { name: 'Lewis Hamilton', sport: 'f1', instagram: '@lewishamilton', twitter: '@LewisHamilton', category: 'sports' },
  { name: 'Max Verstappen', sport: 'f1', instagram: '@maxverstappen1', category: 'sports' },
  { name: 'Charles Leclerc', sport: 'f1', instagram: '@charles_leclerc', category: 'sports' },
  { name: 'Lando Norris', sport: 'f1', instagram: '@landonorris', category: 'sports' },
  { name: 'Fernando Alonso', sport: 'f1', instagram: '@fernandoalo_oficial', category: 'sports' },
  // MMA / Boxing
  { name: 'Conor McGregor', sport: 'mma', instagram: '@thenotoriousmma', twitter: '@TheNotoriousMMA', category: 'sports' },
  { name: 'Islam Makhachev', sport: 'mma', instagram: '@islam_makhachev', category: 'sports' },
  { name: 'Jon Jones', sport: 'mma', instagram: '@jonnybones', category: 'sports' },
  { name: 'Canelo Alvarez', sport: 'boxing', instagram: '@canelo', category: 'sports' },
  { name: 'Mike Tyson', sport: 'boxing', instagram: '@miketyson', category: 'sports' },
  // Golf
  { name: 'Tiger Woods', sport: 'golf', instagram: '@tigerwoods', category: 'sports' },
  { name: 'Rory McIlroy', sport: 'golf', instagram: '@rorymcilroy', category: 'sports' },
  { name: 'Scottie Scheffler', sport: 'golf', instagram: '@scottie.scheffler', category: 'sports' },
  // Other
  { name: 'Usain Bolt', sport: 'athletics', instagram: '@usainbolt', category: 'sports' },
  { name: 'Simone Biles', sport: 'gymnastics', instagram: '@simonebiles', category: 'sports' },
  { name: 'Michael Phelps', sport: 'swimming', instagram: '@m_phelps', category: 'sports' },
  { name: 'Shohei Ohtani', sport: 'baseball', instagram: '@shoheiohtani', category: 'sports' },
  { name: 'Lionel Messi Jr', sport: 'soccer', category: 'sports' },
];

export const SPORT_SOCIAL_MAP: Record<string, AthleteSocial[]> = ATHLETE_SOCIALS.reduce((acc, athlete) => {
  if (!acc[athlete.sport]) acc[athlete.sport] = [];
  acc[athlete.sport].push(athlete);
  return acc;
}, {} as Record<string, AthleteSocial[]>);
