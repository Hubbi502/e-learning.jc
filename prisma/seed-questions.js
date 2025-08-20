const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const questions = [
  {
    question_text: "Yang manakah huruf \"ka\"?",
    option_a: "さ",
    option_b: "か",
    option_c: "こ", 
    option_d: "き",
    correct_option: "B"
  },
  {
    question_text: "Huruf berikut dibaca apa? → き",
    option_a: "ki",
    option_b: "ku",
    option_c: "ka",
    option_d: "ke",
    correct_option: "A"
  },
  {
    question_text: "Yang manakah huruf \"ku\"?",
    option_a: "け",
    option_b: "く",
    option_c: "そ",
    option_d: "こ",
    correct_option: "B"
  },
  {
    question_text: "Huruf け dibaca …",
    option_a: "ka",
    option_b: "ke", 
    option_c: "sa",
    option_d: "ku",
    correct_option: "B"
  },
  {
    question_text: "Yang manakah huruf \"ko\"?",
    option_a: "す",
    option_b: "こ",
    option_c: "そ",
    option_d: "か",
    correct_option: "B"
  },
  {
    question_text: "Huruf berikut dibaca apa? → さ",
    option_a: "se",
    option_b: "sa",
    option_c: "shi",
    option_d: "su",
    correct_option: "B"
  },
  {
    question_text: "Yang manakah huruf \"shi\"?",
    option_a: "し",
    option_b: "せ",
    option_c: "く",
    option_d: "す",
    correct_option: "A"
  },
  {
    question_text: "Huruf す dibaca …",
    option_a: "su",
    option_b: "shi",
    option_c: "sa",
    option_d: "so",
    correct_option: "A"
  },
  {
    question_text: "Yang manakah huruf \"se\"?",
    option_a: "け",
    option_b: "せ",
    option_c: "そ",
    option_d: "さ",
    correct_option: "B"
  },
  {
    question_text: "Huruf berikut dibaca apa? → そ",
    option_a: "so",
    option_b: "se",
    option_c: "su",
    option_d: "sa",
    correct_option: "A"
  },
  {
    question_text: "Huruf manakah yang berbunyi \"ke\"?",
    option_a: "け",
    option_b: "せ",
    option_c: "き",
    option_d: "こ",
    correct_option: "A"
  },
  {
    question_text: "Huruf berikut dibaca apa? → か",
    option_a: "ka",
    option_b: "ko",
    option_c: "sa",
    option_d: "ki",
    correct_option: "A"
  },
  {
    question_text: "Yang manakah huruf \"su\"?",
    option_a: "し",
    option_b: "す",
    option_c: "そ",
    option_d: "せ",
    correct_option: "B"
  },
  {
    question_text: "Huruf し dibaca …",
    option_a: "shi",
    option_b: "sa",
    option_c: "se",
    option_d: "su",
    correct_option: "A"
  },
  {
    question_text: "Yang manakah huruf \"so\"?",
    option_a: "せ",
    option_b: "そ",
    option_c: "す",
    option_d: "さ",
    correct_option: "B"
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

  console.log(`🌱 Seeding finished. Created ${questions.length} questions for both exams.`);
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
