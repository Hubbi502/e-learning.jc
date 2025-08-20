"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const examCodeGenerator_1 = require("../src/utils/examCodeGenerator");
const prisma = new client_1.PrismaClient();
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
    // Delete existing data in correct order
    await prisma.answer.deleteMany();
    await prisma.score.deleteMany();
    await prisma.student.deleteMany();
    await prisma.question.deleteMany();
    await prisma.exam.deleteMany();
    // Create sample exams
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Create exams with generated codes
    const gengoExamCode = await (0, examCodeGenerator_1.generateExamCode)(client_1.Category.Gengo);
    const bunkaExamCode = await (0, examCodeGenerator_1.generateExamCode)(client_1.Category.Bunka);
    const gengoExam = await prisma.exam.create({
        data: {
            name: "Japanese Language Proficiency Test",
            exam_code: gengoExamCode,
            category: client_1.Category.Gengo,
            duration: 60,
            start_time: now,
            end_time: tomorrow,
            is_active: true
        }
    });
    const bunkaExam = await prisma.exam.create({
        data: {
            name: "Japanese Culture Assessment",
            exam_code: bunkaExamCode,
            category: client_1.Category.Bunka,
            duration: 45,
            start_time: tomorrow,
            end_time: nextWeek,
            is_active: false
        }
    });
    console.log(`📝 Created exams: ${gengoExam.name} (${gengoExam.exam_code}) and ${bunkaExam.name} (${bunkaExam.exam_code})`);
    // Create sample questions for Gengo exam
    const gengoQuestions = [
        {
            question_text: "What does 'arigatou gozaimasu' mean?",
            option_a: "Good morning",
            option_b: "Thank you very much",
            option_c: "Good evening",
            option_d: "You're welcome",
            correct_option: client_1.Option.B,
            exam_id: gengoExam.id
        },
        {
            question_text: "Which hiragana character represents 'ka'?",
            option_a: "か",
            option_b: "き",
            option_c: "く",
            option_d: "け",
            correct_option: client_1.Option.A,
            exam_id: gengoExam.id
        },
        {
            question_text: "What is the Japanese word for 'student'?",
            option_a: "Sensei",
            option_b: "Gakusei",
            option_c: "Tomodachi",
            option_d: "Kazoku",
            correct_option: client_1.Option.B,
            exam_id: gengoExam.id
        },
        {
            question_text: "What does 'sakura' mean?",
            option_a: "Snow",
            option_b: "Cherry blossom",
            option_c: "Autumn leaves",
            option_d: "Summer festival",
            correct_option: client_1.Option.B,
            exam_id: gengoExam.id
        }
    ];
    // Create sample questions for Bunka exam
    const bunkaQuestions = [
        {
            question_text: "What is the traditional Japanese art of flower arrangement called?",
            option_a: "Origami",
            option_b: "Ikebana",
            option_c: "Calligraphy",
            option_d: "Tea ceremony",
            correct_option: client_1.Option.B,
            exam_id: bunkaExam.id
        },
        {
            question_text: "Which festival is known as the Cherry Blossom Festival?",
            option_a: "Tanabata",
            option_b: "Obon",
            option_c: "Hanami",
            option_d: "Shichi-Go-San",
            correct_option: client_1.Option.C,
            exam_id: bunkaExam.id
        },
        {
            question_text: "What is 'omotenashi'?",
            option_a: "A type of food served at festivals",
            option_b: "A martial art technique",
            option_c: "Hospitality; selfless service with a pure heart",
            option_d: "A traditional dance form",
            correct_option: client_1.Option.C,
            exam_id: bunkaExam.id
        },
        {
            question_text: "What is the traditional Japanese tea ceremony called?",
            option_a: "Sado or Chado",
            option_b: "Ikebana",
            option_c: "Origami",
            option_d: "Kabuki",
            correct_option: client_1.Option.A,
            exam_id: bunkaExam.id
        }
    ];
    // Create all questions
    for (const questionData of [...gengoQuestions, ...bunkaQuestions]) {
        const question = await prisma.question.create({
            data: questionData
        });
        console.log(`📝 Created question: "${question.question_text}" for exam`);
    }
    // Create sample students
    await prisma.student.createMany({
        data: [
            {
                name: "Tanaka Hiroshi",
                class: "12A",
                exam_code: gengoExamCode,
                category: client_1.Category.Gengo,
                violations: 0,
                is_submitted: false
            },
            {
                name: "Sato Yuki",
                class: "12B",
                exam_code: bunkaExamCode,
                category: client_1.Category.Bunka,
                violations: 1,
                is_submitted: true
            },
            {
                name: "Suzuki Kenta",
                class: "12A",
                exam_code: gengoExamCode,
                category: client_1.Category.Gengo,
                violations: 0,
                is_submitted: true
            },
            {
                name: "Yamada Sakura",
                class: "12C",
                exam_code: bunkaExamCode,
                category: client_1.Category.Bunka,
                violations: 2,
                is_submitted: false
            }
        ]
    });
    console.log('👥 Created sample students');
    // Create some sample scores
    const students = await prisma.student.findMany();
    const submittedStudents = students.filter(s => s.is_submitted);
    for (const student of submittedStudents) {
        await prisma.score.create({
            data: {
                student_id: student.id,
                exam_id: student.category === client_1.Category.Gengo ? gengoExam.id : bunkaExam.id,
                score: Math.floor(Math.random() * 50) + 50, // Random score between 50-100
                total_questions: 4,
                percentage: Math.floor(Math.random() * 50) + 50,
                is_published: true
            }
        });
    }
    console.log('📊 Created sample scores');
    console.log('✅ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
