// Test script to verify AI chat functionality
// Run this with: node test-ai-chat.js

const testAIChat = async () => {
  console.log('🤖 Testing LOOPAI Chat System...\n');

  const testData = {
    message: "Hello LOOPAI! Can you explain what arrays are?",
    category: "data-structures",
    topic: "arrays",
    subtopic: "introduction",
    sortOrder: "1"
  };

  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ AI Chat API is working!');
      console.log('📝 AI Response:');
      console.log(data.response);
    } else {
      console.log('❌ API Error:', data.error);
      console.log('Status:', response.status);
    }

  } catch (error) {
    console.log('🔌 Connection Error:', error.message);
    console.log('\n💡 Make sure your development server is running with: npm run dev');
  }
};

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testAIChat;
} else if (typeof window !== 'undefined') {
  window.testAIChat = testAIChat;
}

// Run if called directly
if (require.main === module) {
  testAIChat();
}
