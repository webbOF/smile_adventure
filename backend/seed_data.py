"""
Seed Data for Testing - Task 13 Database Migration Setup
Creates initial test data for users, children, professionals, and related tables
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Import models
from app.auth.models import User, UserRole, UserStatus
from app.users.models import Child, Activity, GameSession, Assessment, ProfessionalProfile

# Database configuration
DATABASE_URL = "postgresql://smileuser:smilepass123@localhost:5434/smile_adventure"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_database_session():
    """Create database session"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def create_seed_data():
    """Create comprehensive seed data for testing"""
    
    print("🌱 Creating seed data for Smile Adventure...")
    
    db = create_database_session()
    
    try:
        # =============================================================================
        # USERS - Parents and Professionals
        # =============================================================================
        
        print("  📧 Creating users...")
        
        # Parent User 1
        parent1 = User(
            email="parent1@example.com",
            hashed_password=hash_password("Parent123!"),
            first_name="Sarah",
            last_name="Johnson",
            full_name="Sarah Johnson",
            phone="5551234567",
            role=UserRole.PARENT,
            status=UserStatus.ACTIVE,
            is_active=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
            timezone="EST",
            language="en"
        )
        
        # Parent User 2
        parent2 = User(
            email="parent2@example.com",
            hashed_password=hash_password("Parent456!"),
            first_name="Michael",
            last_name="Chen",
            full_name="Michael Chen",
            phone="5552345678",
            role=UserRole.PARENT,
            status=UserStatus.ACTIVE,
            is_active=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
            timezone="PST",
            language="en"
        )
        
        # Professional User 1 - Pediatric Dentist
        professional1 = User(
            email="dr.smith@dentalcare.com",
            hashed_password=hash_password("Doctor123!"),
            first_name="Dr. Emily",
            last_name="Smith",
            full_name="Dr. Emily Smith",
            phone="5553456789",
            role=UserRole.PROFESSIONAL,
            status=UserStatus.ACTIVE,
            is_active=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
            license_number="DDS12345",
            specialization="Pediatric Dentistry",
            clinic_name="SmileCare Pediatric Dentistry",
            clinic_address="123 Healthcare Ave, Medical City, MC 12345",
            timezone="EST",
            language="en"
        )
        
        # Professional User 2 - Child Psychologist
        professional2 = User(
            email="dr.wilson@childpsych.com",
            hashed_password=hash_password("Psych789!"),
            first_name="Dr. David",
            last_name="Wilson",
            full_name="Dr. David Wilson",
            phone="5554567890",
            role=UserRole.PROFESSIONAL,
            status=UserStatus.ACTIVE,
            is_active=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
            license_number="PSY67890",
            specialization="Child Psychology",
            clinic_name="Children's Mental Health Center",
            clinic_address="456 Wellness Blvd, Health City, HC 67890",
            timezone="CST",
            language="en"
        )
        
        # Admin User
        admin = User(
            email="admin@smileadventure.com",
            hashed_password=hash_password("Admin123!"),
            first_name="System",
            last_name="Administrator",
            full_name="System Administrator",
            phone="5555555555",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            is_active=True,
            is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
            timezone="UTC",
            language="en"
        )
        
        # Add users to session
        users = [parent1, parent2, professional1, professional2, admin]
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"    ✅ Created {len(users)} users")
        
        # =============================================================================
        # CHILDREN - ASD-focused profiles
        # =============================================================================
        
        print("  👶 Creating children profiles...")
        
        # Child 1 - Emma (Sarah's daughter)
        child1 = Child(
            name="Emma Johnson",
            age=7,
            date_of_birth=datetime(2018, 3, 15),
            avatar_url="https://example.com/avatars/emma.png",
            parent_id=parent1.id,
            points=150,
            level=3,
            achievements=["first_login", "dental_brave", "weekly_progress"],
            diagnosis="Autism Spectrum Disorder - Level 1",
            support_level=1,
            diagnosis_date=datetime(2021, 8, 20),
            diagnosing_professional="Dr. Jennifer Martinez, M.D.",
            sensory_profile={
                "auditory": {"sensitivity": "high", "preferences": ["soft music", "nature sounds"]},
                "visual": {"sensitivity": "moderate", "triggers": ["flashing lights", "bright colors"]},
                "tactile": {"sensitivity": "high", "preferred_textures": ["soft fabrics", "smooth surfaces"]},
                "vestibular": {"sensitivity": "low", "activities": ["swinging", "spinning"]},
                "proprioceptive": {"needs": "high", "activities": ["deep pressure", "heavy work"]},
                "gustatory": {"sensitivity": "high", "preferences": ["mild flavors", "familiar foods"]}
            },
            behavioral_notes="Emma responds well to visual schedules and prefers quiet environments. She has excellent memory for routines.",
            communication_style="Verbal with some echolalia",
            communication_notes="Uses complete sentences but sometimes repeats phrases. Prefers direct, clear instructions.",
            current_therapies=["Applied Behavior Analysis", "Speech Therapy", "Occupational Therapy"],
            emergency_contacts=[
                {"name": "Sarah Johnson", "relation": "Mother", "phone": "5551234567"},
                {"name": "Tom Johnson", "relation": "Father", "phone": "5551234568"},
                {"name": "Mary Johnson", "relation": "Grandmother", "phone": "5551234569"}
            ],
            safety_protocols={
                "elopement_risk": "low",
                "medical_conditions": ["Autism Spectrum Disorder"],
                "medications": [],
                "emergency_procedures": ["Remain calm", "Use visual cues", "Provide quiet space"],
                "calming_strategies": ["Deep breathing", "Counting to 10", "Favorite stuffed animal"]
            },
            baseline_assessment={
                "communication": 7,
                "social_skills": 6,
                "daily_living": 8,
                "motor_skills": 7,
                "cognitive": 9
            },
            last_assessment_date=datetime.now(timezone.utc) - timedelta(days=30),
            progress_notes=[
                {
                    "date": "2025-05-15",
                    "note": "Emma showed significant improvement in dental anxiety management",
                    "author": "Dr. Smith"
                }
            ]
        )
        
        # Child 2 - Alex (Michael's son)
        child2 = Child(
            name="Alex Chen",
            age=5,
            date_of_birth=datetime(2020, 7, 8),
            avatar_url="https://example.com/avatars/alex.png",
            parent_id=parent2.id,
            points=75,
            level=2,
            achievements=["first_session", "calm_appointment"],
            diagnosis="Autism Spectrum Disorder - Level 2",
            support_level=2,
            diagnosis_date=datetime(2023, 2, 10),
            diagnosing_professional="Dr. Lisa Wang, M.D.",
            sensory_profile={
                "auditory": {"sensitivity": "high", "preferences": ["classical music", "white noise"]},
                "visual": {"sensitivity": "high", "triggers": ["fluorescent lights", "busy patterns"]},
                "tactile": {"sensitivity": "high", "preferred_textures": ["weighted blankets", "fidget toys"]},
                "vestibular": {"sensitivity": "moderate", "activities": ["gentle rocking"]},
                "proprioceptive": {"needs": "high", "activities": ["compression vest", "bear hugs"]},
                "gustatory": {"sensitivity": "high", "preferences": ["bland foods", "specific brands"]}
            },
            behavioral_notes="Alex is non-verbal but communicates through pictures and gestures. Requires consistent routines.",
            communication_style="Non-verbal with picture communication",
            communication_notes="Uses PECS (Picture Exchange Communication System) and some sign language.",
            current_therapies=["ABA", "Speech Therapy", "Occupational Therapy", "Physical Therapy"],
            emergency_contacts=[
                {"name": "Michael Chen", "relation": "Father", "phone": "5552345678"},
                {"name": "Linda Chen", "relation": "Mother", "phone": "5552345679"},
                {"name": "James Chen", "relation": "Uncle", "phone": "5552345680"}
            ],
            safety_protocols={
                "elopement_risk": "moderate",
                "medical_conditions": ["Autism Spectrum Disorder", "Sensory Processing Disorder"],
                "medications": ["Melatonin 1mg (bedtime)"],
                "emergency_procedures": ["Use picture cards", "Provide sensory breaks", "Contact parents immediately"],
                "calming_strategies": ["Weighted lap pad", "Preferred music", "Dimmed lights"]
            },
            baseline_assessment={
                "communication": 3,
                "social_skills": 4,
                "daily_living": 5,
                "motor_skills": 6,
                "cognitive": 7
            },
            last_assessment_date=datetime.now(timezone.utc) - timedelta(days=45),
            progress_notes=[
                {
                    "date": "2025-04-20",
                    "note": "Alex successfully completed first dental cleaning with minimal distress",
                    "author": "Dr. Smith"
                }
            ]
        )
        
        # Add children
        children = [child1, child2]
        for child in children:
            db.add(child)
        
        db.commit()
        print(f"    ✅ Created {len(children)} children profiles")
        
        # =============================================================================
        # PROFESSIONAL PROFILES
        # =============================================================================
        
        print("  👩‍⚕️ Creating professional profiles...")
        
        # Professional Profile 1 - Dr. Smith
        prof_profile1 = ProfessionalProfile(
            user_id=professional1.id,
            license_type="Doctor of Dental Surgery (DDS)",
            license_number="DDS12345",
            license_state="CA",
            license_expiry=datetime(2026, 12, 31),
            primary_specialty="Pediatric Dentistry",
            subspecialties=["Special Needs Dentistry", "Sedation Dentistry"],
            certifications=["Board Certified Pediatric Dentist", "Autism Spectrum Disorder Specialist"],
            years_experience=12,
            clinic_name="SmileCare Pediatric Dentistry",
            clinic_address="123 Healthcare Ave, Medical City, MC 12345",
            clinic_phone="5553456789",
            asd_experience_years=8,
            asd_certifications=["ASD Healthcare Certificate", "Sensory-Friendly Care Training"],
            preferred_age_groups=["3-6 years", "7-12 years", "13-18 years"],
            treatment_approaches=["Applied Behavior Analysis", "Visual Supports", "Sensory Accommodations"],
            bio="Dr. Smith specializes in providing gentle, compassionate dental care for children with autism spectrum disorder and other special needs.",
            treatment_philosophy="Every child deserves a positive healthcare experience. I believe in taking the time to understand each child's unique needs.",
            languages_spoken=["English", "Spanish"],
            accepts_new_patients=True,
            is_verified=True,
            verified_at=datetime.now(timezone.utc),
            verified_by=admin.id
        )
        
        # Professional Profile 2 - Dr. Wilson
        prof_profile2 = ProfessionalProfile(
            user_id=professional2.id,
            license_type="Licensed Clinical Psychologist",
            license_number="PSY67890",
            license_state="TX",
            license_expiry=datetime(2025, 8, 15),
            primary_specialty="Child Psychology",
            subspecialties=["Autism Spectrum Disorders", "Behavioral Interventions"],
            certifications=["Board Certified Clinical Psychologist", "BCBA Certification"],
            years_experience=15,
            clinic_name="Children's Mental Health Center",
            clinic_address="456 Wellness Blvd, Health City, HC 67890",
            clinic_phone="5554567890",
            asd_experience_years=12,
            asd_certifications=["Board Certified Behavior Analyst", "Autism Diagnostic Training"],
            preferred_age_groups=["2-5 years", "6-12 years", "13-18 years"],
            treatment_approaches=["Applied Behavior Analysis", "Cognitive Behavioral Therapy", "Parent Training"],
            bio="Dr. Wilson has dedicated his career to helping children with autism spectrum disorder and their families achieve their full potential.",
            treatment_philosophy="Evidence-based interventions combined with family-centered care create the best outcomes for children with ASD.",
            languages_spoken=["English"],
            accepts_new_patients=True,
            is_verified=True,
            verified_at=datetime.now(timezone.utc),
            verified_by=admin.id
        )
        
        # Add professional profiles
        prof_profiles = [prof_profile1, prof_profile2]
        for profile in prof_profiles:
            db.add(profile)
        
        db.commit()
        print(f"    ✅ Created {len(prof_profiles)} professional profiles")
        
        # =============================================================================
        # ACTIVITIES - Sample activity tracking
        # =============================================================================
        
        print("  🎮 Creating activity records...")
        
        # Activities for Emma
        activity1 = Activity(
            child_id=child1.id,
            activity_type="dental_preparation",
            activity_name="Virtual Dental Office Tour",
            description="Interactive tour of the dental office to reduce anxiety",
            category="preparation",
            points_earned=15,
            difficulty_level=2,
            started_at=datetime.now(timezone.utc) - timedelta(days=7),
            completed_at=datetime.now(timezone.utc) - timedelta(days=7, hours=-1),
            duration_minutes=30,
            emotional_state_before="anxious",
            emotional_state_after="calm",
            anxiety_level_before=8,
            anxiety_level_after=4,
            support_level_needed="minimal",
            support_provided_by="Parent with therapist guidance",
            assistive_technology_used=["iPad with communication app"],
            environment_type="home",
            environmental_modifications=["Quiet room", "Dimmed lights"],
            sensory_accommodations=["Noise-canceling headphones", "Weighted lap pad"],
            completion_status="completed",
            success_rating=8,
            challenges_encountered=["Initial resistance to new activity"],
            strategies_used=["Visual schedule", "Preferred rewards"],
            notes="Emma responded well to the virtual tour and asked questions about the dental equipment",
            verified_by_parent=True,
            verified_by_professional=True,
            verification_notes="Great progress in anxiety reduction",
            data_source="app_activity"
        )
        
        # Activities for Alex
        activity2 = Activity(
            child_id=child2.id,
            activity_type="communication",
            activity_name="Dental Vocabulary Pictures",
            description="Learning dental-related vocabulary through pictures",
            category="education",
            points_earned=10,
            difficulty_level=1,
            started_at=datetime.now(timezone.utc) - timedelta(days=5),
            completed_at=datetime.now(timezone.utc) - timedelta(days=5, hours=-1),
            duration_minutes=20,
            emotional_state_before="neutral",
            emotional_state_after="engaged",
            anxiety_level_before=3,
            anxiety_level_after=2,
            support_level_needed="moderate",
            support_provided_by="Parent",
            assistive_technology_used=["PECS communication book", "iPad"],
            environment_type="home",
            environmental_modifications=["Structured workspace", "Visual schedule"],
            sensory_accommodations=["Fidget toy available"],
            completion_status="completed",
            success_rating=7,
            challenges_encountered=["Difficulty with some vocabulary"],
            strategies_used=["Repetition", "Visual cues", "Positive reinforcement"],
            notes="Alex successfully identified 8 out of 10 dental vocabulary pictures",
            verified_by_parent=True,
            verified_by_professional=False,
            verification_notes="",
            data_source="manual_entry"
        )
        
        # Add activities
        activities = [activity1, activity2]
        for activity in activities:
            db.add(activity)
        
        db.commit()
        print(f"    ✅ Created {len(activities)} activity records")
        
        # =============================================================================
        # GAME SESSIONS - Virtual reality/game data
        # =============================================================================
        
        print("  🎯 Creating game session records...")
        
        # Game session for Emma
        game_session1 = GameSession(
            child_id=child1.id,
            session_type="dental_preparation",
            scenario_name="Friendly Dentist Adventure",
            scenario_id="dental_office_v1",
            device_type="tablet",
            started_at=datetime.now(timezone.utc) - timedelta(days=3),
            ended_at=datetime.now(timezone.utc) - timedelta(days=3, hours=-1),
            duration_seconds=1800,  # 30 minutes
            levels_completed=3,
            max_level_reached=3,
            score=85,
            interactions_count=45,
            correct_responses=38,
            help_requests=7,
            emotional_data={
                "start_emotion": "nervous",
                "end_emotion": "proud",
                "emotion_changes": ["nervous", "curious", "engaged", "proud"]
            },
            interaction_patterns={
                "preferred_interactions": ["touch", "voice_commands"],
                "avoided_interactions": ["sudden_sounds"],
                "response_time_avg": 3.2
            },
            completion_status="completed",
            exit_reason="successful_completion",
            achievement_unlocked=["brave_patient", "curiosity_explorer"],
            parent_notes="Emma was excited to show me what she learned",
            parent_rating=9,
            parent_observed_behavior=["increased_confidence", "asking_questions"],
            app_version="1.2.3",
            session_data_quality="high"
        )
        
        # Game session for Alex
        game_session2 = GameSession(
            child_id=child2.id,
            session_type="communication",
            scenario_name="Picture Communication Builder",
            scenario_id="pecs_training_v2",
            device_type="tablet",
            started_at=datetime.now(timezone.utc) - timedelta(days=1),
            ended_at=datetime.now(timezone.utc) - timedelta(days=1, hours=-1),
            duration_seconds=900,  # 15 minutes
            levels_completed=2,
            max_level_reached=2,
            score=70,
            interactions_count=25,
            correct_responses=18,
            help_requests=12,
            emotional_data={
                "start_emotion": "calm",
                "end_emotion": "satisfied",
                "emotion_changes": ["calm", "focused", "satisfied"]
            },
            interaction_patterns={
                "preferred_interactions": ["visual_selection", "drag_drop"],
                "avoided_interactions": ["audio_prompts"],
                "response_time_avg": 5.8
            },
            completion_status="completed",
            exit_reason="session_timer",
            achievement_unlocked=["communication_star"],
            parent_notes="Alex stayed focused for the entire session",
            parent_rating=8,
            parent_observed_behavior=["maintained_attention", "self_directed"],
            app_version="1.2.3",
            session_data_quality="good"
        )
        
        # Add game sessions
        game_sessions = [game_session1, game_session2]
        for session in game_sessions:
            db.add(session)
        
        db.commit()
        print(f"    ✅ Created {len(game_sessions)} game session records")
        
        # =============================================================================
        # ASSESSMENTS - Formal evaluations
        # =============================================================================
        
        print("  📊 Creating assessment records...")
        
        # Assessment for Emma
        assessment1 = Assessment(
            child_id=child1.id,
            assessment_type="progress_evaluation",
            assessment_name="6-Month Progress Review",
            version="2.1",
            administered_by="Dr. Emily Smith, DDS",
            administered_date=datetime.now(timezone.utc) - timedelta(days=30),
            location="SmileCare Pediatric Dentistry",
            raw_scores={
                "anxiety_scale": 3,
                "cooperation_level": 8,
                "communication_effectiveness": 9,
                "sensory_tolerance": 7
            },
            standard_scores={
                "anxiety_percentile": 25,
                "cooperation_percentile": 85,
                "communication_percentile": 95,
                "sensory_percentile": 70
            },
            percentiles={
                "overall_progress": 82,
                "dental_readiness": 88,
                "social_interaction": 75
            },
            age_equivalents={
                "communication": "8 years 2 months",
                "social_skills": "7 years 8 months",
                "self_regulation": "7 years 6 months"
            },
            interpretation="Emma has shown significant progress in managing dental anxiety and communicating her needs during medical appointments.",
            recommendations=[
                "Continue with virtual reality preparation sessions",
                "Maintain consistent pre-appointment routines",
                "Consider graduated exposure to dental sounds"
            ],
            goals_identified=[
                "Reduce dental anxiety to mild level",
                "Increase independent communication during appointments",
                "Develop coping strategies for unexpected situations"
            ],
            areas_of_growth=[
                "Significant improvement in dental anxiety management",
                "Enhanced communication during medical procedures",
                "Better self-regulation skills"
            ],
            areas_of_concern=[
                "Still some sensitivity to dental equipment sounds",
                "Needs support with unexpected changes in routine"
            ],
            status="completed"
        )
        
        # Assessment for Alex
        assessment2 = Assessment(
            child_id=child2.id,
            assessment_type="baseline_assessment",
            assessment_name="Initial Medical Care Assessment",
            version="1.5",
            administered_by="Dr. David Wilson, Ph.D.",
            administered_date=datetime.now(timezone.utc) - timedelta(days=60),
            location="Children's Mental Health Center",
            raw_scores={
                "communication_attempts": 15,
                "task_completion": 6,
                "sensory_regulation": 4,
                "social_engagement": 3
            },
            standard_scores={
                "communication_age_equivalent": 30,
                "adaptive_behavior": 45,
                "sensory_processing": 35,
                "social_skills": 25
            },
            percentiles={
                "overall_functioning": 35,
                "medical_tolerance": 20,
                "family_adaptation": 70
            },
            age_equivalents={
                "communication": "3 years 2 months",
                "social_skills": "2 years 8 months",
                "daily_living": "4 years 1 month"
            },
            interpretation="Alex demonstrates significant challenges with medical environments but shows strong potential for improvement with appropriate supports.",
            recommendations=[
                "Implement comprehensive desensitization program",
                "Use visual supports and social stories",
                "Gradual exposure to medical equipment and sounds",
                "Parent training on supportive strategies"
            ],
            goals_identified=[
                "Increase tolerance for medical environments",
                "Develop functional communication for medical needs",
                "Reduce stress responses during medical procedures"
            ],
            areas_of_growth=[
                "Strong family support system",
                "Responds well to visual cues",
                "Shows interest in cause-and-effect activities"
            ],
            areas_of_concern=[
                "High sensory sensitivities",
                "Limited communication in stressful situations",
                "Significant medical procedure anxiety"
            ],
            status="completed"
        )
        
        # Add assessments
        assessments = [assessment1, assessment2]
        for assessment in assessments:
            db.add(assessment)
        
        db.commit()
        print(f"    ✅ Created {len(assessments)} assessment records")
        
        # =============================================================================
        # SUMMARY
        # =============================================================================
        
        print("\n✅ Seed data creation completed successfully!")
        print(f"   📊 Summary:")
        print(f"   • Users: {len(users)} (2 parents, 2 professionals, 1 admin)")
        print(f"   • Children: {len(children)} (with comprehensive ASD profiles)")
        print(f"   • Professional Profiles: {len(prof_profiles)} (verified)")
        print(f"   • Activities: {len(activities)} (with detailed tracking)")
        print(f"   • Game Sessions: {len(game_sessions)} (with analytics)")
        print(f"   • Assessments: {len(assessments)} (formal evaluations)")
        print("\n🔐 Test Login Credentials:")
        print("   Parent 1: parent1@example.com / Parent123!")
        print("   Parent 2: parent2@example.com / Parent456!")
        print("   Professional 1: dr.smith@dentalcare.com / Doctor123!")
        print("   Professional 2: dr.wilson@childpsych.com / Psych789!")
        print("   Admin: admin@smileadventure.com / Admin123!")
        
    except Exception as e:
        print(f"❌ Error creating seed data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
