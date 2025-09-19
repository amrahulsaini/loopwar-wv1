// Test wrapper system with a simple function
const testCode = `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`;

async function testWrapper() {
    console.log('Testing wrapper system...');
    
    const testUrl = 'http://localhost:3000/api/code/execute';
    const testPayload = {
        code: testCode,
        language: 'javascript',
        testCases: [
            {
                input: '[2,7,11,15], 9',
                expected: '[0,1]'
            }
        ]
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
        
        if (result.success) {
            console.log('\n✅ SUCCESS: Wrapper system working!');
        } else {
            console.log('\n❌ FAILED: Wrapper system not working');
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
    testWrapper();
}

module.exports = { testWrapper };