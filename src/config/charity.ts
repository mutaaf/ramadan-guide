export interface CharityCampaign {
  id: string;
  name: string;
  description: string;
  url: string;
  imageEmoji: string;
  featured?: boolean;
}

export const CHARITY_CONFIG = {
  enabled: true,
  sectionTitle: "Give in Ramadan",
  sectionSubtitle: "Charity is a pillar of our faith",
  campaigns: [
    {
      id: "islamic-relief",
      name: "Islamic Relief USA",
      description: "Emergency aid and sustainable development worldwide",
      url: "https://irusa.org/ramadan/",
      imageEmoji: "🌍",
      featured: true,
    },
    {
      id: "icna-relief",
      name: "ICNA Relief",
      description: "Serving the underprivileged across America",
      url: "https://icnarelief.org/",
      imageEmoji: "🤝",
    },
    {
      id: "penny-appeal",
      name: "Penny Appeal",
      description: "Small change, big difference — global poverty relief",
      url: "https://pennyappeal.org/",
      imageEmoji: "💛",
    },
    {
      id: "local-masjid",
      name: "Your Local Masjid - VRIC",
      description: "Support your community mosque this Ramadan",
      url: "https://us.mohid.co/tx/txrgn/vric/masjid/online/donation/",
      imageEmoji: "🕌",
    },
  ] as CharityCampaign[],
};
