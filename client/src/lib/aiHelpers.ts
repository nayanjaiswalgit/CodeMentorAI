import { apiRequest } from "./queryClient";

/**
 * Get AI feedback on code
 */
export async function getAIFeedback(
  language: string,
  code: string,
  challenge?: {
    description: string;
    expectedOutput?: string;
  }
) {
  try {
    const result = await apiRequest("POST", "/api/ai-feedback", {
      language,
      code,
      challenge
    });
    
    return result;
  } catch (error) {
    throw new Error(error.message || "Failed to get AI feedback");
  }
}

/**
 * Get personalized recommendations
 */
export async function getPersonalizedRecommendations() {
  try {
    const result = await apiRequest("GET", "/api/recommendations", null);
    return result;
  } catch (error) {
    throw new Error(error.message || "Failed to get recommendations");
  }
}

/**
 * Parse AI feedback for better display
 */
export function parseFeedback(feedback: any) {
  if (!feedback) {
    return {
      mainFeedback: "No feedback available",
      suggestions: [],
      codeQuality: 0,
      correctness: 0
    };
  }
  
  // Extract main feedback
  const mainFeedback = feedback.feedback || "No feedback available";
  
  // Extract suggestions
  const suggestions = Array.isArray(feedback.suggestions) 
    ? feedback.suggestions 
    : [];
  
  // Extract scores
  const codeQuality = typeof feedback.codeQuality === 'number' 
    ? feedback.codeQuality 
    : 0;
    
  const correctness = typeof feedback.correctness === 'number' 
    ? feedback.correctness 
    : 0;
  
  return {
    mainFeedback,
    suggestions,
    codeQuality,
    correctness
  };
}

/**
 * Get difficulty level recommendation based on user's performance
 */
export function recommendDifficultyLevel(
  currentDifficulty: string,
  recentScores: number[]
) {
  if (recentScores.length === 0) {
    return currentDifficulty;
  }
  
  // Calculate average score
  const averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  
  // Difficulty mapping
  const difficulties = ["easy", "medium", "hard"];
  const currentIndex = difficulties.indexOf(currentDifficulty.toLowerCase());
  
  if (currentIndex === -1) {
    return "medium"; // Default to medium if current difficulty is invalid
  }
  
  // Recommend based on average score
  if (averageScore >= 85 && currentIndex < difficulties.length - 1) {
    // If doing very well, increase difficulty
    return difficulties[currentIndex + 1];
  } else if (averageScore <= 40 && currentIndex > 0) {
    // If struggling, decrease difficulty
    return difficulties[currentIndex - 1];
  }
  
  // Otherwise, keep current difficulty
  return currentDifficulty;
}
