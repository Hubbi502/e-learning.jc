import { PrismaClient, Category, Option } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  {
    question_text: "Yang manakah huruf \"ka\"?",
    option_a: "さ",
    option_b: "か",
    option_c: "こ", 
    option_d: "き",
    correct_option: "B" as Option
  },
  {
    question_text: "Huruf berikut dibaca apa? → き",
    option_a: "ki",
    option_b: "ku",
    option_c: "ka",
    option_d: "ke",
    correct_option: "A" as Option
  },
  {
    question_text: "Yang manakah huruf \"ku\"?",
    option_a: "け",
    option_b: "く",
    option_c: "そ",
    option_d: "こ",
    correct_option: "B" as Option
  },
  {
    question_text: "Huruf け dibaca …",
    option_a: "ka",
    option_b: "ke", 
    option_c: "sa",
    option_d: "ku",
    correct_option: "B" as Option
  },
  {
    question_text: "Yang manakah huruf \"ko\"?",
    option_a: "す",
    option_b: "こ",
    option_c: "そ",
    option_d: "か",
    correct_option: "B" as Option
  },
  {
    question_text: "Huruf berikut dibaca apa? → さ",
    option_a: "se",
    option_b: "sa",
    option_c: "shi",
    option_d: "su",
    correct_option: "B" as Option
  },
  {
    question_text: "Yang manakah huruf \"shi\"?",
    option_a: "し",
    option_b: "せ",
    option_c: "く",
    option_d: "す",
    correct_option: "A" as Option
  },
  {
    question_text: "Huruf す dibaca …",
    option_a: "su",
    option_b: "shi",
    option_c: "sa",
    option_d: "so",
    correct_option: "A" as Option
  },
  {
    question_text: "Yang manakah huruf \"se\"?",
    option_a: "け",
    option_b: "せ",
    option_c: "そ",
    option_d: "さ",
    correct_option: "B" as Option
  },
  {
    question_text: "Huruf berikut dibaca apa? → そ",
    option_a: "so",
    option_b: "se",
    option_c: "su",
    option_d: "sa",
    correct_option: "A" as Option
  },
  {
    question_text: "Huruf manakah yang berbunyi \"ke\"?",
    option_a: "け",
    option_b: "せ",
    option_c: "き",
    option_d: "こ",
    correct_option: "A" as Option
  },
  {
    question_text: "Huruf berikut dibaca apa? → か",
    option_a: "ka",
    option_b: "ko",
    option_c: "sa",
    option_d: "ki",
    correct_option: "A" as Option
  },
  {
    question_text: "Yang manakah huruf \"su\"?",
    option_a: "し",
    option_b: "す",
    option_c: "そ",
    option_d: "せ",
    correct_option: "B" as Option
  },
  {
    question_text: "Huruf し dibaca …",
    option_a: "shi",
    option_b: "sa",
    option_c: "se",
    option_d: "su",
    correct_option: "A" as Option
  },
  {
    question_text: "Yang manakah huruf \"so\"?",
    option_a: "せ",
    option_b: "そ",
    option_c: "す",
    option_d: "さ",
    correct_option: "B" as Option
  }
];

