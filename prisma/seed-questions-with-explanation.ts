import { PrismaClient, Category, Option } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQuestionsWithExplanation() {
  console.log('🌱 Seeding questions with explanations...');

  try {
    // Get existing exams
    const gengoExam = await prisma.exam.findFirst({
      where: { category: Category.Gengo }
    });

    const bunkaExam = await prisma.exam.findFirst({
      where: { category: Category.Bunka }
    });

    if (!gengoExam || !bunkaExam) {
      console.log('❌ No exams found. Please seed exams first.');
      return;
    }

    // Sample questions with explanations for Gengo (Language)
    const gengoQuestions = [
      {
        question_text: "「おはよう」の意味は何ですか？",
        option_a: "Good morning",
        option_b: "Good afternoon", 
        option_c: "Good evening",
        option_d: "Good night",
        correct_option: Option.A,
        explanation: "「おはよう」は朝の挨拶で、英語の「Good morning」に相当します。朝（通常午前10時頃まで）に使用される挨拶です。"
      },
      {
        question_text: "「ありがとうございます」を使うのはいつですか？",
        option_a: "謝るとき",
        option_b: "感謝するとき",
        option_c: "別れるとき", 
        option_d: "会うとき",
        correct_option: Option.B,
        explanation: "「ありがとうございます」は感謝の気持ちを表現する丁寧な表現です。何かをしてもらったときや、親切にしてもらったときに使います。"
      },
      {
        question_text: "「すみません」の使い方として正しいものはどれですか？",
        option_a: "謝罪のみ",
        option_b: "感謝のみ",
        option_c: "謝罪と注意を引くとき",
        option_d: "挨拶のみ",
        correct_option: Option.C,
        explanation: "「すみません」は謝罪だけでなく、人の注意を引くときにも使用されます。例：道を聞くときや、店員さんを呼ぶときなど。"
      }
    ];

    // Sample questions with explanations for Bunka (Culture)
    const bunkaQuestions = [
      {
        question_text: "日本の伝統的な新年の料理は何ですか？",
        option_a: "寿司",
        option_b: "おせち料理",
        option_c: "ラーメン",
        option_d: "天ぷら",
        correct_option: Option.B,
        explanation: "おせち料理は日本の新年に食べる伝統的な料理です。各料理には縁起の良い意味が込められており、正月三が日に食べられます。"
      },
      {
        question_text: "日本の桜の季節はいつですか？",
        option_a: "冬",
        option_b: "夏",
        option_c: "春",
        option_d: "秋",
        correct_option: Option.C,
        explanation: "桜は春（3月下旬〜5月上旬）に咲きます。この時期に花見（お花見）という、桜を鑑賞しながら飲食を楽しむ文化があります。"
      },
      {
        question_text: "日本の伝統的な着物の帯を結ぶ位置は？",
        option_a: "前",
        option_b: "後ろ",
        option_c: "横",
        option_d: "どこでも良い",
        correct_option: Option.B,
        explanation: "着物の帯は後ろで結ぶのが正式です。これは美しいシルエットを作るとともに、日本の美的感覚に基づいた伝統的な着方です。"
      }
    ];

    // Insert Gengo questions
    for (const questionData of gengoQuestions) {
      const question = await prisma.question.create({
        data: questionData
      });

      // Link to Gengo exam
      await prisma.examQuestion.create({
        data: {
          exam_id: gengoExam.id,
          question_id: question.id
        }
      });

      console.log(`✅ Created Gengo question: ${questionData.question_text.substring(0, 30)}...`);
    }

    // Insert Bunka questions
    for (const questionData of bunkaQuestions) {
      const question = await prisma.question.create({
        data: questionData
      });

      // Link to Bunka exam
      await prisma.examQuestion.create({
        data: {
          exam_id: bunkaExam.id,
          question_id: question.id
        }
      });

      console.log(`✅ Created Bunka question: ${questionData.question_text.substring(0, 30)}...`);
    }

    console.log(`🎉 Successfully seeded ${gengoQuestions.length + bunkaQuestions.length} questions with explanations!`);

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestionsWithExplanation();
