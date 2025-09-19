// Debug script to test the API endpoints and see the response format
// Run this with: node debug-api-response.js

const testAPI = async () => {
  console.log('🔍 Testing Code Problems API Endpoints...\n');

  // Test the by-location endpoint
  const testCategory = 'dsa';
  const testTopic = 'arrays-hashing';
  const testSubtopic = 'two-pointers';
  const testSortOrder = '1';

  try {
    console.log('1. Testing by-location endpoint...');
    const response = await fetch(`http://localhost:3000/api/code-problems/by-location?category=${testCategory}&topic=${testTopic}&subtopic=${testSubtopic}&sortOrder=${testSortOrder}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ API Response Success!');
      console.log('📊 Response Data:');
      console.log('- ID:', data.id);
      console.log('- Title:', data.title);
      console.log('- Test Cases Count:', data.testCases?.length || 0);
      console.log('- Test Cases:', JSON.stringify(data.testCases, null, 2));
      console.log('- Function Templates Keys:', data.functionTemplates ? Object.keys(data.functionTemplates) : 'None');
      console.log('- Needs Generation:', data.needs_generation);
      console.log('- Is AI Generated:', data.is_ai_generated);
      console.log('- User ID:', data.user_id);
      
      if (data.testCases && data.testCases.length > 0) {
        console.log('\n✅ Test cases found in API response!');
        data.testCases.forEach((tc, idx) => {
          console.log(`  Test Case ${idx + 1}:`);
          console.log(`    Input: ${tc.input}`);
          console.log(`    Expected: ${tc.expected}`);
          console.log(`    Explanation: ${tc.explanation}`);
        });
      } else {
        console.log('\n❌ No test cases found in API response');
        
        if (data.needs_generation) {
          console.log('\n🤖 Triggering AI generation...');
          const generateResponse = await fetch('http://localhost:3000/api/code-problems/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: testCategory,
              topic: testTopic,
              subtopic: testSubtopic,
              sortOrder: parseInt(testSortOrder),
              baseProblem: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty
              }
            }),
          });

          if (generateResponse.ok) {
            const generatedData = await generateResponse.json();
            console.log('🎉 Generated Problem Data:');
            console.log('- ID:', generatedData.id);
            console.log('- Title:', generatedData.title);
            console.log('- Test Cases Count:', generatedData.testCases?.length || 0);
            console.log('- Test Cases:', JSON.stringify(generatedData.testCases, null, 2));
            console.log('- Function Templates Keys:', generatedData.functionTemplates ? Object.keys(generatedData.functionTemplates) : 'None');
          } else {
            const error = await generateResponse.json();
            console.log('❌ Generation failed:', error);
          }
        }
      }
    } else {
      console.log('❌ API Error:', data.error);
      console.log('Status:', response.status);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

// Only run if called directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };