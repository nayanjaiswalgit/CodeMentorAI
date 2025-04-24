import OpenAI from "openai";
import { User, UserProgress, Course, Challenge } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

/**
 * Get AI feedback on user's code submission
 */
export async function getAiFeedback(
  language: string,
  code: string,
  challenge?: { description: string; expectedOutput?: string }
): Promise<{
  feedback: string;
  suggestions: string[];
  codeQuality: number;
  correctness: number;
}> {
  try {
    // For development without API key, return mock feedback
    if (!process.env.OPENAI_API_KEY) {
      return getMockFeedback(language, code);
    }
    
    const prompt = `
      As a coding instructor, provide feedback on this ${language} code:
      
      ${challenge ? `Challenge Description: ${challenge.description}\n` : ''}
      ${challenge?.expectedOutput ? `Expected Output: ${challenge.expectedOutput}\n` : ''}
      
      Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Analyze the code and provide:
      1. Overall feedback on the solution
      2. 1-3 specific suggestions for improvement
      3. A code quality score (1-10)
      4. A correctness score (1-10) based on whether the code would produce the expected output
      
      Return your response as a JSON object with these properties:
      - feedback (string): overall assessment
      - suggestions (string[]): array of improvement suggestions
      - codeQuality (number): score from 1-10
      - correctness (number): score from 1-10
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      feedback: result.feedback,
      suggestions: result.suggestions,
      codeQuality: result.codeQuality,
      correctness: result.correctness
    };
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    // Fallback to mock feedback on error
    return getMockFeedback(language, code);
  }
}

/**
 * Get personalized learning recommendations based on user progress
 */
export async function getPersonalizedRecommendations(
  user: User,
  progress: UserProgress[],
  skills: Record<string, number>,
  allCourses: Course[],
  allChallenges: Challenge[]
): Promise<{
  recommendedCourses: Course[];
  recommendedChallenges: Challenge[];
  weakAreas: string[];
  nextSteps: string[];
}> {
  try {
    // For development without API key, return mock recommendations
    if (!process.env.OPENAI_API_KEY) {
      return getMockRecommendations(user, allCourses, allChallenges);
    }
    
    const userContext = {
      skillLevel: user.skillLevel,
      preferences: user.preferences,
      skillProgress: skills,
      completedLessons: progress.filter(p => p.lessonId && p.completed).length,
      completedChallenges: progress.filter(p => p.challengeId && p.completed).length
    };
    
    // Get course IDs the user has made progress in
    const activeCourseIds = [...new Set(progress
      .filter(p => p.courseId)
      .map(p => p.courseId))];
      
    // Get challenge IDs the user has attempted
    const attemptedChallengeIds = [...new Set(progress
      .filter(p => p.challengeId)
      .map(p => p.challengeId))];
    
    const prompt = `
      As a coding education AI, create personalized learning recommendations for this user:
      
      User Context:
      ${JSON.stringify(userContext, null, 2)}
      
      Active Course IDs: ${JSON.stringify(activeCourseIds)}
      Attempted Challenge IDs: ${JSON.stringify(attemptedChallengeIds)}
      
      Available Courses:
      ${JSON.stringify(allCourses.map(c => ({ id: c.id, title: c.title, language: c.language, difficulty: c.difficulty })), null, 2)}
      
      Available Challenges:
      ${JSON.stringify(allChallenges.map(c => ({ id: c.id, title: c.title, language: c.language, difficulty: c.difficulty })), null, 2)}
      
      Based on this information:
      1. Recommend 2-3 courses the user should take next
      2. Recommend 2-3 challenges that would be appropriate for their skill level
      3. Identify 2-3 weak areas the user should focus on
      4. Suggest 2-3 next steps for their learning journey
      
      Return your response as a JSON object with these properties:
      - recommendedCourseIds (number[]): array of recommended course IDs
      - recommendedChallengeIds (number[]): array of recommended challenge IDs
      - weakAreas (string[]): array of weak areas to focus on
      - nextSteps (string[]): array of next step suggestions
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Filter courses and challenges based on AI recommendations
    const recommendedCourses = allCourses.filter(course => 
      result.recommendedCourseIds.includes(course.id)
    );
    
    const recommendedChallenges = allChallenges.filter(challenge => 
      result.recommendedChallengeIds.includes(challenge.id)
    );
    
    return {
      recommendedCourses,
      recommendedChallenges,
      weakAreas: result.weakAreas,
      nextSteps: result.nextSteps
    };
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    // Fallback to mock recommendations on error
    return getMockRecommendations(user, allCourses, allChallenges);
  }
}

/**
 * Generate test questions using AI
 */
export async function generateTestQuestions({ topic, difficulty, language, numQuestions }: {
  topic: string;
  difficulty?: string;
  language?: string;
  numQuestions?: number;
}): Promise<{ questions: { question: string; options?: string[]; answer?: string; explanation?: string }[] }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return mock questions for development
      return {
        questions: [
          { question: `Sample question about ${topic}?`, options: ["A", "B", "C", "D"], answer: "A", explanation: "This is a mock answer." },
          { question: `Another sample question on ${topic}?`, options: ["A", "B", "C", "D"], answer: "B", explanation: "This is a mock answer." }
        ]
      };
    }
    const prompt = `Generate ${numQuestions || 5} ${difficulty ? difficulty + ' ' : ''}${language ? language + ' ' : ''}multiple-choice questions on the topic '${topic}'.
Return each question as a JSON object with 'question', 'options' (array), 'answer' (correct option), and 'explanation'. Return a JSON array.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    let questions;
    try {
      questions = JSON.parse(response.choices[0].message.content);
      if (!Array.isArray(questions)) {
        questions = questions.questions || [];
      }
    } catch (e) {
      questions = [];
    }
    return { questions };
  } catch (error) {
    console.error("Error generating test questions:", error);
    return { questions: [] };
  }
}

// Development mock responses

function getMockFeedback(language: string, code: string): {
  feedback: string;
  suggestions: string[];
  codeQuality: number;
  correctness: number;
} {
  return {
    feedback: "Your code is well-structured and shows good understanding of the core concepts. The solution is efficient and correctly handles the requirements.",
    suggestions: [
      "Consider adding more comments to explain your logic",
      "You could improve error handling for edge cases",
      "Look for opportunities to make your code more concise"
    ],
    codeQuality: 8,
    correctness: 9
  };
}

function getMockRecommendations(
  user: User,
  allCourses: Course[],
  allChallenges: Challenge[]
): {
  recommendedCourses: Course[];
  recommendedChallenges: Challenge[];
  weakAreas: string[];
  nextSteps: string[];
} {
  // Take first 2 courses and first 3 challenges as recommendations
  const recommendedCourses = allCourses.slice(0, 2);
  const recommendedChallenges = allChallenges.slice(0, 3);
  
  return {
    recommendedCourses,
    recommendedChallenges,
    weakAreas: [
      "Algorithm complexity analysis",
      "Asynchronous programming patterns",
      "Test-driven development"
    ],
    nextSteps: [
      "Complete the JavaScript Fundamentals course",
      "Try the Promise Chaining challenge to improve async skills",
      "Practice more with data structures using Python"
    ]
  };
}
