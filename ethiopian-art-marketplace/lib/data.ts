export type ArtworkStatus = 'Available' | 'Reserved' | 'Sold';

export type Artist = {
  slug: string;
  name: string;
  location: string;
  statement: string;
  bio: string;
  verified: boolean;
  initials: string;
};

export type Artwork = {
  slug: string;
  title: string;
  artistSlug: string;
  artist: string;
  price: number;
  status: ArtworkStatus;
  medium: string;
  year: number;
  dimensions: string;
  category: string;
  story: string;
  tone: string;
};

export const artists: Artist[] = [
  {
    slug: 'hana-tesfaye',
    name: 'Hana Tesfaye',
    location: 'Addis Ababa',
    statement: 'I paint quiet moments where memory, city life, and light meet.',
    bio: 'Hana is an Addis Ababa-based painter exploring urban memory, everyday rituals, and the emotional character of familiar places. Her layered surfaces combine warm earth tones with luminous color.',
    verified: true,
    initials: 'HT'
  },
  {
    slug: 'dawit-mekonnen',
    name: 'Dawit Mekonnen',
    location: 'Bahir Dar',
    statement: 'My work follows water, movement, and the geometry of Ethiopian landscapes.',
    bio: 'Dawit works across acrylic and mixed media, translating landscape and movement into bold compositions. His practice is rooted in the changing colors of northern Ethiopia.',
    verified: true,
    initials: 'DM'
  },
  {
    slug: 'selam-bekele',
    name: 'Selam Bekele',
    location: 'Addis Ababa',
    statement: 'Portraiture is how I study presence, identity, and unspoken stories.',
    bio: 'Selam is a contemporary portrait artist working with oil and charcoal. Her work focuses on intimate expressions and the quiet confidence of her subjects.',
    verified: true,
    initials: 'SB'
  }
];

export const artworks: Artwork[] = [
  {
    slug: 'addis-morning',
    title: 'Addis Morning',
    artistSlug: 'hana-tesfaye',
    artist: 'Hana Tesfaye',
    price: 30000,
    status: 'Available',
    medium: 'Oil on canvas',
    year: 2026,
    dimensions: '80 × 60 cm',
    category: 'Painting',
    story: 'A study of Addis Ababa before the streets fully wake: pale light, distant movement, coffee steam, and the feeling that the city is about to begin again.',
    tone: 'sunrise'
  },
  {
    slug: 'blue-nile-rhythm',
    title: 'Blue Nile Rhythm',
    artistSlug: 'dawit-mekonnen',
    artist: 'Dawit Mekonnen',
    price: 42000,
    status: 'Available',
    medium: 'Acrylic and mixed media',
    year: 2026,
    dimensions: '100 × 75 cm',
    category: 'Mixed Media',
    story: 'Layered marks follow the pulse of water and the changing shoreline, balancing movement with stillness.',
    tone: 'nile'
  },
  {
    slug: 'quiet-strength',
    title: 'Quiet Strength',
    artistSlug: 'selam-bekele',
    artist: 'Selam Bekele',
    price: 36000,
    status: 'Reserved',
    medium: 'Oil and charcoal',
    year: 2025,
    dimensions: '70 × 50 cm',
    category: 'Portrait',
    story: 'A portrait about calm confidence—the kind that does not need to announce itself to be felt.',
    tone: 'portrait'
  },
  {
    slug: 'market-day',
    title: 'Market Day',
    artistSlug: 'hana-tesfaye',
    artist: 'Hana Tesfaye',
    price: 28000,
    status: 'Available',
    medium: 'Oil on canvas',
    year: 2025,
    dimensions: '65 × 65 cm',
    category: 'Painting',
    story: 'Color, repetition, and conversation come together in an abstract memory of a crowded market afternoon.',
    tone: 'market'
  },
  {
    slug: 'highland-wind',
    title: 'Highland Wind',
    artistSlug: 'dawit-mekonnen',
    artist: 'Dawit Mekonnen',
    price: 51000,
    status: 'Sold',
    medium: 'Acrylic on canvas',
    year: 2025,
    dimensions: '120 × 90 cm',
    category: 'Contemporary',
    story: 'A broad, atmospheric composition inspired by wind moving across the highlands after rain.',
    tone: 'highland'
  },
  {
    slug: 'golden-thread',
    title: 'Golden Thread',
    artistSlug: 'selam-bekele',
    artist: 'Selam Bekele',
    price: 33000,
    status: 'Available',
    medium: 'Charcoal, pigment and gold leaf',
    year: 2026,
    dimensions: '60 × 45 cm',
    category: 'Mixed Media',
    story: 'A restrained portrait where a single gold line connects ancestry, memory, and the present.',
    tone: 'gold'
  }
];

export const formatETB = (amount: number) => `${new Intl.NumberFormat('en-US').format(amount)} ETB`;
export const getArtwork = (slug: string) => artworks.find((item) => item.slug === slug);
export const getArtist = (slug: string) => artists.find((item) => item.slug === slug);
