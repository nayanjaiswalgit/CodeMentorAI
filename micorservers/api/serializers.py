from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Lesson, Enrollment, Challenge, Submission, MCQ, LearningPath, UserProgress, CourseReview, Test, TestSubmission, Module, Note, ChatMessage

# Example serializer
class ExampleSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)

class UserSerializer(serializers.ModelSerializer):
    displayName = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'displayName']

    def get_displayName(self, obj):
        return obj.get_full_name() or obj.username

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    class Meta:
        model = Course
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class MCQSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQ
        fields = '__all__'

class LearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'

class CourseReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = CourseReview
        fields = '__all__'

class TestSerializer(serializers.ModelSerializer):
    mcqs = MCQSerializer(many=True, read_only=True)
    class Meta:
        model = Test
        fields = '__all__'

class TestSubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    test = TestSerializer(read_only=True)
    class Meta:
        model = TestSubmission
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChatMessage
        fields = '__all__'
