#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 LMS Testing Suite');
console.log('==================\n');

// Test categories
const testCategories = [
  {
    name: 'Utilities',
    pattern: 'src/__tests__/utils/*.test.ts',
    description: 'Testing utility functions like exam code generator'
  },
  {
    name: 'Auth APIs',
    pattern: 'src/__tests__/api/auth.test.ts',
    description: 'Testing authentication endpoints'
  },
  {
    name: 'Exam APIs',
    pattern: 'src/__tests__/api/exams.test.ts',
    description: 'Testing exam management endpoints'
  },
  {
    name: 'Question APIs',
    pattern: 'src/__tests__/api/questions.test.ts',
    description: 'Testing question management endpoints'
  },
  {
    name: 'Student APIs',
    pattern: 'src/__tests__/api/students.test.ts',
    description: 'Testing student management endpoints'
  },
  {
    name: 'Dashboard APIs',
    pattern: 'src/__tests__/api/dashboard.test.ts',
    description: 'Testing dashboard statistics endpoints'
  }
];

function runTests(pattern, name) {
  console.log(`\n📋 Running ${name} tests...`);
  console.log(`Pattern: ${pattern}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(`npx jest ${pattern} --verbose`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${name} tests completed successfully\n`);
  } catch (error) {
    console.log(`❌ ${name} tests failed\n`);
    return false;
  }
  return true;
}

function runAllTests() {
  console.log('🚀 Running all tests...\n');
  
  let passed = 0;
  let total = testCategories.length;
  
  for (const category of testCategories) {
    console.log(`📝 ${category.description}`);
    if (runTests(category.pattern, category.name)) {
      passed++;
    }
  }
  
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your LMS is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  runAllTests();
} else {
  const category = args[0].toLowerCase();
  const found = testCategories.find(cat => 
    cat.name.toLowerCase().includes(category)
  );
  
  if (found) {
    runTests(found.pattern, found.name);
  } else {
    console.log('Available test categories:');
    testCategories.forEach(cat => {
      console.log(`  - ${cat.name.toLowerCase()}: ${cat.description}`);
    });
  }
}
