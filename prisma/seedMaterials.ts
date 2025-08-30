import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

const materialsSeedData = [
  {
    title: "Basic Japanese Greetings",
    content: `# Basic Japanese Greetings

Learning proper greetings is essential for any Japanese language student. Here are the fundamental greetings you'll need to know:

## Morning Greetings
- **おはよう (Ohayou)** - Good morning (casual)
- **おはようございます (Ohayou gozaimasu)** - Good morning (polite)

## Daytime Greetings
- **こんにちは (Konnichiwa)** - Hello/Good afternoon
- **こんばんは (Konbanwa)** - Good evening

## Meeting Someone
- **はじめまして (Hajimemashite)** - Nice to meet you
- **よろしくお願いします (Yoroshiku onegaishimasu)** - Please treat me favorably

## Usage Tips
1. Use polite forms with strangers, customers, or superiors
2. Casual forms are for close friends and family
3. Bow slightly when greeting someone in person
4. The time of day determines which greeting to use

Practice these greetings daily to build confidence in your Japanese communication skills!`,
    category: Category.Gengo,
    description: "Learn essential Japanese greetings for daily conversation",
    is_published: true
  },
  {
    title: "Japanese Tea Ceremony Basics",
    content: `# Japanese Tea Ceremony (茶道 - Sadō)

The Japanese tea ceremony is a traditional ritual influenced by Zen Buddhism in which powdered green tea (matcha) is ceremonially prepared and presented to guests.

## History
The tea ceremony developed over centuries, with key influences from:
- Zen Buddhism
- Chinese tea culture
- Japanese aesthetics of simplicity and harmony

## Core Principles (四規 - Shiki)
1. **和 (Wa)** - Harmony
2. **敬 (Kei)** - Respect
3. **清 (Sei)** - Purity
4. **寂 (Jaku)** - Tranquility

## Basic Equipment
- **茶碗 (Chawan)** - Tea bowl
- **茶杓 (Chashaku)** - Tea scoop
- **茶筅 (Chasen)** - Bamboo whisk
- **茶巾 (Chakin)** - Tea cloth

## The Process
1. **Preparation** - Clean all utensils
2. **Water heating** - Heat water to proper temperature
3. **Tea preparation** - Measure and whisk matcha
4. **Presentation** - Serve with proper etiquette
5. **Appreciation** - Guest receives and drinks mindfully

## Cultural Significance
The tea ceremony represents Japanese values of:
- Mindfulness and presence
- Respect for others
- Appreciation of beauty in simplicity
- Seasonal awareness

The ceremony teaches patience, attention to detail, and the importance of creating a peaceful atmosphere for guests.`,
    category: Category.Bunka,
    description: "Discover the art and philosophy of Japanese tea ceremony",
    is_published: true
  },
  {
    title: "Hiragana Writing System",
    content: `# Hiragana (ひらがな) - The Foundation of Japanese Writing

Hiragana is one of three writing systems used in Japanese, consisting of 46 basic characters that represent syllables.

## What is Hiragana?
Hiragana is a phonetic script where each character represents a specific sound. It's typically the first writing system Japanese children learn.

## Basic Hiragana Chart

### A-line (あ行)
- あ (a) - as in "father"
- い (i) - as in "cheese" 
- う (u) - as in "book"
- え (e) - as in "pen"
- お (o) - as in "more"

### K-line (か行)
- か (ka), き (ki), く (ku), け (ke), こ (ko)

### S-line (さ行)
- さ (sa), し (shi), す (su), せ (se), そ (so)

### T-line (た行)
- た (ta), ち (chi), つ (tsu), て (te), と (to)

### N-line (な行)
- な (na), に (ni), ぬ (nu), ね (ne), の (no)

## Usage
Hiragana is used for:
1. **Grammar particles** - は, を, が
2. **Verb endings** - 食べる (taberu - to eat)
3. **Adjective endings** - 大きい (ookii - big)
4. **Native Japanese words** without kanji

## Study Tips
1. Practice stroke order correctly
2. Use mnemonics to remember shapes
3. Practice writing daily
4. Start with simple words like あなた (anata - you)

Master hiragana first before moving to katakana and kanji!`,
    category: Category.Gengo,
    description: "Master the fundamental hiragana writing system",
    is_published: true
  },
  {
    title: "Japanese Seasonal Festivals",
    content: `# Japanese Seasonal Festivals (祭り - Matsuri)

Japan celebrates many beautiful seasonal festivals throughout the year, each reflecting the country's deep connection with nature and tradition.

## Spring Festivals

### Cherry Blossom Festival (桜祭り - Sakura Matsuri)
- **When**: March-May
- **Activities**: Hanami (flower viewing), picnics under cherry trees
- **Significance**: Celebrates the beauty and transience of life

### Children's Day (こどもの日 - Kodomo no Hi)
- **When**: May 5th
- **Activities**: Flying carp streamers (koinobori), eating kashiwa mochi
- **Significance**: Wishes for children's health and happiness

## Summer Festivals

### Tanabata (七夕)
- **When**: July 7th
- **Activities**: Writing wishes on paper strips, decorating bamboo
- **Legend**: Celebrates the meeting of celestial lovers

### Bon Festival (お盆)
- **When**: Mid-August
- **Activities**: Honoring ancestors, traditional dances (Bon Odori)
- **Significance**: Welcoming ancestral spirits home

## Autumn Festivals

### Moon Viewing (月見 - Tsukimi)
- **When**: September/October
- **Activities**: Viewing the full moon, eating dango
- **Significance**: Appreciating autumn's beauty

## Winter Festivals

### New Year (正月 - Shōgatsu)
- **When**: January 1-3
- **Activities**: First shrine visit (hatsumōde), eating osechi
- **Significance**: Fresh start, family reunions

## Festival Elements
- **Matsuri food**: Takoyaki, yakitori, cotton candy
- **Traditional clothing**: Yukata in summer, kimono for formal events
- **Music and dance**: Taiko drums, traditional folk dances
- **Decorations**: Lanterns, seasonal flowers, lucky charms

These festivals showcase Japan's respect for nature's cycles and provide opportunities for community bonding and cultural preservation.`,
    category: Category.Bunka,
    description: "Explore Japan's beautiful seasonal celebration traditions",
    is_published: true
  },
  {
    title: "Japanese Counting System",
    content: `# Japanese Numbers and Counting

Japanese has two number systems that are used in different contexts. Understanding when to use each is crucial for effective communication.

## Basic Numbers (1-10)

### Native Japanese (Yamato)
- ひとつ (hitotsu) - 1
- ふたつ (futatsu) - 2  
- みっつ (mittsu) - 3
- よっつ (yottsu) - 4
- いつつ (itsutsu) - 5
- むっつ (muttsu) - 6
- ななつ (nanatsu) - 7
- やっつ (yattsu) - 8
- ここのつ (kokonotsu) - 9
- とお (too) - 10

### Sino-Japanese (Chinese origin)
- いち (ichi) - 1
- に (ni) - 2
- さん (san) - 3
- よん/し (yon/shi) - 4
- ご (go) - 5
- ろく (roku) - 6
- なな/しち (nana/shichi) - 7
- はち (hachi) - 8
- きゅう/く (kyuu/ku) - 9
- じゅう (juu) - 10

## When to Use Which System

### Native Japanese Numbers
- General counting of objects (up to 10)
- Age (for young children)
- Simple quantities: "いくつ？" (How many?)

### Sino-Japanese Numbers
- Large numbers (11+)
- Math calculations
- Addresses and phone numbers
- Time and dates
- Money amounts

## Counter Words (助数詞)
Japanese uses specific counters for different types of objects:

- **人 (nin/ri)** - People: 一人 (hitori), 二人 (futari)
- **本 (hon/pon/bon)** - Long objects: ペン一本 (pen ippon)
- **枚 (mai)** - Flat objects: 紙一枚 (kami ichimai)
- **匹/匹 (hiki/piki/biki)** - Small animals: 犬一匹 (inu ippiki)
- **台 (dai)** - Machines: 車一台 (kuruma ichidai)

## Practice Examples
- "りんごを三つください" (Please give me three apples)
- "今何時ですか？" "二時です" (What time is it? It's 2 o'clock)
- "学生が十五人います" (There are 15 students)

Start with basic numbers and gradually learn the most common counters!`,
    category: Category.Gengo,
    description: "Learn the Japanese number systems and counting rules",
    is_published: false // This one is draft for demonstration
  }
];

export async function seedMaterials() {
  try {
    console.log('Seeding materials...');

    // First, get or create an admin user for materials
    let adminUser = await prisma.adminUser.findFirst();
    
    if (!adminUser) {
      // Create a default admin user if none exists
      adminUser = await prisma.adminUser.create({
        data: {
          email: 'admin@example.com',
          password_hash: 'hashed_password_here' // In real app, this should be properly hashed
        }
      });
      console.log('Created admin user for materials');
    }

    // Clear existing materials (optional - remove if you want to keep existing data)
    await prisma.material.deleteMany();
    console.log('Cleared existing materials');

    // Create materials
    for (const materialData of materialsSeedData) {
      await prisma.material.create({
        data: {
          ...materialData,
          author_id: adminUser.id
        }
      });
    }

    console.log(`Successfully seeded ${materialsSeedData.length} materials`);
  } catch (error) {
    console.error('Error seeding materials:', error);
    throw error;
  }
}

export default seedMaterials;
