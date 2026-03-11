from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from routes import router
from models import engine, SessionLocal, Base, create_tables
import os

app = FastAPI(title="SkillPulse Lite API", version="1.0.0")

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

@app.get("/", tags=["root"])
async def root():
    html = """
    <html>
    <head>
        <title>SkillPulse Lite</title>
        <style>
            body { background-color: #212529; color: #F0F0F0; font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 2rem auto; padding: 1rem; background: #1b1e23; border-radius: 8px; }
            h1 { color: #0A9D8F; }
            p { line-height: 1.6; }
            a { color: #F4A261; text-decoration: none; }
            a:hover { text-decoration: underline; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 0.5rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>SkillPulse Lite</h1>
            <p>5‑minute micro‑lessons with instant, rule‑based feedback.</p>
            <h2>API Endpoints</h2>
            <ul>
                <li>GET /api/skills</li>
                <li>GET /api/lesson/today?skillId=</li>
                <li>POST /api/lesson/submit</li>
                <li>GET /api/progress</li>
                <li>POST /api/certificate/generate</li>
            </ul>
            <p>Tech Stack: <strong>Next.js 15</strong> + <strong>FastAPI 0.115</strong> + <strong>PostgreSQL / SQLite</strong> + <strong>DigitalOcean Serverless Inference (Llama‑2)</strong></p>
            <p><a href="/docs">OpenAPI Docs</a> | <a href="/redoc">ReDoc</a></p>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


@app.middleware("http")
async def normalize_api_prefix(request: Request, call_next):
    if request.scope.get("path", "").startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:] or "/"
    return await call_next(request)

app.include_router(router)

@app.on_event("startup")
async def on_startup():
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    # Create tables and seed data
    create_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
