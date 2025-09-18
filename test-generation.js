// Quick test of AI generation to verify JSON parsing works
const fs = require('fs');

async function testGeneration() {
    console.log('Testing AI generation with fixed JSON parsing...');
    
    const testUrl = 'http://localhost:3000/api/code-problems/generate';
    const testPayload = {
        category: 'dsa',
        topic: 'arrays-hashing',
        subtopic: 'two-pointers',
        difficulty: 'Medium'
    };
    
    try {
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        const result = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.problem) {
            console.log('\n✅ SUCCESS: AI generation working!');
            console.log('Problem title:', result.problem.title);
            console.log('Has function templates:', !!result.problem.functionTemplates);
            
            if (result.problem.functionTemplates) {
                console.log('Languages:', Object.keys(result.problem.functionTemplates));
            }
        } else {
            console.log('\n❌ FAILED: No problem generated');
            if (result.error) {
                console.log('Error:', result.error);
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Only run if called directly
if (require.main === module) {
    testGeneration();
}

module.exports = { testGeneration };