import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Resolve database URL with schema fix
_raw_url = os.getenv("DATABASE_URL", os.getenv("POSTGRES_URL", "sqlite:///./app.db"))
if _raw_url.startswith("postgresql+asyncpg://"):
    url = _raw_url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
elif _raw_url.startswith("postgres://"):
    url = _raw_url.replace("postgres://", "postgresql+psycopg://", 1)
else:
    url = _raw_url

# Determine SSL mode for non‑local, non‑sqlite connections
connect_args = {}
if "/localhost" not in url and "sqlite://" not in url:
    connect_args["sslmode"] = "require"

engine = create_engine(url, connect_args=connect_args, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()

# Prefix for tables: sp_
class Skill(Base):
    __tablename__ = "sp_skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    icon_url = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True)
    lessons = relationship("Lesson", back_populates="skill")

class Lesson(Base):
    __tablename__ = "sp_lessons"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("sp_skills.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content_text = Column(Text, nullable=False)
    content_image = Column(String(255), nullable=True)
    exercise_prompt = Column(Text, nullable=False)
    answer_key = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    date = Column(Date, nullable=False)

    skill = relationship("Skill", back_populates="lessons")

# Simple progress table per lesson for demonstration (no user column)
class LessonProgress(Base):
    __tablename__ = "sp_lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("sp_lessons.id"), unique=True, nullable=False)
    status = Column(String(20), nullable=False)  # "correct" or "incorrect"
    updated_at = Column(Date, nullable=False)

    lesson = relationship("Lesson")


def create_tables():
    Base.metadata.create_all(bind=engine)
    # Seed default skills if none exist
    with SessionLocal() as session:
        if session.query(Skill).count() == 0:
            default_skills = [
                {
                    "name": "Python Basics",
                    "description": "Variables, loops, functions",
                    "icon_url": "https://example.com/icons/python.svg",
                    "category": "Programming",
                },
                {
                    "name": "Excel Formulas",
                    "description": "Power functions & pivots",
                    "icon_url": "https://example.com/icons/excel.svg",
                    "category": "Analytics",
                },
                {
                    "name": "UI Color Theory",
                    "description": "Color palettes & contrast",
                    "icon_url": "https://example.com/icons/color.svg",
                    "category": "Design",
                },
            ]
            for sk in default_skills:
                skill = Skill(**sk)
                session.add(skill)
            session.commit()

# Debug helper to print engine URL
print(f"Database engine URL: {engine.url}")
