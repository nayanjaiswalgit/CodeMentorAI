from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Course, Lesson, Enrollment, Challenge, MCQ, LearningPath, UserProgress

class Command(BaseCommand):
    help = 'Seed the database with demo data for development'

    def handle(self, *args, **kwargs):
        # Create users
        user1, _ = User.objects.get_or_create(username='nayan', defaults={'email': 'admin@example.com'})
        user1.set_password('admin')
        user1.save()
        user2, _ = User.objects.get_or_create(username='user', defaults={'email': 'user@example.com'})
        user2.set_password('userpass')
        user2.save()

        # Create courses
        course1 = Course.objects.create(title='Python Basics', description='Intro to Python', instructor=user1)
        course2 = Course.objects.create(title='Advanced Django', description='Deep dive into Django', instructor=user2)

        # Create lessons
        lesson1 = Lesson.objects.create(course=course1, title='Variables', content='Python variables...', order=1)
        lesson2 = Lesson.objects.create(course=course1, title='Loops', content='For and while loops...', order=2)
        lesson3 = Lesson.objects.create(course=course2, title='ORM', content='Django ORM...', order=1)

        # Enrollments
        Enrollment.objects.get_or_create(user=user1, course=course1)
        Enrollment.objects.get_or_create(user=user2, course=course1)
        Enrollment.objects.get_or_create(user=user2, course=course2)

        # Challenges
        challenge1 = Challenge.objects.create(lesson=lesson1, title='Print Hello', description='Print Hello World', expected_output='Hello World', test_cases=[{"input": "", "output": "Hello World"}], order=1)
        challenge2 = Challenge.objects.create(lesson=lesson2, title='Sum Numbers', description='Sum two numbers', expected_output='3', test_cases=[{"input": "1 2", "output": "3"}], order=1)

        # MCQs
        MCQ.objects.create(lesson=lesson1, question='What is a variable?', options=["A value", "A container", "A function"], answer="A container")
        MCQ.objects.create(lesson=lesson2, question='Which loop is not in Python?', options=["for", "while", "repeat"], answer="repeat")

        # Learning Path
        lp = LearningPath.objects.create(user=user1)
        lp.courses.add(course1, course2)

        # User Progress
        UserProgress.objects.create(user=user1, lesson=lesson1, completed=True)
        UserProgress.objects.create(user=user1, lesson=lesson2, completed=False)

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))
