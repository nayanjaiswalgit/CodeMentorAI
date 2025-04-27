from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions, viewsets, filters
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from .models import (
    Course, Lesson, Enrollment, Challenge, Submission, MCQ, LearningPath, UserProgress, CourseReview, Test, TestSubmission,
    Module, Note, ChatMessage
)
from .serializers import (
    UserSerializer, CourseSerializer, LessonSerializer, EnrollmentSerializer,
    ChallengeSerializer, SubmissionSerializer, MCQSerializer, LearningPathSerializer, UserProgressSerializer,
    CourseReviewSerializer, TestSerializer, TestSubmissionSerializer,
    ModuleSerializer, NoteSerializer, ChatMessageSerializer
)
from django.db.models import Count, Q

# Health check
class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok", "message": "DRF backend running"}, status=status.HTTP_200_OK)

# AUTH APIs
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data.get('email', ''),
                password=request.data.get('password'),
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
            )
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': UserSerializer(user).data}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': UserSerializer(user).data}, status=200)
        return Response({'error': 'Invalid credentials'}, status=400)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=200)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# User CRUD
class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# Course CRUD
class CourseListView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseSearchView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'language', 'instructor__username']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        qs = Course.objects.all()
        lang = self.request.query_params.get('language')
        if lang:
            qs = qs.filter(language__iexact=lang)
        return qs

class CourseEnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        course = Course.objects.get(pk=pk)
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        return Response({'enrolled': True, 'enrollment_id': enrollment.id}, status=200)

class CourseChallengesView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, course_id):
        lessons = Lesson.objects.filter(course_id=course_id)
        challenges = Challenge.objects.filter(lesson__in=lessons)
        return Response(ChallengeSerializer(challenges, many=True).data)

class CourseLessonsView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, course_id):
        lessons = Lesson.objects.filter(course_id=course_id)
        return Response(LessonSerializer(lessons, many=True).data)

# Lesson CRUD
class LessonListView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class LessonMCQsView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, lesson_id):
        mcqs = MCQ.objects.filter(lesson_id=lesson_id)
        return Response(MCQSerializer(mcqs, many=True).data)

# Enrollment CRUD
class EnrollmentListView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

# Challenge CRUD
class ChallengeListView(generics.ListCreateAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ChallengeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Submission CRUD + submit code
class SubmissionListView(generics.ListCreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubmitCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, challenge_id):
        # TODO: Integrate code execution logic here
        # For now, just create a submission
        challenge = Challenge.objects.get(pk=challenge_id)
        submission = Submission.objects.create(
            user=request.user,
            challenge=challenge,
            code=request.data['code'],
            language=request.data.get('language', 'python'),
            is_correct=False,  # Placeholder
            feedback="Pending evaluation"
        )
        return Response(SubmissionSerializer(submission).data, status=201)

class UserSubmissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        submissions = Submission.objects.filter(user=request.user)
        return Response(SubmissionSerializer(submissions, many=True).data)

# MCQ CRUD
class MCQListView(generics.ListCreateAPIView):
    queryset = MCQ.objects.all()
    serializer_class = MCQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class MCQDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MCQ.objects.all()
    serializer_class = MCQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# LearningPath CRUD
class LearningPathListView(generics.ListCreateAPIView):
    queryset = LearningPath.objects.all()
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

class LearningPathDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningPath.objects.all()
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

# UserProgress CRUD
class UserProgressListView(generics.ListCreateAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

# Course Review Views
class CourseReviewListCreateView(generics.ListCreateAPIView):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CourseReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

# Test Views
class TestListCreateView(generics.ListCreateAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

# Test Submission Views
class TestSubmissionListCreateView(generics.ListCreateAPIView):
    queryset = TestSubmission.objects.all()
    serializer_class = TestSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Auto-grade MCQ answers
        test = Test.objects.get(pk=self.request.data['test'])
        answers = self.request.data.get('answers', {})
        score = 0
        total = test.mcqs.count()
        for mcq in test.mcqs.all():
            user_answer = answers.get(str(mcq.id))
            if user_answer and user_answer == mcq.answer:
                score += 1
        percent_score = (score / total) * 100 if total > 0 else 0
        serializer.save(user=self.request.user, score=percent_score, is_graded=True)

class TestSubmissionDetailView(generics.RetrieveAPIView):
    queryset = TestSubmission.objects.all()
    serializer_class = TestSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

# Module CRUD
class ModuleListView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Note CRUD
class NoteListView(generics.ListCreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

# ChatMessage CRUD
class ChatMessageListView(generics.ListCreateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChatMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

# Analytics/Stats
class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user=user)
        completed_courses = enrollments.filter(completed=True).count()
        progress = UserProgress.objects.filter(user=user, completed=True).count()
        return Response({
            'completed_courses': completed_courses,
            'completed_lessons': progress,
        })

# AI Feedback (placeholder)
class AIFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # TODO: Integrate OpenAI or similar service
        code = request.data.get('code')
        language = request.data.get('language', 'python')
        return Response({'feedback': f'AI feedback for {language} code (placeholder).', 'suggestions': []})

# Judge0 Code Execution (placeholder)
class CodeExecutionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # TODO: Integrate Judge0 API
        code = request.data.get('code')
        language = request.data.get('language', 'python')
        return Response({'stdout': 'Output placeholder', 'stderr': '', 'success': True})

# File upload for PDF extraction (placeholder)
class PDFUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # TODO: Integrate PDF extraction logic
        file = request.FILES['file']
        return Response({'filename': file.name, 'message': 'PDF received'}, status=200)

# Home Overview
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def home_overview(request):
    # Dummy user data
    user_id = request.user.id
    # Dummy most recent course
    most_recent = {
        "id": 1,
        "title": "Full Stack Web Development",
        "progress": 65,
        "image": "https://source.unsplash.com/featured/?web,code",
    }
    # Dummy recommended courses
    recommended = [
        {"id": 2, "title": "Python for Data Science", "image": "https://source.unsplash.com/featured/?python,data", "progress": 0},
        {"id": 3, "title": "React Mastery", "image": "https://source.unsplash.com/featured/?react,frontend", "progress": 0},
    ]
    # Dummy trending courses
    trending = [
        {"id": 4, "title": "Machine Learning Basics", "image": "https://source.unsplash.com/featured/?machinelearning,ai", "progress": 0},
        {"id": 5, "title": "DevOps Essentials", "image": "https://source.unsplash.com/featured/?devops,cloud", "progress": 0},
    ]
    return Response({
        "most_recent": most_recent,
        "recommended": recommended,
        "trending": trending,
    })