const particleQuestions = [
  {
    question_text: "Apa fungsi partikel の?",
    option_a: "Menunjukkan kalimat tanya",
    option_b: "Menunjukkan kepemilikan",
    option_c: "Menunjukkan topik kalimat",
    option_d: "Menunjukkan objek",
    correct_option: "B" as Option
  },
  {
    question_text: "Manakah contoh kalimat yang benar menggunakan partikel は dan の?",
    option_a: "これはわたしはいぬです。",
    option_b: "これはわたしのいぬです。",
    option_c: "わたしのはこれいぬです。",
    option_d: "これのわたしはいぬです。",
    correct_option: "B" as Option
  },
  {
    question_text: "Dalam perumpamaan bahasa Indonesia, partikel は berfungsi seperti …",
    option_a: "adalah",
    option_b: "punya",
    option_c: "apakah",
    option_d: "dari",
    correct_option: "A" as Option
  },
  {
    question_text: "Apa fungsi partikel か?",
    option_a: "Menunjukkan kepemilikan",
    option_b: "Menunjukkan kalimat tanya",
    option_c: "Menunjukkan topik kalimat",
    option_d: "Menunjukkan objek",
    correct_option: "B" as Option
  },
  {
    question_text: "Apa perbedaan partikel の dan か?",
    option_a: "の = tanya, か = kepemilikan",
    option_b: "の = kepemilikan, か = tanya",
    option_c: "の = topik, か = objek",
    option_d: "の = objek, か = topik",
    correct_option: "B" as Option
  },
  {
    question_text: "かのじょ___にほんじんです。 (Kanojo ___ nihonjin desu./ Dia adalah orang Jepang.)",
    option_a: "の",
    option_b: "か",
    option_c: "は",
    option_d: "も",
    correct_option: "C" as Option
  },
  {
    question_text: "これ は あに___かばんです。 (Kore wa ani ___ kaban desu./ Tas ini milik kakak laki-laki saya.)",
    option_a: "の",
    option_b: "は",
    option_c: "か",
    option_d: "も",
    correct_option: "A" as Option
  },
  {
    question_text: "あの ひと は いしゃです___。 (Ano hito wa isha desu___?/ Apakah dia seorang dokter?)",
    option_a: "は",
    option_b: "か",
    option_c: "の",
    option_d: "よ",
    correct_option: "B" as Option
  },
  {
    question_text: "にほんご___べんきょう します。 (Nihongo ___ benkyou shimasu./ Saya sedang belajar bahasa Jepang.)",
    option_a: "の",
    option_b: "は",
    option_c: "か",
    option_d: "を",
    correct_option: "B" as Option
  },
  {
    question_text: "この はな___いろ は きれいです。 (Kono hana ___ iro wa kirei desu./ Bunga ini memiliki warna yang indah.)",
    option_a: "の",
    option_b: "か",
    option_c: "は",
    option_d: "も",
    correct_option: "A" as Option
  },
  {
    question_text: "わたし___がくせいです。 (Watashi ___ gakusei desu./ Saya adalah seorang murid.)",
    option_a: "の",
    option_b: "か",
    option_c: "は",
    option_d: "も",
    correct_option: "C" as Option
  },
  {
    question_text: "これはせんせい___ほんです。 (Kore wa sensei ___ hon desu./ Ini adalah buku milik guru.)",
    option_a: "の",
    option_b: "は",
    option_c: "か",
    option_d: "も",
    correct_option: "A" as Option
  },
  {
    question_text: "あなた は がくせいです___。 (Anata wa gakusei desu___?/ Apakah kamu seorang murid?)",
    option_a: "の",
    option_b: "か",
    option_c: "は",
    option_d: "よ",
    correct_option: "B" as Option
  },
  {
    question_text: "このねこ___いろ は しろいです。 (Kono neko ___ iro wa shiroi desu./ Warna kucing ini putih.)",
    option_a: "は",
    option_b: "か",
    option_c: "の",
    option_d: "も",
    correct_option: "C" as Option
  },
  {
    question_text: "たなかさん___せんせいです。 (Tanaka-san ___ sensei desu./ Tanaka adalah seorang guru.)",
    option_a: "の",
    option_b: "は",
    option_c: "か",
    option_d: "も",
    correct_option: "B" as Option
  }
];

const bunkaQuestions = [
  {
    question_text: "Kimono adalah pakaian tradisional Jepang. Kimono biasanya dikenakan pada…",
    option_a: "Acara resmi dan festival",
    option_b: "Sekolah setiap hari",
    option_c: "Saat berolahraga",
    option_d: "Saat bekerja di kantor",
    correct_option: "A" as Option
  },
  {
    question_text: "Karuta adalah permainan tradisional Jepang menggunakan…",
    option_a: "Kertas origami",
    option_b: "Kartu",
    option_c: "Batu kecil",
    option_d: "Boneka",
    correct_option: "B" as Option
  },
  {
    question_text: "Dalam permainan Karuta, pemain harus…",
    option_a: "Menyusun kartu sesuai warna",
    option_b: "Menangkap kartu yang sesuai bacaan",
    option_c: "Membalik kartu satu per satu",
    option_d: "Menggambar kartu sendiri",
    correct_option: "B" as Option
  },
  {
    question_text: "Kue Jepang berbentuk bulat seperti bola kecil, terbuat dari tepung beras adalah...",
    option_a: "Dango",
    option_b: "Taiyaki",
    option_c: "Yakitori",
    option_d: "Donburi",
    correct_option: "A" as Option
  },
  {
    question_text: "Apa arti kata \"Bunka\" (文化) dalam bahasa Jepang?",
    option_a: "Pendidikan",
    option_b: "Kebudayaan",
    option_c: "Teknologi",
    option_d: "Tradisi",
    correct_option: "B" as Option
  },
  {
    question_text: "Festival musim panas di Jepang yang identik dengan kembang api disebut…",
    option_a: "Hanami",
    option_b: "Obon",
    option_c: "Hanabi Taikai",
    option_d: "Tanabata",
    correct_option: "C" as Option
  },
  {
    question_text: "Pakaian tradisional Jepang yang sering dipakai pada acara resmi adalah…",
    option_a: "Yukata",
    option_b: "Kimono",
    option_c: "Furisode",
    option_d: "Hakama",
    correct_option: "B" as Option
  },
  {
    question_text: "Bahasa tulisan Jepang yang menggunakan karakter Tiongkok disebut…",
    option_a: "Hiragana",
    option_b: "Katakana",
    option_c: "Kanji",
    option_d: "Romaji",
    correct_option: "C" as Option
  },
  {
    question_text: "Festival melihat bunga sakura mekar disebut…",
    option_a: "Hanami",
    option_b: "Hanabi",
    option_c: "Tanabata",
    option_d: "Sumo",
    correct_option: "A" as Option
  },
  {
    question_text: "Dalam budaya Jepang terdapat berbagai cara membungkuk. Cara membungkuk yang digunakan untuk menyampaikan permintaan maaf disebut…",
    option_a: "Samurai",
    option_b: "Kimono",
    option_c: "Saikeirei",
    option_d: "Sakura",
    correct_option: "C" as Option
  },
  {
    question_text: "Minuman tradisional Jepang yang terkenal adalah…",
    option_a: "Teh Hijau",
    option_b: "Susu Soda",
    option_c: "Kopi Instan",
    option_d: "Jus Jeruk",
    correct_option: "A" as Option
  },
  {
    question_text: "Shodou adalah seni tradisional Jepang dalam…",
    option_a: "Menulis kaligrafi dengan kuas",
    option_b: "Menggambar dengan tinta",
    option_c: "Melipat kain",
    option_d: "Menyusun mozaik",
    correct_option: "A" as Option
  },
  {
    question_text: "Kue Jepang berbentuk ikan dan biasanya berisi pasta kacang merah disebut…",
    option_a: "Taiyaki",
    option_b: "Sushi",
    option_c: "Onigiri",
    option_d: "Mochi",
    correct_option: "A" as Option
  },
  {
    question_text: "Sushi adalah makanan Jepang yang berbahan dasar…",
    option_a: "Roti dan selai",
    option_b: "Nasi dan lauk",
    option_c: "Kue beras",
    option_d: "Sup miso",
    correct_option: "B" as Option
  },
  {
    question_text: "Seni melipat kertas tradisional Jepang (折り紙) untuk membentuk objek hewan, bunga, atau bentuk geometris disebut..",
    option_a: "Sadou",
    option_b: "Matsuri",
    option_c: "Monogatari",
    option_d: "Origami",
    correct_option: "D" as Option
  }
];

