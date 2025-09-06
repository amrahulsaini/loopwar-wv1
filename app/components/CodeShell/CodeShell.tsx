import React, { useState, useEffect } from 'react';
import styles from './CodeShell.module.css';

interface CodeShellProps {
  language: string;
  problemTitle: string;
  problemDescription: string;
  conversationContext?: string; // Latest AI response for context
  currentQuestion?: string; // Current coding question being asked
  onSubmitCode: (code: string) => void;
  onClose: () => void;
}

const CodeShell: React.FC<CodeShellProps> = ({
  language,
  problemTitle,
  problemDescription,
  conversationContext,
  currentQuestion,
  onSubmitCode,
  onClose
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize code with template
  useEffect(() => {
    if (!code) {
      setCode(getLanguageTemplate());
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsSubmitting(true);
    await onSubmitCode(code);
    setIsSubmitting(false);
  };

  const getLanguageTemplate = () => {
    // Extract specific coding requirements from conversation context
    const context = conversationContext || '';
    const question = currentQuestion || '';
    
    // Check if it's about array update function
    const isArrayUpdate = context.includes('updateArray') || question.includes('updateArray') || 
                         context.includes('Update Element') || question.includes('Update Element');
    
    // Check if it's about specific array operations
    const isArrayAccess = context.includes('Access Element') || question.includes('Access Element');
    const isArrayInit = context.includes('Initialize') || question.includes('Initialize');
    
    // Extract function signature if mentioned
    const functionMatch = context.match(/(\w+)\s*\([^)]*\)/);
    const functionName = functionMatch ? functionMatch[1] : '';
    
    switch (language.toLowerCase()) {
      case 'cpp':
      case 'c++':
        if (isArrayUpdate) {
          return `#include <iostream>
using namespace std;

// ${currentQuestion || problemDescription}
void updateArray(int arr[], int size, int index, int newValue) {
    // TODO: Check if index is valid (within bounds)
    // Hint: index should be >= 0 and < size
    
    // TODO: Update the element at the given index
    // Your code here
    
}

int main() {
    // Test your function
    int arr[] = {1, 2, 3, 4, 5};
    int size = 5;
    
    cout << "Original array: ";
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    // Test updating element at index 2 to value 10
    updateArray(arr, size, 2, 10);
    
    cout << "Updated array: ";
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    return 0;
}`;
        } else if (isArrayAccess) {
          return `#include <iostream>
using namespace std;

// ${currentQuestion || problemDescription}
int accessElement(int arr[], int size, int index) {
    // TODO: Check if index is valid
    // TODO: Return the element at the given index
    // Your code here
    
    return -1; // placeholder
}

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int size = 5;
    
    // Test accessing different elements
    cout << "Element at index 2: " << accessElement(arr, size, 2) << endl;
    
    return 0;
}`;
        } else if (isArrayInit) {
          return `#include <iostream>
using namespace std;

// ${currentQuestion || problemDescription}
int* initializeArray(int size) {
    // TODO: Create array of given size
    // TODO: Initialize all elements to 0
    // Your code here
    
    return nullptr; // placeholder
}

int main() {
    int size = 5;
    int* arr = initializeArray(size);
    
    // Print the initialized array
    if (arr != nullptr) {
        for (int i = 0; i < size; i++) {
            cout << arr[i] << " ";
        }
        cout << endl;
        delete[] arr; // Don't forget to free memory
    }
    
    return 0;
}`;
        } else {
          return `#include <iostream>
using namespace std;

// ${currentQuestion || problemDescription}
${functionName ? `// Function: ${functionName}` : '// Write your solution here'}

int main() {
    // Test your solution here
    
    return 0;
}`;
        }
        
      case 'java':
        if (isArrayUpdate) {
          return `public class Solution {
    // ${currentQuestion || problemDescription}
    public static void updateArray(int[] arr, int index, int newValue) {
        // TODO: Check if index is valid (within bounds)
        // Hint: index should be >= 0 and < arr.length
        
        // TODO: Update the element at the given index
        // Your code here
        
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        
        System.out.print("Original array: ");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
        
        // Test updating element at index 2 to value 10
        updateArray(arr, 2, 10);
        
        System.out.print("Updated array: ");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}`;
        } else {
          return `public class Solution {
    // ${currentQuestion || problemDescription}
    ${functionName ? `// Function: ${functionName}` : '// Write your solution here'}
    
    public static void main(String[] args) {
        // Test your solution here
        
    }
}`;
        }
        
      case 'python':
        if (isArrayUpdate) {
          return `# ${currentQuestion || problemDescription}
def update_array(arr, index, new_value):
    """
    TODO: Check if index is valid (within bounds)
    Hint: index should be >= 0 and < len(arr)
    
    TODO: Update the element at the given index
    Your code here
    """
    pass

# Test your function
arr = [1, 2, 3, 4, 5]

print("Original array:", arr)

# Test updating element at index 2 to value 10
update_array(arr, 2, 10)

print("Updated array:", arr)`;
        } else {
          return `# ${currentQuestion || problemDescription}
${functionName ? `# Function: ${functionName}` : '# Write your solution here'}

def solve():
    # Your code here
    pass

# Test your solution
solve()`;
        }
        
      default:
        return `// ${currentQuestion || problemDescription}
// Write your ${language} code here

`;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.codeShell}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3>Code Shell - {language.toUpperCase()}</h3>
            <p className={styles.problemTitle}>{problemTitle}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.problemDescription}>
          <p><strong>Problem:</strong> {problemTitle}</p>
          {currentQuestion && (
            <p><strong>Current Task:</strong> {currentQuestion}</p>
          )}
          <p>{problemDescription}</p>
        </div>
        
        <div className={styles.codeEditor}>
          <textarea
            value={code}
            onChange={handleCodeChange}
            placeholder={`Write your ${language} code here...`}
            className={styles.codeTextarea}
            spellCheck={false}
          />
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Reviewing...' : 'Submit for Review'}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeShell;
