// Additional problems for the challengers page
export const ADDITIONAL_PROBLEMS = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy' as 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹', 
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    testCases: [
      {
        input: JSON.stringify({ nums: [2,7,11,15], target: 9 }),
        expected: '[0,1]'
      },
      {
        input: JSON.stringify({ nums: [3,2,4], target: 6 }),
        expected: '[1,2]'
      },
      {
        input: JSON.stringify({ nums: [3,3], target: 6 }),
        expected: '[0,1]'
      }
    ]
  },

  'longest-substring': {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium' as 'Medium',
    description: `Given a string s, find the length of the longest substring without repeating characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    constraints: [
      '0 ≤ s.length ≤ 5 * 10⁴',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    testCases: [
      {
        input: JSON.stringify({ s: "abcabcbb" }),
        expected: '3'
      },
      {
        input: JSON.stringify({ s: "bbbbb" }),
        expected: '1'
      },
      {
        input: JSON.stringify({ s: "pwwkew" }),
        expected: '3'
      }
    ]
  }
};

export const PROBLEM_LANGUAGES = {
  'k-diverse-partition': {
    python: {
      name: 'Python 3',
      icon: '🐍',
      starterCode: `def k_diverse_partition(arr, k):
    """
    Find minimum number of partitions where each partition has at most k distinct elements.
    
    Args:
        arr: List of integers
        k: Maximum distinct elements allowed per partition
        
    Returns:
        int: Minimum number of partitions needed
    """
    # Your solution here
    if not arr or k <= 0:
        return 0
    
    partitions = 0
    distinct_count = set()
    
    for num in arr:
        # If adding this number would exceed k distinct elements
        if num not in distinct_count and len(distinct_count) >= k:
            # Start a new partition
            partitions += 1
            distinct_count = {num}
        else:
            # Add to current partition
            distinct_count.add(num)
    
    # Don't forget the last partition if we have elements
    if distinct_count:
        partitions += 1
    
    return partitions

# Test runner - DO NOT MODIFY
import json
import sys
data = json.loads(sys.stdin.read().strip())
result = k_diverse_partition(data['arr'], data['k'])
print(result)`
    },
    javascript: {
      name: 'JavaScript (Node.js)',
      icon: '🟨',
      starterCode: `function kDiversePartition(arr, k) {
    // Your solution here
    if (!arr || arr.length === 0 || k <= 0) {
        return 0;
    }
    
    let partitions = 0;
    let distinctSet = new Set();
    
    for (let num of arr) {
        if (!distinctSet.has(num) && distinctSet.size >= k) {
            partitions++;
            distinctSet = new Set([num]);
        } else {
            distinctSet.add(num);
        }
    }
    
    if (distinctSet.size > 0) {
        partitions++;
    }
    
    return partitions;
}

// Test runner
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const data = JSON.parse(input);
const result = kDiversePartition(data.arr, data.k);
console.log(result);`
    }
  },
  
  'two-sum': {
    python: {
      name: 'Python 3',
      icon: '🐍',
      starterCode: `def two_sum(nums, target):
    """
    Find two numbers that add up to target and return their indices.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List[int]: Indices of the two numbers
    """
    # Your solution here
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    
    return []

# Test runner - DO NOT MODIFY
import json
import sys
data = json.loads(sys.stdin.read().strip())
result = two_sum(data['nums'], data['target'])
print(json.dumps(result))`
    },
    javascript: {
      name: 'JavaScript (Node.js)',
      icon: '🟨',
      starterCode: `function twoSum(nums, target) {
    // Your solution here
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    
    return [];
}

// Test runner
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const data = JSON.parse(input);
const result = twoSum(data.nums, data.target);
console.log(JSON.stringify(result));`
    }
  },

  'longest-substring': {
    python: {
      name: 'Python 3',
      icon: '🐍',
      starterCode: `def length_of_longest_substring(s):
    """
    Find the length of the longest substring without repeating characters.
    
    Args:
        s: Input string
        
    Returns:
        int: Length of the longest substring
    """
    # Your solution here
    char_map = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_map and char_map[s[right]] >= left:
            left = char_map[s[right]] + 1
        
        char_map[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Test runner - DO NOT MODIFY
import json
import sys
data = json.loads(sys.stdin.read().strip())
result = length_of_longest_substring(data['s'])
print(result)`
    },
    javascript: {
      name: 'JavaScript (Node.js)', 
      icon: '🟨',
      starterCode: `function lengthOfLongestSubstring(s) {
    // Your solution here
    const charMap = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charMap.has(s[right]) && charMap.get(s[right]) >= left) {
            left = charMap.get(s[right]) + 1;
        }
        
        charMap.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Test runner
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const data = JSON.parse(input);
const result = lengthOfLongestSubstring(data.s);
console.log(result);`
    }
  }
};
