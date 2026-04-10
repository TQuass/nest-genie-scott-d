from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="NestGenie API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://0.0.0.0:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "nestgenie-api"}


@app.post("/api/v1/auth/request-otp")
async def request_otp(body: dict):
    phone = body.get("phone", "")
    return {"message": f"OTP sent to {phone}", "success": True}


@app.post("/api/v1/auth/verify-otp")
async def verify_otp(body: dict):
    code = body.get("code", "")
    if code == "123456":
        return {"redirect": "/app", "token": "demo_token"}
    return JSONResponse(status_code=401, content={"error": "Invalid code"})


@app.post("/api/v1/auth/logout")
async def logout():
    return {"success": True}


@app.get("/api/v1/families/me")
async def get_family():
    return {
        "children": [],
        "contacts": [],
        "consent_given": True,
        "onboarding_complete": False,
    }


@app.get("/api/v1/families/me/status")
async def get_family_status():
    return {
        "parent_name": "Parent",
        "phone_number": "+1 555 555 5555",
        "last_message_at": None,
        "channel_health": "active",
        "onboarding_complete": False,
    }


@app.get("/api/v1/families/me/connection")
async def get_connection():
    return {
        "sms": {"number": "+1 555 555 5555", "status": "active"},
        "email": {"from": "noreply@nestgenie.com", "status": "active"},
    }


@app.get("/api/v1/briefings")
async def list_briefings():
    return []


@app.get("/api/v1/outbound")
async def list_outbound():
    return []


@app.get("/api/v1/calendar")
async def get_calendar():
    return {"connected": False, "events": []}
