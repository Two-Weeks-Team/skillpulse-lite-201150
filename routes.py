import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from models import SessionLocal, Skill, Lesson, LessonProgress
from ai_service import _call_inference
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Skills ------------------------------------------------------------
@router.get("/api/skills", tags=["skills"])
async def get_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    return {
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "icon": s.icon_url,
                "category": s.category,
            }
            for s in skills
        ]
    }

# --- Lesson Today ------------------------------------------------------
@router.get("/api/lesson/today", tags=["lesson"])
async def get_lesson_today(skillId: int, db: Session = Depends(get_db)):
    today = datetime.date.today()
    lesson = db.query(Lesson).filter(Lesson.skill_id == skillId, Lesson.date == today).first()
    if not lesson:
        # Create a placeholder lesson; in production call inference to generate content
        lesson = Lesson(
            skill_id=skillId,
            title=f"Micro‑lesson for skill {skillId} – {datetime.datetime.now().strftime('%Y-%m-%d')} ",
            content_text="You are learning how to work with data.",
            content_image="",
            exercise_prompt="Write a simple function that returns its input.",
            answer_key="def dup(x):\n    return x",
            hint="Make sure to use a return statement.",
            date=today,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "content_text": lesson.content_text,
        "content_image": lesson.content_image,
        "exercise_prompt": lesson.exercise_prompt,
        "hint": lesson.hint,
        "due_date": lesson.date.isoformat(),
    }

# --- Lesson Submit -----------------------------------------------------
@router.post("/api/lesson/submit", tags=["lesson"])
async def submit_lesson(
    lesson_id: int = Body(..., embed=True),
    answer: str = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    # Simple exact match check
    if answer.strip() == lesson.answer_key.strip():
        status = "correct"
        feedback = "Correct ✅"
    else:
        status = "incorrect"
        # Call AI for hint
        messages = [
            {
                "role": "system",
                "content": "You are a helpful tutor providing concise hints for incorrect answers. Keep hints under 30 words.",
            },
            {
                "role": "user",
                "content": f"Exercise: {lesson.exercise_prompt}\nAnswer: {answer}\nCorrect answer: {lesson.answer_key}",
            },
        ]
        ai_response = await _call_inference(messages, max_tokens=128)
        hint = ai_response.get("hint", lesson.hint or "Try again – review the exercise.")
        feedback = f"Try again – hint: {hint}"
    # Store progress (simple overwrite for demo)
    progress = db.query(LessonProgress).filter(LessonProgress.lesson_id == lesson_id).first()
    if not progress:
        progress = LessonProgress(
            lesson_id=lesson_id, status=status, updated_at=datetime.date.today()
        )
        db.add(progress)
    else:
        progress.status = status
        progress.updated_at = datetime.date.today()
    db.commit()
    return {
        "status": status,
        "feedback": feedback,
        "badge_awarded": False,
        "current_streak": 0,
        "next_reward_in": 7,
    }

# --- Progress -----------------------------------------------------------
@router.get("/api/progress", tags=["progress"])
async def get_progress(db: Session = Depends(get_db)):
    # Dummy progress data
    return {
        "current_streak": 3,
        "total_lessons_completed": 5,
        "badge_image": "https://example.com/badges/demo.png",
        "heatmap": [
            {"date": "2026-03-01", "completed": True},
            {"date": "2026-03-02", "completed": False},
        ],
    }

# --- Certificate Generation ---------------------------------------------
@router.post("/api/certificate/generate", tags=["certificate"])
async def generate_certificate(streak: int = Body(..., embed=True), skill_id: int = Body(..., embed=True)):
    # Dummy certificate URL
    cert_url = f"https://example.com/certificates/{streak}-{skill_id}.pdf?expires=3600"
    return {
        "certificate_url": cert_url,
        "download_url": cert_url.replace("?expires=3600", ""),
        "share_links": {
            "linkedin": f"https://www.linkedin.com/shareArticle?mini=true&url={cert_url}",
            "pdf": cert_url,
        },
    }