async function main() {
  console.log('🌱 Start seeding...');

  // First, create or find the exams
  const gengoExam = await prisma.exam.upsert({
    where: { exam_code: 'GNG-2025-001' },
    update: {},
    create: {
      name: 'JC Gengo exam 1',
      exam_code: 'GNG-2025-001',
      category: 'Gengo',
      duration: 60,
      is_active: true,
    },
  });

  const bunkaExam = await prisma.exam.upsert({
    where: { exam_code: 'BNK-2025-001' },
    update: {},
    create: {
      name: 'JC Bunka exam 1', 
      exam_code: 'BNK-2025-001',
      category: 'Bunka',
      duration: 60,
      is_active: true,
    },
  });

  console.log(`✅ Created/found exams: ${gengoExam.name} and ${bunkaExam.name}`);

  // Create questions and associate them with both exams
  for (const questionData of questions) {
    const question = await prisma.question.create({
      data: {
        question_text: questionData.question_text,
        option_a: questionData.option_a,
        option_b: questionData.option_b,
        option_c: questionData.option_c,
        option_d: questionData.option_d,
        correct_option: questionData.correct_option,
        exam_questions: {
          create: [
            { exam_id: gengoExam.id },
            { exam_id: bunkaExam.id }
          ]
        }
      }
    });

    console.log(`✅ Created question: ${question.question_text.substring(0, 50)}...`);
  }

  // Create particle questions only for Gengo exam (GNG-2025-001)
  for (const questionData of particleQuestions) {
    const question = await prisma.question.create({
      data: {
        question_text: questionData.question_text,
        option_a: questionData.option_a,
        option_b: questionData.option_b,
        option_c: questionData.option_c,
        option_d: questionData.option_d,
        correct_option: questionData.correct_option,
        exam_questions: {
          create: [
            { exam_id: gengoExam.id }
          ]
        }
      }
    });

    console.log(`✅ Created particle question: ${question.question_text.substring(0, 50)}...`);
  }

  // Create Bunka questions only for Bunka exam (BNK-2025-001)
  for (const questionData of bunkaQuestions) {
    const question = await prisma.question.create({
      data: {
        question_text: questionData.question_text,
        option_a: questionData.option_a,
        option_b: questionData.option_b,
        option_c: questionData.option_c,
        option_d: questionData.option_d,
        correct_option: questionData.correct_option,
        exam_questions: {
          create: [
            { exam_id: bunkaExam.id }
          ]
        }
      }
    });

    console.log(`✅ Created Bunka question: ${question.question_text.substring(0, 50)}...`);
  }

  console.log(`🌱 Seeding finished. Created ${questions.length} questions for both exams, ${particleQuestions.length} particle questions for Gengo exam only, and ${bunkaQuestions.length} Bunka questions for Bunka exam only.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
