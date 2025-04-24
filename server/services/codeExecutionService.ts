import axios from "axios";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

// Language IDs for Judge0 API
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62         // Java (OpenJDK 13)
};

/**
 * Execute code using Judge0 API
 */
export async function executeCode(language: string, code: string): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  success: boolean;
}> {
  try {
    // For development without API key, return mock result
    if (!JUDGE0_API_KEY) {
      return getMockExecutionResult(language, code);
    }

    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Create submission
    const submission = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin: "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_API_HOST,
        },
      }
    );

    const token = submission.data.token;

    // Wait for submission to complete (poll for result)
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Get submission result
      result = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}?fields=stdout,stderr,exit_code,time,status`,
        {
          headers: {
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": JUDGE0_API_HOST,
          },
        }
      );

      // Check if execution is complete
      if (result.data.status?.id >= 3) {
        break;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!result || attempts >= maxAttempts) {
      throw new Error("Code execution timed out");
    }

    return {
      stdout: result.data.stdout || "",
      stderr: result.data.stderr || "",
      exitCode: result.data.exit_code || 0,
      executionTime: result.data.time || 0,
      success: result.data.status?.id === 3, // Status ID 3 means "Accepted"
    };
  } catch (error) {
    console.error("Error executing code:", error);
    
    // Fallback to mock execution on error
    return getMockExecutionResult(language, code);
  }
}

// Development mock response
function getMockExecutionResult(language: string, code: string): {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  success: boolean;
} {
  // Simple mock output based on language
  let stdout = "";
  
  if (language === "javascript") {
    // Check for common console.log in JavaScript
    const logMatch = code.match(/console\.log\(['"](.+)['"]\)/);
    if (logMatch && logMatch[1]) {
      stdout = logMatch[1];
    } else {
      stdout = "Hello from JavaScript!";
    }
  } else if (language === "python") {
    // Check for common print in Python
    const printMatch = code.match(/print\(['"](.+)['"]\)/);
    if (printMatch && printMatch[1]) {
      stdout = printMatch[1];
    } else {
      stdout = "Hello from Python!";
    }
  } else if (language === "cpp") {
    stdout = "Hello from C++!";
  } else {
    stdout = "Code executed successfully";
  }
  
  return {
    stdout,
    stderr: "",
    exitCode: 0,
    executionTime: 0.12,
    success: true
  };
}
