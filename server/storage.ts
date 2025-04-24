import {
  users, User, InsertUser,
  courses, Course, InsertCourse,
  lessons, Lesson, InsertLesson,
  challenges, Challenge, InsertChallenge,
  mcqs, Mcq, InsertMcq,
  learningPaths, LearningPath, InsertLearningPath,
  userProgress, UserProgress, InsertUserProgress
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  updateUserStreak(userId: number): Promise<User | undefined>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByLanguage(language: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Lesson operations
  getLessons(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson | undefined>;

  // Challenge operations
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  getChallengesByDifficulty(difficulty: string): Promise<Challenge[]>;
  getChallengesByLanguage(language: string): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;

  // MCQ operations
  getMcqs(): Promise<Mcq[]>;
  getMcq(id: number): Promise<Mcq | undefined>;
  getMcqsByLanguage(language: string): Promise<Mcq[]>;
  createMcq(mcq: InsertMcq): Promise<Mcq>;
  
  // Test operations
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  createTest(test: any): Promise<Test>;
  createTestAttempt(attempt: any): Promise<TestAttempt>;
  getUserTestAttempts(userId: number): Promise<TestAttempt[]>;

  // Learning path operations
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;

  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserCourseProgress(userId: number, courseId: number): Promise<UserProgress[]>;
  getChallengeAttempts(userId: number, challengeId: number): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserSkillProgress(userId: number): Promise<Record<string, number>>;
}

// Test interfaces
export interface TestQuestion {
  id: string;
  type: 'mcq' | 'code-mcq' | 'multi-select';
  question: string;
  points: number;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  code?: string;
  language?: string;
  explanation?: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  questions: TestQuestion[];
}

export interface TestQuestionResult {
  questionId: string;
  correct: boolean;
  points: number;
  earnedPoints: number;
}

export interface TestAttempt {
  id: number;
  userId: number;
  testId: number;
  completed: boolean;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  completedAt: string;
  questionResults: TestQuestionResult[];
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private challenges: Map<number, Challenge>;
  private mcqs: Map<number, Mcq>;
  private tests: Map<number, Test>;
  private testAttempts: Map<number, TestAttempt>;
  private learningPaths: Map<number, LearningPath>;
  private userProgresses: Map<number, UserProgress>;
  
  private userId: number;
  private courseId: number;
  private lessonId: number;
  private challengeId: number;
  private mcqId: number;
  private testId: number;
  private testAttemptId: number;
  private learningPathId: number;
  private userProgressId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.challenges = new Map();
    this.mcqs = new Map();
    this.tests = new Map();
    this.testAttempts = new Map();
    this.learningPaths = new Map();
    this.userProgresses = new Map();
    
    this.userId = 1;
    this.courseId = 1;
    this.lessonId = 1;
    this.challengeId = 1;
    this.mcqId = 1;
    this.testId = 1;
    this.testAttemptId = 1;
    this.learningPathId = 1;
    this.userProgressId = 1;
    
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      streak: 0,
      lastActivity: now,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(userId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const now = new Date();
    const lastActivity = user.lastActivity;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    let streak = user.streak;
    
    if (!lastActivity) {
      // First activity
      streak = 1;
    } else {
      const lastDate = new Date(lastActivity);
      const dayDifference = Math.floor((now.getTime() - lastDate.getTime()) / oneDayMs);
      
      if (dayDifference === 1) {
        // Consecutive day
        streak += 1;
      } else if (dayDifference > 1) {
        // Streak broken
        streak = 1;
      }
      // If same day (dayDifference === 0), keep streak the same
    }
    
    const updatedUser = { ...user, streak, lastActivity: now };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByLanguage(language: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.language.toLowerCase() === language.toLowerCase(),
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  // Lesson operations
  async getLessons(courseId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((lesson) => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    const updatedLesson = { ...lesson, ...data };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  // Challenge operations
  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallengesByDifficulty(difficulty: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.difficulty.toLowerCase() === difficulty.toLowerCase(),
    );
  }

  async getChallengesByLanguage(language: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.language.toLowerCase() === language.toLowerCase(),
    );
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  // MCQ operations
  async getMcqs(): Promise<Mcq[]> {
    return Array.from(this.mcqs.values());
  }

  async getMcq(id: number): Promise<Mcq | undefined> {
    return this.mcqs.get(id);
  }

  async getMcqsByLanguage(language: string): Promise<Mcq[]> {
    return Array.from(this.mcqs.values()).filter(
      (mcq) => mcq.language?.toLowerCase() === language.toLowerCase(),
    );
  }

  async createMcq(insertMcq: InsertMcq): Promise<Mcq> {
    const id = this.mcqId++;
    const mcq: Mcq = { ...insertMcq, id };
    this.mcqs.set(id, mcq);
    return mcq;
  }

  // Test operations
  async getTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async getTest(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async createTest(testData: any): Promise<Test> {
    const id = this.testId++;
    const test: Test = { ...testData, id };
    this.tests.set(id, test);
    return test;
  }

  async createTestAttempt(attemptData: any): Promise<TestAttempt> {
    const id = this.testAttemptId++;
    const attempt: TestAttempt = { ...attemptData, id };
    this.testAttempts.set(id, attempt);
    return attempt;
  }

  async getUserTestAttempts(userId: number): Promise<TestAttempt[]> {
    return Array.from(this.testAttempts.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  // Learning path operations
  async getLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }

  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }

  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = this.learningPathId++;
    const path: LearningPath = { ...insertPath, id };
    this.learningPaths.set(id, path);
    return path;
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgresses.values()).filter(
      (progress) => progress.userId === userId,
    );
  }

  async getUserCourseProgress(userId: number, courseId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgresses.values()).filter(
      (progress) => progress.userId === userId && progress.courseId === courseId,
    );
  }

  async getChallengeAttempts(userId: number, challengeId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgresses.values()).filter(
      (progress) => progress.userId === userId && progress.challengeId === challengeId,
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.userProgressId++;
    const now = new Date();
    const progress: UserProgress = { ...insertProgress, id, attemptedAt: now };
    this.userProgresses.set(id, progress);
    return progress;
  }

  async getUserSkillProgress(userId: number): Promise<Record<string, number>> {
    const userProgress = await this.getUserProgress(userId);
    
    // Get all completed course lessons by language
    const completedCourseLessons = userProgress
      .filter(progress => progress.completed && progress.lessonId !== null)
      .map(progress => this.lessons.get(progress.lessonId!))
      .filter(Boolean);
    
    // Get all courses to check languages
    const allCourses = Array.from(this.courses.values());
    
    // Count completion by language
    const languageCounts: Record<string, { completed: number, total: number }> = {};
    
    // Initialize language counts
    allCourses.forEach(course => {
      if (!languageCounts[course.language]) {
        languageCounts[course.language] = { completed: 0, total: 0 };
      }
    });
    
    // Count completed lessons by language
    completedCourseLessons.forEach(lesson => {
      const course = allCourses.find(c => c.id === lesson?.courseId);
      if (course && languageCounts[course.language]) {
        languageCounts[course.language].completed += 1;
      }
    });
    
    // Count total lessons by language
    Array.from(this.lessons.values()).forEach(lesson => {
      const course = allCourses.find(c => c.id === lesson.courseId);
      if (course && languageCounts[course.language]) {
        languageCounts[course.language].total += 1;
      }
    });
    
    // Calculate percentages
    const skillPercentages: Record<string, number> = {};
    Object.entries(languageCounts).forEach(([language, counts]) => {
      skillPercentages[language] = counts.total > 0 ? 
        Math.round((counts.completed / counts.total) * 100) : 0;
    });
    
    return skillPercentages;
  }

  // Seed data for demo purposes
  private seedData() {
    // Seed example user
    const user: User = {
      id: this.userId++,
      username: "alexj",
      password: "password123",
      email: "alex@example.com",
      displayName: "Alex Johnson",
      bio: "Passionate about coding and learning new technologies",
      skillLevel: "intermediate",
      preferences: {
        languages: ["javascript", "python"],
        interests: ["web development", "data science"]
      },
      streak: 12,
      lastActivity: new Date(),
      createdAt: new Date()
    };
    this.users.set(user.id, user);

    // Seed courses
    const jsCourse: Course = {
      id: this.courseId++,
      title: "JavaScript Fundamentals",
      description: "Learn the core concepts of JavaScript programming",
      language: "javascript",
      category: "web development",
      difficulty: "beginner",
      imageUrl: "js-icon.svg",
      estimatedHours: 10
    };
    this.courses.set(jsCourse.id, jsCourse);

    const pythonCourse: Course = {
      id: this.courseId++,
      title: "Python for Data Science",
      description: "Master Python fundamentals for data analysis",
      language: "python",
      category: "data science",
      difficulty: "beginner",
      imageUrl: "python-icon.svg",
      estimatedHours: 12
    };
    this.courses.set(pythonCourse.id, pythonCourse);

    const cppCourse: Course = {
      id: this.courseId++,
      title: "C++ Programming",
      description: "Learn C++ from the ground up",
      language: "cpp",
      category: "systems programming",
      difficulty: "intermediate",
      imageUrl: "cpp-icon.svg",
      estimatedHours: 15
    };
    this.courses.set(cppCourse.id, cppCourse);

    // Seed lessons for JavaScript course
    const jsLessons = [
      {
        id: this.lessonId++,
        courseId: jsCourse.id,
        title: "Variables and Data Types",
        content: "Learn about variables, primitive types, and type coercion in JavaScript.",
        order: 1,
        estimatedMinutes: 30
      },
      {
        id: this.lessonId++,
        courseId: jsCourse.id,
        title: "Functions and Scope",
        content: "Understand function declarations, expressions, and variable scope in JavaScript.",
        order: 2,
        estimatedMinutes: 45
      },
      {
        id: this.lessonId++,
        courseId: jsCourse.id,
        title: "Objects and Arrays",
        content: "Learn about object and array manipulation in JavaScript.",
        order: 3,
        estimatedMinutes: 40
      },
      {
        id: this.lessonId++,
        courseId: jsCourse.id,
        title: "Advanced Functions & Closures",
        content: "Master closures, higher-order functions, and function contexts.",
        order: 4,
        estimatedMinutes: 60
      }
    ];
    
    jsLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });

    // Seed challenges
    const challenges = [
      {
        id: this.challengeId++,
        title: "List Comprehensions",
        description: "Practice using Python's powerful list comprehension feature to solve data transformation problems.",
        language: "python",
        difficulty: "medium",
        category: "data structures",
        initialCode: "# Write a list comprehension to extract all even numbers from the given list\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\neven_numbers = # your code here\n\nprint(even_numbers)",
        expectedOutput: "[2, 4, 6, 8, 10]",
        testCases: [
          { input: "numbers = [1, 2, 3, 4, 5]", expected: "[2, 4]" },
          { input: "numbers = [10, 11, 12, 13, 14]", expected: "[10, 12, 14]" }
        ],
        estimatedMinutes: 20
      },
      {
        id: this.challengeId++,
        title: "Promise Chaining",
        description: "Master advanced asynchronous JavaScript by implementing complex promise chains.",
        language: "javascript",
        difficulty: "hard",
        category: "async programming",
        initialCode: "// Implement a promise chain that fetches a user, then their posts, then the comments\nfunction fetchUser(id) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve({ id, name: 'User ' + id }), 100);\n  });\n}\n\nfunction fetchPosts(userId) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve([{ id: 1, title: 'Post 1', userId }]), 100);\n  });\n}\n\nfunction fetchComments(postId) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve([{ id: 1, text: 'Comment 1', postId }]), 100);\n  });\n}\n\n// Your code here - create a promise chain that:\n// 1. Fetches user with id 1\n// 2. Then fetches their posts\n// 3. Then fetches comments for the first post\n// 4. Finally returns an object with user, posts, and comments",
        expectedOutput: "{ user: { id: 1, name: 'User 1' }, posts: [{ id: 1, title: 'Post 1', userId: 1 }], comments: [{ id: 1, text: 'Comment 1', postId: 1 }] }",
        testCases: [
          { input: "1", expected: "User 1" },
          { input: "2", expected: "User 2" }
        ],
        estimatedMinutes: 35
      },
      {
        id: this.challengeId++,
        title: "C++ Pointers Basics",
        description: "Understand the fundamentals of memory management in C++ through pointer exercises.",
        language: "cpp",
        difficulty: "easy",
        category: "memory management",
        initialCode: "#include <iostream>\n\nint main() {\n  // Declare an integer variable and a pointer to it\n  int number = 42;\n  \n  // Your code here - create a pointer to number\n  \n  // Print the value using the pointer\n  \n  return 0;\n}",
        expectedOutput: "42",
        testCases: [
          { input: "number = 42", expected: "42" },
          { input: "number = 100", expected: "100" }
        ],
        estimatedMinutes: 15
      }
    ];
    
    challenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });

    // Seed MCQs
    const mcqs = [
      {
        id: this.mcqId++,
        question: "Which of the following is not a valid JavaScript variable name?",
        options: [
          "myVariable",
          "my_variable",
          "myVariable123",
          "123myVariable"
        ],
        correctAnswer: 3,
        explanation: "Variable names cannot start with a number in JavaScript.",
        language: "javascript",
        category: "syntax",
        difficulty: "easy"
      },
      {
        id: this.mcqId++,
        question: "What does the 'self' keyword refer to in Python?",
        options: [
          "It refers to the class itself",
          "It refers to the current instance of the class",
          "It's a required parameter for all functions",
          "It's used to create static methods"
        ],
        correctAnswer: 1,
        explanation: "In Python, 'self' refers to the current instance of the class and is used to access class attributes and methods.",
        language: "python",
        category: "object-oriented",
        difficulty: "medium"
      }
    ];
    
    mcqs.forEach(mcq => {
      this.mcqs.set(mcq.id, mcq);
    });
    
    // Seed tests
    const tests = [
      {
        id: this.testId++,
        title: "JavaScript Fundamentals Test",
        description: "Test your knowledge of JavaScript fundamentals including variables, functions, and objects.",
        language: "javascript",
        difficulty: "beginner",
        timeLimit: 20,
        passingScore: 70,
        questions: [
          {
            id: "js-q1",
            type: "mcq",
            question: "Which of the following is a primitive data type in JavaScript?",
            points: 10,
            options: [
              "Array",
              "Object",
              "String",
              "Function"
            ],
            correctAnswer: 2,
            explanation: "JavaScript has 7 primitive data types: string, number, bigint, boolean, undefined, symbol, and null. Arrays, objects, and functions are non-primitive data types."
          },
          {
            id: "js-q2",
            type: "code-mcq",
            question: "What is the output of the following code?",
            points: 15,
            code: "let x = 10;\nlet y = '10';\nconsole.log(x == y);\nconsole.log(x === y);",
            language: "javascript",
            options: [
              "true, true",
              "true, false",
              "false, true",
              "false, false"
            ],
            correctAnswer: 1,
            explanation: "The == operator performs type coercion, so x == y is true. The === operator doesn't perform type coercion and checks if both value and type are the same, so x === y is false because x is a number and y is a string."
          },
          {
            id: "js-q3",
            type: "multi-select",
            question: "Which of the following methods can be used to add elements to an array in JavaScript? (Select all that apply)",
            points: 15,
            options: [
              "push()",
              "concat()",
              "insert()",
              "unshift()"
            ],
            correctAnswers: [0, 1, 3],
            explanation: "push() adds elements to the end of an array, concat() returns a new array with elements added to the end, and unshift() adds elements to the beginning of an array. insert() is not a standard array method in JavaScript."
          }
        ]
      },
      {
        id: this.testId++,
        title: "Python Basics Assessment",
        description: "Test your knowledge of Python basics including syntax, data types, and control flow.",
        language: "python",
        difficulty: "beginner",
        timeLimit: 25,
        passingScore: 65,
        questions: [
          {
            id: "py-q1",
            type: "mcq",
            question: "What is the correct way to define a function in Python?",
            points: 10,
            options: [
              "function myFunc():",
              "def myFunc():",
              "func myFunc():",
              "define myFunc():"
            ],
            correctAnswer: 1,
            explanation: "In Python, functions are defined using the 'def' keyword followed by the function name and parameters."
          },
          {
            id: "py-q2",
            type: "code-mcq",
            question: "What will be the output of the following code?",
            points: 15,
            code: "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
            language: "python",
            options: [
              "[1, 2, 3]",
              "[1, 2, 3, 4]",
              "Error",
              "[1, 2, 3, [4]]"
            ],
            correctAnswer: 1,
            explanation: "In Python, assignment of lists creates a reference to the same list. So when we modify y, we're also modifying x because they reference the same list object."
          },
          {
            id: "py-q3",
            type: "multi-select",
            question: "Which of the following are valid ways to create a list in Python? (Select all that apply)",
            points: 15,
            options: [
              "x = []",
              "x = list()",
              "x = list(range(5))",
              "x = array()"
            ],
            correctAnswers: [0, 1, 2],
            explanation: "Empty lists can be created with [] or list(). You can also create a list using list() with an iterable like range(). array() is not a built-in Python function for creating lists (though it exists in the NumPy library)."
          }
        ]
      }
    ];
    
    tests.forEach(test => {
      this.tests.set(test.id, test);
    });

    // Seed learning paths
    const webDevPath: LearningPath = {
      id: this.learningPathId++,
      title: "Full-Stack Web Development",
      description: "Master modern web development from front-end to back-end. Build complete, responsive web applications.",
      category: "web development",
      courses: [jsCourse.id],
      challenges: [challenges[1].id],
      estimatedHours: 50,
      imageIcon: "laptop-code"
    };
    this.learningPaths.set(webDevPath.id, webDevPath);

    const dataPath: LearningPath = {
      id: this.learningPathId++,
      title: "Python Data Science",
      description: "Learn to analyze data, create visualizations, and build machine learning models using Python.",
      category: "data science",
      courses: [pythonCourse.id],
      challenges: [challenges[0].id],
      estimatedHours: 60,
      imageIcon: "brain"
    };
    this.learningPaths.set(dataPath.id, dataPath);

    // Seed user progress
    // User has completed 2/4 JavaScript lessons
    this.userProgressId = 1;
    const jsProgressEntries = [
      {
        id: this.userProgressId++,
        userId: user.id,
        courseId: jsCourse.id,
        lessonId: jsLessons[0].id,
        challengeId: null,
        mcqId: null,
        completed: true,
        score: 100,
        codeSubmission: null,
        attemptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: this.userProgressId++,
        userId: user.id,
        courseId: jsCourse.id,
        lessonId: jsLessons[1].id,
        challengeId: null,
        mcqId: null,
        completed: true,
        score: 90,
        codeSubmission: null,
        attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: this.userProgressId++,
        userId: user.id,
        courseId: jsCourse.id,
        lessonId: jsLessons[2].id,
        challengeId: null,
        mcqId: null,
        completed: true,
        score: 85,
        codeSubmission: null,
        attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    jsProgressEntries.forEach(progress => {
      this.userProgresses.set(progress.id, progress);
    });
  }
}

export const storage = new MemStorage();
