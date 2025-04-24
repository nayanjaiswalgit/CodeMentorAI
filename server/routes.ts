import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCourseSchema, 
  insertLessonSchema, 
  insertChallengeSchema, 
  insertMcqSchema,
  insertLearningPathSchema,
  insertUserProgressSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { executeCode } from "./services/codeExecutionService";
import { getAiFeedback, getPersonalizedRecommendations } from "./services/aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up session middleware with memory store
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "codementor-ai-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === "production",
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Set up passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // ======== Auth Routes ========
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Update user streak
        storage.updateUserStreak(user.id);
        return res.json({ id: user.id, username: user.username, displayName: user.displayName });
      });
    })(req, res, next);
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Log in the new user
      req.logIn(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        return res.status(201).json({ 
          id: newUser.id, 
          username: newUser.username, 
          displayName: newUser.displayName 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      skillLevel: user.skillLevel,
      preferences: user.preferences,
      streak: user.streak
    });
  });

  // ======== Course Routes ========
  app.get("/api/courses", async (_req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Get lessons for this course
      const lessons = await storage.getLessons(courseId);
      
      res.json({ ...course, lessons });
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  app.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const newCourse = await storage.createCourse(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating course" });
    }
  });

  // ======== Lesson Routes ========
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessons = await storage.getLessons(courseId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lesson" });
    }
  });

  // Add/Update lesson content (MDX, code, examples, tests)
  app.post("/api/lessons", isAuthenticated, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const newLesson = await storage.createLesson(lessonData);
      res.status(201).json(newLesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lesson data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating lesson" });
    }
  });

  app.put("/api/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedLesson = await storage.updateLesson(lessonId, updateData);
      if (!updatedLesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(updatedLesson);
    } catch (error) {
      res.status(500).json({ message: "Error updating lesson" });
    }
  });

  // ======== Challenge Routes ========
  app.get("/api/challenges", async (req, res) => {
    try {
      let challenges;
      
      if (req.query.language) {
        challenges = await storage.getChallengesByLanguage(req.query.language as string);
      } else if (req.query.difficulty) {
        challenges = await storage.getChallengesByDifficulty(req.query.difficulty as string);
      } else {
        challenges = await storage.getChallenges();
      }
      
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenge" });
    }
  });

  // ======== MCQ Routes ========
  app.get("/api/mcqs", async (req, res) => {
    try {
      let mcqs;
      
      if (req.query.language) {
        mcqs = await storage.getMcqsByLanguage(req.query.language as string);
      } else {
        mcqs = await storage.getMcqs();
      }
      
      res.json(mcqs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching MCQs" });
    }
  });
  
  app.post("/api/mcqs", isAuthenticated, async (req, res) => {
    try {
      const mcqData = insertMcqSchema.parse(req.body);
      const newMcq = await storage.createMcq(mcqData);
      res.status(201).json(newMcq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid MCQ data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating MCQ" });
    }
  });

  app.get("/api/mcqs/:id", async (req, res) => {
    try {
      const mcqId = parseInt(req.params.id);
      const mcq = await storage.getMcq(mcqId);
      
      if (!mcq) {
        return res.status(404).json({ message: "MCQ not found" });
      }
      
      res.json(mcq);
    } catch (error) {
      res.status(500).json({ message: "Error fetching MCQ" });
    }
  });

  // ======== Learning Path Routes ========
  app.get("/api/learning-paths", async (_req, res) => {
    try {
      const paths = await storage.getLearningPaths();
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Error fetching learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      res.json(path);
    } catch (error) {
      res.status(500).json({ message: "Error fetching learning path" });
    }
  });

  // ======== User Progress Routes ========
  app.get("/api/user-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  app.get("/api/user-progress/courses/:courseId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const courseId = parseInt(req.params.courseId);
      const progress = await storage.getUserCourseProgress(userId, courseId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course progress" });
    }
  });

  app.post("/api/user-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      const newProgress = await storage.createUserProgress(progressData);
      
      // Update user streak
      await storage.updateUserStreak(userId);
      
      res.status(201).json(newProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Error recording progress" });
    }
  });

  app.get("/api/user-skills", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const skills = await storage.getUserSkillProgress(userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user skills" });
    }
  });

  // ======== Code Execution Route ========
  app.post("/api/execute-code", async (req, res) => {
    try {
      const { language, code } = req.body;
      
      if (!language || !code) {
        return res.status(400).json({ message: "Language and code are required" });
      }
      
      const result = await executeCode(language, code);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: "Error executing code",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // ======== AI Feedback Route ========
  app.post("/api/ai-feedback", async (req, res) => {
    try {
      const { language, code, challenge } = req.body;
      
      if (!language || !code) {
        return res.status(400).json({ message: "Language and code are required" });
      }
      
      const feedback = await getAiFeedback(language, code, challenge);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "Error getting AI feedback",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // ======== Recommendations Route ========
  app.get("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const progress = await storage.getUserProgress(userId);
      const skills = await storage.getUserSkillProgress(userId);
      
      const recommendations = await getPersonalizedRecommendations(
        user, 
        progress, 
        skills,
        await storage.getCourses(),
        await storage.getChallenges()
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ 
        message: "Error getting recommendations",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // --- AI-generated test questions endpoint ---
  app.post("/api/generate-questions", isAuthenticated, async (req, res) => {
    try {
      const { topic, difficulty, language, numQuestions } = req.body;
      const { generateTestQuestions } = await import("./services/aiService");
      const result = await generateTestQuestions({ topic, difficulty, language, numQuestions });
      res.json(result);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Error generating questions" });
    }
  });

  // --- AI-generated test questions from PDF endpoint ---
  const multer = (await import('multer')).default;
  const upload = multer({ dest: 'uploads/' });
  app.post("/api/generate-questions-from-pdf", isAuthenticated, upload.single('pdf'), async (req, res) => {
    try {
      const { pageStart, pageEnd, keyword, numQuestions, difficulty, language } = req.body;
      const filePath = req.file?.path;
      if (!filePath) return res.status(400).json({ message: "No PDF uploaded" });
      const { extractTextFromPdf } = await import("./services/pdfQuestionService");
      let text = await extractTextFromPdf(filePath, {
        pageRange: pageStart && pageEnd ? [parseInt(pageStart), parseInt(pageEnd)] : undefined,
        keyword: keyword || undefined
      });
      if (!text || text.length < 50) return res.status(400).json({ message: "Could not extract enough text from PDF" });
      const { generateTestQuestions } = await import("./services/aiService");
      const result = await generateTestQuestions({ topic: text, difficulty, language, numQuestions });
      res.json(result);
    } catch (error) {
      console.error("Error generating questions from PDF:", error);
      res.status(500).json({ message: "Error generating questions from PDF" });
    }
  });

  // ======== Test Routes ========
  app.get("/api/tests", async (req, res) => {
    try {
      const tests = await storage.getTests();
      
      // Transform tests to include question count and total points
      const transformedTests = tests.map(test => ({
        ...test,
        questionCount: test.questions.length,
        totalPoints: test.questions.reduce((sum, q) => sum + q.points, 0)
      }));
      
      res.json(transformedTests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tests" });
    }
  });
  
  app.get("/api/tests/:id", async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getTest(testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Error fetching test" });
    }
  });
  
  app.post("/api/tests", isAuthenticated, async (req, res) => {
    try {
      const testData = req.body;
      const newTest = await storage.createTest(testData);
      res.status(201).json(newTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating test" });
    }
  });
  
  app.post("/api/tests/:id/submit", isAuthenticated, async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const { answers } = req.body;
      const userId = (req.user as any).id;
      
      // Get the test
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Calculate score
      let earnedPoints = 0;
      const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
      
      const questionResults = test.questions.map(question => {
        let correct = false;
        let points = 0;
        
        // Get user's answer for this question
        const answer = answers[question.id];
        
        if (answer) {
          if (question.type === 'multi-select') {
            // For multi-select, check if all correct answers are selected and no incorrect ones
            const selectedOptions = (answer as any).selectedOptions || [];
            const correctOptions = (question as any).correctAnswers || [];
            
            // Check if all correct answers were selected
            const allCorrectSelected = correctOptions.every((opt: number) => 
              selectedOptions.includes(opt)
            );
            
            // Check if no incorrect answers were selected
            const noIncorrectSelected = selectedOptions.every((opt: number) => 
              correctOptions.includes(opt)
            );
            
            correct = allCorrectSelected && noIncorrectSelected;
          } else {
            // For MCQ or code-MCQ
            const selectedOption = (answer as any).selectedOption;
            const correctOption = (question as any).correctAnswer;
            
            correct = selectedOption === correctOption;
          }
          
          // If correct, award full points for the question
          points = correct ? question.points : 0;
        }
        
        earnedPoints += points;
        
        return {
          questionId: question.id,
          correct,
          points: question.points,
          earnedPoints: points
        };
      });
      
      // Calculate score as percentage
      const score = Math.round((earnedPoints / totalPoints) * 100);
      
      // Check if passed
      const passed = score >= test.passingScore;
      
      // Create and save test attempt
      const testAttempt = {
        userId,
        testId,
        completed: true,
        score,
        totalPoints,
        earnedPoints,
        passed,
        completedAt: new Date().toISOString(),
        questionResults
      };
      
      // Save the test attempt
      await storage.createTestAttempt(testAttempt);
      
      // Return results
      res.json({
        testId,
        completed: true,
        score,
        totalPoints,
        earnedPoints,
        passed,
        questionResults
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ message: "Error submitting test" });
    }
  });
  
  app.get("/api/user-test-attempts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const attempts = await storage.getUserTestAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching test attempts" });
    }
  });

  return httpServer;
}
