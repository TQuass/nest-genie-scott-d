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


@app.get("/api/v1/auth/me")
async def get_me():
    return {"phone": "+15555555555", "display_name": "Parent"}


# ── Families ────────────────────────────────────────────────────────────────

@app.get("/api/v1/families/me")
async def get_family():
    return {
        "children": [],
        "contacts": [],
        "consent_given": True,
        "onboarding_complete": False,
        "philosophy_hints": [],
        "philosophy_notes": "",
    }


@app.patch("/api/v1/families/me")
async def patch_family(body: dict):
    return {"success": True}


@app.delete("/api/v1/families/me")
async def delete_family():
    return {"success": True}


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
        "sms": {
            "number": "+1 555 555 5555",
            "status": "active",
            "a2p_status": "approved",
            "last_inbound": None,
        },
        "email": {
            "from": "noreply@nestgenie.com",
            "status": "active",
            "last_delivered": None,
        },
    }


@app.get("/api/v1/families/me/consent")
async def get_consent():
    return {"consent_given": True, "consent_at": "2026-04-10T00:00:00Z"}


@app.post("/api/v1/families/me/export")
async def export_data():
    return {"success": True, "message": "Export queued — download link will be emailed."}


@app.get("/api/v1/families/me/notification-preferences")
async def get_notif_prefs():
    return {
        "briefings": {"sms": True, "email": False},
        "reminders": {"sms": True, "email": False},
        "outbound_confirmations": {"sms": True, "email": False},
    }


@app.patch("/api/v1/families/me/notification-preferences")
async def patch_notif_prefs(body: dict):
    return {"success": True}


# ── Children ─────────────────────────────────────────────────────────────────

@app.get("/api/v1/families/me/children")
async def list_children():
    return []


@app.post("/api/v1/families/me/children")
async def create_child(body: dict):
    return {"id": "demo-child-1", **body}


@app.get("/api/v1/children/{child_id}")
async def get_child(child_id: str):
    return {
        "id": child_id,
        "name": "Demo Child",
        "birth_date": "2020-06-15",
        "allergies": [],
        "school": "",
        "routines": "",
        "notes": "",
    }


@app.patch("/api/v1/children/{child_id}")
async def patch_child(child_id: str, body: dict):
    return {"id": child_id, **body}


@app.delete("/api/v1/children/{child_id}")
async def delete_child(child_id: str):
    return {"success": True}


# ── Contacts ─────────────────────────────────────────────────────────────────

@app.get("/api/v1/families/me/contacts")
async def list_contacts():
    return []


@app.post("/api/v1/families/me/contacts")
async def create_contact(body: dict):
    return {"id": "demo-contact-1", "tcpa_consent": False, **body}


@app.get("/api/v1/contacts/{contact_id}")
async def get_contact(contact_id: str):
    return {
        "id": contact_id,
        "name": "Demo Contact",
        "relationship": "pediatrician",
        "phone_e164": "",
        "tcpa_consent": False,
    }


@app.patch("/api/v1/contacts/{contact_id}")
async def patch_contact(contact_id: str, body: dict):
    return {"id": contact_id, **body}


@app.delete("/api/v1/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    return {"success": True}


# ── Briefings ─────────────────────────────────────────────────────────────────

@app.get("/api/v1/briefings")
async def list_briefings():
    return []


@app.get("/api/v1/families/me/briefings")
async def list_family_briefings():
    return []


@app.get("/api/v1/briefings/{briefing_id}")
async def get_briefing(briefing_id: str):
    return {
        "id": briefing_id,
        "created_at": "2026-04-10T08:00:00Z",
        "channel": "sms",
        "body": "Good morning! Here's your family briefing for today...",
        "medical_flag": False,
    }


@app.delete("/api/v1/briefings/{briefing_id}")
async def delete_briefing(briefing_id: str):
    return {"success": True}


# ── Outbound ──────────────────────────────────────────────────────────────────

@app.get("/api/v1/outbound")
async def list_outbound():
    return []


@app.get("/api/v1/families/me/outbound")
async def list_family_outbound():
    return []


@app.get("/api/v1/outbound/{action_id}")
async def get_outbound(action_id: str):
    return {
        "id": action_id,
        "created_at": "2026-04-10T10:00:00Z",
        "contact_name": "Dr. Smith",
        "contact_relationship": "pediatrician",
        "contact_tcpa_consent": True,
        "draft_text": "Hi Dr. Smith, this is a message on behalf of the family...",
        "status": "pending",
    }


@app.post("/api/v1/outbound/confirm/{action_id}")
async def confirm_outbound(action_id: str):
    return {"success": True}


@app.post("/api/v1/outbound/decline/{action_id}")
async def decline_outbound(action_id: str):
    return {"success": True}


# ── Calendar ──────────────────────────────────────────────────────────────────

@app.get("/api/v1/calendar")
async def get_calendar():
    return {"connected": False, "events": []}


@app.get("/api/v1/families/me/calendar/status")
async def get_calendar_status():
    return {"connected": False}


@app.get("/api/v1/families/me/calendar/auth")
async def get_calendar_auth():
    return {"url": "https://accounts.google.com/o/oauth2/auth?..."}


@app.delete("/api/v1/families/me/calendar")
async def disconnect_calendar():
    return {"success": True}
