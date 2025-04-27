import { apiRequest } from "./queryClient";

/**
 * Execute code with the given language and code string
 * Now handled by Django REST Framework backend at /api/execute-code
 */
export async function executeCode(language: string, code: string) {
  try {
    const result = await apiRequest("POST", "/api/execute-code", {
      language,
      code
    });
    
    return result;
  } catch (error) {
    throw new Error(error.message || "Failed to execute code");
  }
}

/**
 * Format code for different languages
 */
export function formatCode(language: string, code: string) {
  // This is a simple implementation
  // In a production app, this could use Prettier or other language-specific formatters
  
  // Default indentation
  const indent = '  '; // 2 spaces
  
  // Format based on language
  switch (language.toLowerCase()) {
    case 'javascript':
      // Basic JS formatting
      return code.trim();
      
    case 'python':
      // Basic Python formatting
      return code.trim();
      
    case 'cpp':
      // Basic C++ formatting
      return code.trim();
      
    default:
      return code.trim();
  }
}

/**
 * Parse code execution result for display
 */
export function parseExecutionResult(result: any) {
  if (!result) return { success: false, output: "No result received" };
  
  const success = result.success;
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const output = success ? stdout : stderr || "Execution failed";
  
  return {
    success,
    output,
  };
}

/**
 * Check if the code output matches expected output
 */
export function checkCodeOutput(actualOutput: string, expectedOutput: string) {
  return actualOutput.trim() === expectedOutput.trim();
}
