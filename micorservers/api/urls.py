from django.urls import path
from .views import (
    HealthCheckView,
    RegisterView, LoginView, LogoutView,
    UserListView, UserDetailView, UserProfileView, UserStatsView, UserSubmissionsView,
    CourseListView, CourseDetailView, CourseEnrollView, CourseSearchView, CourseChallengesView, CourseLessonsView,
    LessonListView, LessonDetailView, LessonMCQsView,
    EnrollmentListView, EnrollmentDetailView,
    ChallengeListView, ChallengeDetailView,
    SubmissionListView, SubmissionDetailView, SubmitCodeView,
    MCQListView, MCQDetailView,
    LearningPathListView, LearningPathDetailView,
    UserProgressListView, UserProgressDetailView,
    PDFUploadView,
    AIFeedbackView, CodeExecutionView,
    CourseReviewListCreateView, CourseReviewDetailView,
    TestListCreateView, TestDetailView,
    TestSubmissionListCreateView, TestSubmissionDetailView,
    CurrentUserView,  
    ModuleListView, ModuleDetailView,  # Add this line
    NoteListView, NoteDetailView,  # Add this line
    ChatMessageListView, ChatMessageDetailView,  # Add this line
    home_overview  # Add this line
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),  

    # User endpoints
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/me/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/me/stats/', UserStatsView.as_view(), name='user-stats'),
    path('users/me/submissions/', UserSubmissionsView.as_view(), name='user-submissions'),

    # Course endpoints
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/enroll/', CourseEnrollView.as_view(), name='course-enroll'),
    path('courses/search/', CourseSearchView.as_view(), name='course-search'),
    path('courses/<int:course_id>/challenges/', CourseChallengesView.as_view(), name='course-challenges'),
    path('courses/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='course-lessons'),

    # Lesson endpoints
    path('lessons/', LessonListView.as_view(), name='lesson-list'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:lesson_id>/mcqs/', LessonMCQsView.as_view(), name='lesson-mcqs'),

    # Enrollment endpoints
    path('enrollments/', EnrollmentListView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', EnrollmentDetailView.as_view(), name='enrollment-detail'),

    # Challenge endpoints
    path('challenges/', ChallengeListView.as_view(), name='challenge-list'),
    path('challenges/<int:pk>/', ChallengeDetailView.as_view(), name='challenge-detail'),

    # Submission endpoints
    path('submissions/', SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
    path('challenges/<int:challenge_id>/submit/', SubmitCodeView.as_view(), name='submit-code'),

    # MCQ endpoints
    path('mcqs/', MCQListView.as_view(), name='mcq-list'),
    path('mcqs/<int:pk>/', MCQDetailView.as_view(), name='mcq-detail'),

    # LearningPath endpoints
    path('learning-paths/', LearningPathListView.as_view(), name='learningpath-list'),
    path('learning-paths/<int:pk>/', LearningPathDetailView.as_view(), name='learningpath-detail'),

    # UserProgress endpoints
    path('progress/', UserProgressListView.as_view(), name='userprogress-list'),
    path('progress/<int:pk>/', UserProgressDetailView.as_view(), name='userprogress-detail'),

    # PDF upload
    path('pdf/upload/', PDFUploadView.as_view(), name='pdf-upload'),

    # AI Feedback & Code Execution
    path('ai/feedback/', AIFeedbackView.as_view(), name='ai-feedback'),
    path('code/execute/', CodeExecutionView.as_view(), name='code-execute'),

    # Course Review endpoints
    path('courses/<int:course_id>/reviews/', CourseReviewListCreateView.as_view(), name='course-review-list-create'),
    path('reviews/<int:pk>/', CourseReviewDetailView.as_view(), name='course-review-detail'),

    # Test endpoints
    path('courses/<int:course_id>/tests/', TestListCreateView.as_view(), name='test-list-create'),
    path('tests/<int:pk>/', TestDetailView.as_view(), name='test-detail'),

    # Test Submission endpoints
    path('tests/<int:test_id>/submissions/', TestSubmissionListCreateView.as_view(), name='testsubmission-list-create'),
    path('testsubmissions/<int:pk>/', TestSubmissionDetailView.as_view(), name='testsubmission-detail'),

    # Module endpoints
    path('modules/', ModuleListView.as_view(), name='module-list'),
    path('modules/<int:pk>/', ModuleDetailView.as_view(), name='module-detail'),

    # Note endpoints
    path('notes/', NoteListView.as_view(), name='note-list'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),

    # ChatMessage endpoints
    path('chats/', ChatMessageListView.as_view(), name='chatmessage-list'),
    path('chats/<int:pk>/', ChatMessageDetailView.as_view(), name='chatmessage-detail'),

    # Home endpoint
    path('home/', home_overview, name='home-overview'),
]
# TODO: Add routes for code execution, AI feedback, PDF extraction, etc.
