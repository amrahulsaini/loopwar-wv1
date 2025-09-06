import React, { useState } from 'react';
import styles from './CodeShell.module.css';

interface CodeShellProps {
  language: string;
  problemTitle: string;
  problemDescription: string;
  onSubmitCode: (code: string) => void;
  onClose: () => void;
}

const CodeShell: React.FC<CodeShellProps> = ({
  language,
  problemTitle,
  problemDescription,
  onSubmitCode,
  onClose
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    switch (language.toLowerCase()) {
      case 'cpp':
      case 'c++':
        return `#include <iostream>
using namespace std;

// Write your solution here
void updateArray(int arr[], int size, int index, int newValue) {
    // Your code goes here
    
}

int main() {
    // Test your function here
    int arr[] = {1, 2, 3, 4, 5};
    int size = 5;
    
    updateArray(arr, size, 2, 10);
    
    // Print array to verify
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    return 0;
}`;
      case 'java':
        return `public class Solution {
    // Write your solution here
    public static void updateArray(int[] arr, int index, int newValue) {
        // Your code goes here
        
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        updateArray(arr, 2, 10);
        
        // Print array to verify
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}`;
      case 'python':
        return `def update_array(arr, index, new_value):
    # Write your solution here
    pass

# Test your function
arr = [1, 2, 3, 4, 5]
update_array(arr, 2, 10)
print(arr)`;
      default:
        return '// Write your code here\n';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.codeShell}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3>🔥 Code Shell - {language.toUpperCase()}</h3>
            <p className={styles.problemTitle}>{problemTitle}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.problemDescription}>
          <p>{problemDescription}</p>
        </div>
        
        <div className={styles.codeEditor}>
          <textarea
            value={code || getLanguageTemplate()}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Write your ${language} code here...`}
            className={styles.codeTextarea}
          />
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '🔄 Reviewing...' : '🚀 Submit for Review'}
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
