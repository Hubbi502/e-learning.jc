import { PrismaClient, Category, Option } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateExamCode } from '../src/utils/examCodeGenerator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
     email: 'admin@gmail.com',
      password_hash: hashedPassword,
    },
  });

  console.log('👤 Created admin user:', adminUser.email);

  // Delete existing questions and question_categories
  await prisma.questionCategory.deleteMany();
  await prisma.question.deleteMany();

  // Create sample questions with multiple categories
  const questionsData = [
    {
      question_text: "What does 'arigatou gozaimasu' mean?",
      option_a: "Good morning",
      option_b: "Thank you very much", 
      option_c: "Good evening",
      option_d: "You're welcome",
      correct_option: Option.B,
      categories: [Category.Gengo]
    },
    {
      question_text: "Which hiragana character represents 'ka'?",
      option_a: "か",
      option_b: "き",
      option_c: "く", 
      option_d: "け",
      correct_option: Option.A,
      categories: [Category.Gengo]
    },
    {
      question_text: "What is the traditional Japanese art of flower arrangement called?",
      option_a: "Origami",
      option_b: "Ikebana",
      option_c: "Calligraphy",
      option_d: "Tea ceremony", 
      correct_option: Option.B,
      categories: [Category.Bunka]
    },
    {
      question_text: "Which festival is known as the Cherry Blossom Festival?",
      option_a: "Tanabata",
      option_b: "Obon",
      option_c: "Hanami",
      option_d: "Shichi-Go-San",
      correct_option: Option.C,
      categories: [Category.Bunka]
    },
    {
      question_text: "What is the Japanese word for 'student'?",
      option_a: "Sensei",
      option_b: "Gakusei", 
      option_c: "Tomodachi",
      option_d: "Kazoku",
      correct_option: Option.B,
      categories: [Category.Gengo]
    },
    {
      question_text: "What does 'sakura' mean and when is it typically celebrated?",
      option_a: "Snow, in winter",
      option_b: "Cherry blossom, in spring",
      option_c: "Autumn leaves, in fall", 
      option_d: "Summer festival, in summer",
      correct_option: Option.B,
      categories: [Category.Gengo, Category.Bunka] // This question belongs to both categories
    },
    {
      question_text: "What is 'omotenashi' and how is it expressed in Japanese culture?",
      option_a: "A type of food served at festivals",
      option_b: "A martial art technique",
      option_c: "Hospitality; selfless service with a pure heart",
      option_d: "A traditional dance form",
      correct_option: Option.C,
      categories: [Category.Gengo, Category.Bunka] // This question also belongs to both
    }
  ];

  // Create questions and their categories
  for (const questionData of questionsData) {
    const { categories, ...questionInfo } = questionData;
    
    const question = await prisma.question.create({
      data: questionInfo
    });
    
    // Create question categories
    await prisma.questionCategory.createMany({
      data: categories.map(category => ({
        question_id: question.id,
        category
      }))
    });
    
    console.log(`📝 Created question: "${question.question_text}" with categories: ${categories.join(', ')}`);
  }

  // Create sample exams
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Delete existing exams
  await prisma.exam.deleteMany();

  // Create exams with generated codes
  const gengoExamCode = await generateExamCode(Category.Gengo);
  const bunkaExamCode = await generateExamCode(Category.Bunka);

  await prisma.exam.createMany({
    data: [
      {
        exam_code: gengoExamCode,
        category: Category.Gengo,
        duration: 60,
        start_time: now,
        end_time: tomorrow,
        is_active: true
      },
      {
        exam_code: bunkaExamCode,
        category: Category.Bunka,
        duration: 45,
        start_time: tomorrow,
        end_time: nextWeek,
        is_active: false
      }
    ]
  });

  // Create sample students
  await prisma.student.createMany({
    data: [
      {
        name: "Tanaka Hiroshi",
        class: "XII IPA 1",
        exam_code: "JP2025001",
        category: Category.Gengo,
        is_submitted: true
      },
      {
        name: "Sato Yuki",
        class: "XII IPS 2",
        exam_code: "JP2025002",
        category: Category.Bunka,
        is_submitted: true
      },
      {
        name: "Watanabe Akira",
        class: "XII IPA 3",
        exam_code: "JP2025003",
        category: Category.Gengo,
        is_submitted: false
      }
    ]
  });

  // Get created data for scores
  const createdExams = await prisma.exam.findMany();
  const createdStudents = await prisma.student.findMany();

  // Create sample scores
  if (createdExams.length > 0 && createdStudents.length > 0) {
    await prisma.score.createMany({
      data: [
        {
          student_id: createdStudents[0].id,
          exam_id: createdExams[0].id,
          score: 8,
          total_questions: 10,
          percentage: 80.00,
          is_published: true
        },
        {
          student_id: createdStudents[1].id,
          exam_id: createdExams[1].id,
          score: 9,
          total_questions: 10,
          percentage: 90.00,
          is_published: true
        }
      ]
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
