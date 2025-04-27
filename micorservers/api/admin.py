from django.contrib import admin
from .models import Course, Lesson, Enrollment, Challenge, Submission, MCQ, LearningPath, UserProgress

# Register your models here.
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(Challenge)
admin.site.register(Submission)
admin.site.register(MCQ)
admin.site.register(LearningPath)
admin.site.register(UserProgress)
