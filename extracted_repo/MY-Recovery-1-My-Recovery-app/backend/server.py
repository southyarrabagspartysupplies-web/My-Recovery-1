from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import io
import csv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'anchor-recovery-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ AUTH UTILITIES ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# ============ MODELS ============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    display_name: str
    timezone: str = "America/New_York"
    sponsor_name: Optional[str] = None
    sponsor_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    timer_minutes: int = 15
    sobriety_date: Optional[str] = None
    onboarded: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    display_name: str
    timezone: str
    sponsor_name: Optional[str] = None
    sponsor_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    timer_minutes: int
    sobriety_date: Optional[str] = None
    onboarded: bool

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class OnboardingData(BaseModel):
    timezone: str
    sponsor_name: Optional[str] = None
    sponsor_phone: Optional[str] = None
    timer_minutes: int = 15
    sobriety_date: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    sponsor_name: Optional[str] = None
    sponsor_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    timer_minutes: Optional[int] = None
    sobriety_date: Optional[str] = None

class CopingTool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    duration: str
    steps: List[str]
    when_to_use: str
    is_default: bool = True
    is_mandatory: bool = False

class CopingToolResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    duration: str
    steps: List[str]
    when_to_use: str
    is_favorited: bool = False
    is_mandatory: bool = False

class CravingSessionCreate(BaseModel):
    triggers: List[str]
    intensity: int
    need_type: Optional[str] = None
    started_at: Optional[str] = None

class CravingSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    triggers: List[str]
    intensity: int
    need_type: Optional[str] = None
    completed_at: Optional[str] = None
    outcome: Optional[str] = None

class CravingSessionComplete(BaseModel):
    outcome: str

class JournalEntryCreate(BaseModel):
    had_craving: bool
    triggers: List[str] = []
    intensity: Optional[int] = None
    tools_used: List[str] = []
    outcome: Optional[str] = None
    notes: str = ""

class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    had_craving: bool
    triggers: List[str]
    intensity: Optional[int]
    tools_used: List[str]
    outcome: Optional[str]
    notes: str

class CustomResource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    url: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomResourceCreate(BaseModel):
    title: str
    url: Optional[str] = None
    notes: Optional[str] = None

class ProgressStats(BaseModel):
    days_since_last_used: Optional[int]
    current_streak: int
    cravings_this_week: int
    avg_intensity_this_week: Optional[float]
    most_used_tools: List[dict]
    most_common_triggers: List[dict]

class JournalInsights(BaseModel):
    top_triggers: List[dict]
    most_helpful_tools: List[dict]
    total_entries: int

# ============ AUTH ENDPOINTS ============
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        display_name=user_data.display_name
    )
    user_dict = user.model_dump()
    user_dict['password'] = hashed_pw
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id})
    
    user_response = UserResponse(**user.model_dump())
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user['id']})
    user_response = UserResponse(**user)
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@api_router.post("/auth/onboarding")
async def complete_onboarding(data: OnboardingData, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {
            "timezone": data.timezone,
            "sponsor_name": data.sponsor_name,
            "sponsor_phone": data.sponsor_phone,
            "timer_minutes": data.timer_minutes,
            "sobriety_date": data.sobriety_date,
            "onboarded": True
        }}
    )
    return {"success": True}

# ============ USER SETTINGS ============
@api_router.patch("/user/settings")
async def update_settings(data: UserSettingsUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": update_data}
        )
    return {"success": True}

# ============ COPING TOOLS ============
@api_router.get("/coping-tools", response_model=List[CopingToolResponse])
async def get_coping_tools(current_user: dict = Depends(get_current_user)):
    tools = await db.coping_tools.find({}, {"_id": 0}).to_list(100)
    
    # Get user favorites
    favorites = await db.user_favorites.find_one({"user_id": current_user['id']}, {"_id": 0})
    favorited_ids = favorites.get('tool_ids', []) if favorites else []
    
    # Add is_favorited flag and ensure is_mandatory exists
    for tool in tools:
        tool['is_favorited'] = tool['id'] in favorited_ids
        tool['is_mandatory'] = tool.get('is_mandatory', False)
    
    return [CopingToolResponse(**tool) for tool in tools]

@api_router.post("/coping-tools/{tool_id}/favorite")
async def toggle_favorite(tool_id: str, current_user: dict = Depends(get_current_user)):
    favorites = await db.user_favorites.find_one({"user_id": current_user['id']}, {"_id": 0})
    
    if not favorites:
        # Create new favorites doc
        await db.user_favorites.insert_one({
            "user_id": current_user['id'],
            "tool_ids": [tool_id]
        })
        return {"is_favorited": True}
    
    tool_ids = favorites.get('tool_ids', [])
    if tool_id in tool_ids:
        tool_ids.remove(tool_id)
        is_favorited = False
    else:
        tool_ids.append(tool_id)
        is_favorited = True
    
    await db.user_favorites.update_one(
        {"user_id": current_user['id']},
        {"$set": {"tool_ids": tool_ids}}
    )
    
    return {"is_favorited": is_favorited}

# ============ CRAVING SESSIONS ============
@api_router.post("/craving-sessions", response_model=CravingSession)
async def create_craving_session(data: CravingSessionCreate, current_user: dict = Depends(get_current_user)):
    # Use the provided started_at or default to now
    started_at = data.started_at if data.started_at else datetime.now(timezone.utc).isoformat()
    
    session = CravingSession(
        user_id=current_user['id'],
        started_at=started_at,
        triggers=data.triggers,
        intensity=data.intensity,
        need_type=data.need_type
    )
    await db.craving_sessions.insert_one(session.model_dump())
    return session

@api_router.patch("/craving-sessions/{session_id}/complete")
async def complete_craving_session(session_id: str, data: CravingSessionComplete, current_user: dict = Depends(get_current_user)):
    session = await db.craving_sessions.find_one({"id": session_id, "user_id": current_user['id']}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await db.craving_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "outcome": data.outcome
        }}
    )
    return {"success": True}

@api_router.get("/craving-sessions", response_model=List[CravingSession])
async def get_craving_sessions(current_user: dict = Depends(get_current_user)):
    sessions = await db.craving_sessions.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("started_at", -1).to_list(100)
    return [CravingSession(**s) for s in sessions]

# ============ JOURNAL ============
@api_router.post("/journal", response_model=JournalEntry)
async def create_journal_entry(data: JournalEntryCreate, current_user: dict = Depends(get_current_user)):
    entry = JournalEntry(
        user_id=current_user['id'],
        had_craving=data.had_craving,
        triggers=data.triggers,
        intensity=data.intensity,
        tools_used=data.tools_used,
        outcome=data.outcome,
        notes=data.notes
    )
    await db.journal_entries.insert_one(entry.model_dump())
    return entry

@api_router.get("/journal", response_model=List[JournalEntry])
async def get_journal_entries(current_user: dict = Depends(get_current_user)):
    entries = await db.journal_entries.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return [JournalEntry(**e) for e in entries]

@api_router.get("/journal/insights", response_model=JournalInsights)
async def get_journal_insights(current_user: dict = Depends(get_current_user)):
    entries = await db.journal_entries.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).to_list(1000)
    
    # Calculate top triggers
    trigger_counts = {}
    for entry in entries:
        for trigger in entry.get('triggers', []):
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
    
    top_triggers = [{"trigger": k, "count": v} for k, v in sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Calculate most helpful tools
    tool_counts = {}
    for entry in entries:
        if entry.get('outcome') == 'resisted':
            for tool in entry.get('tools_used', []):
                tool_counts[tool] = tool_counts.get(tool, 0) + 1
    
    most_helpful_tools = [{"tool": k, "count": v} for k, v in sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    return JournalInsights(
        top_triggers=top_triggers,
        most_helpful_tools=most_helpful_tools,
        total_entries=len(entries)
    )

@api_router.get("/journal/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    entry = await db.journal_entries.find_one(
        {"id": entry_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return JournalEntry(**entry)

@api_router.get("/progress/chart-data")
async def get_chart_data(current_user: dict = Depends(get_current_user)):
    # Get cravings from last 14 days
    fourteen_days_ago = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    
    sessions = await db.craving_sessions.find(
        {"user_id": current_user['id'], "started_at": {"$gte": fourteen_days_ago}},
        {"_id": 0}
    ).to_list(1000)
    
    # Count cravings per day
    daily_counts = {}
    for i in range(14):
        date = (datetime.now(timezone.utc) - timedelta(days=13-i)).date()
        daily_counts[date.isoformat()] = 0
    
    for session in sessions:
        session_date = datetime.fromisoformat(session['started_at']).date()
        date_key = session_date.isoformat()
        if date_key in daily_counts:
            daily_counts[date_key] += 1
    
    # Format for frontend
    chart_data = [
        {"date": date, "count": count}
        for date, count in sorted(daily_counts.items())
    ]
    
    return {"data": chart_data}

# ============ PROGRESS ============
@api_router.get("/progress", response_model=ProgressStats)
async def get_progress(current_user: dict = Depends(get_current_user)):
    # Get entries from last 7 days
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    recent_entries = await db.journal_entries.find(
        {"user_id": current_user['id'], "created_at": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(100)
    
    recent_sessions = await db.craving_sessions.find(
        {"user_id": current_user['id'], "started_at": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(100)
    
    # Calculate days since last "used"
    all_entries = await db.journal_entries.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    days_since_last_used = None
    last_used_entry = None
    for entry in all_entries:
        if entry.get('outcome') == 'used':
            last_used_entry = entry
            break
    
    if last_used_entry:
        last_used_date = datetime.fromisoformat(last_used_entry['created_at'])
        days_since = (datetime.now(timezone.utc) - last_used_date).days
        days_since_last_used = days_since
    elif current_user.get('sobriety_date'):
        sobriety_date = datetime.fromisoformat(current_user['sobriety_date'])
        if sobriety_date.tzinfo is None:
            sobriety_date = sobriety_date.replace(tzinfo=timezone.utc)
        days_since = (datetime.now(timezone.utc) - sobriety_date).days
        days_since_last_used = days_since
    
    # Current streak (consecutive days with no "used" outcome)
    current_streak = 0
    if all_entries:
        for i in range(len(all_entries)):
            if all_entries[i].get('outcome') != 'used':
                current_streak += 1
            else:
                break
    elif current_user.get('sobriety_date'):
        sobriety_date = datetime.fromisoformat(current_user['sobriety_date'])
        if sobriety_date.tzinfo is None:
            sobriety_date = sobriety_date.replace(tzinfo=timezone.utc)
        current_streak = (datetime.now(timezone.utc) - sobriety_date).days
    
    # Weekly stats
    cravings_this_week = len(recent_sessions)
    
    intensities = [s['intensity'] for s in recent_sessions if 'intensity' in s]
    avg_intensity = sum(intensities) / len(intensities) if intensities else None
    
    # Most used tools
    tool_counts = {}
    for entry in recent_entries:
        for tool in entry.get('tools_used', []):
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
    most_used_tools = [{"tool": k, "count": v} for k, v in sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:3]]
    
    # Most common triggers
    trigger_counts = {}
    for session in recent_sessions:
        for trigger in session.get('triggers', []):
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
    most_common_triggers = [{"trigger": k, "count": v} for k, v in sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:3]]
    
    return ProgressStats(
        days_since_last_used=days_since_last_used,
        current_streak=current_streak,
        cravings_this_week=cravings_this_week,
        avg_intensity_this_week=avg_intensity,
        most_used_tools=most_used_tools,
        most_common_triggers=most_common_triggers
    )

# ============ RESOURCES ============
@api_router.get("/resources", response_model=List[CustomResource])
async def get_custom_resources(current_user: dict = Depends(get_current_user)):
    resources = await db.custom_resources.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [CustomResource(**r) for r in resources]

@api_router.post("/resources", response_model=CustomResource)
async def create_custom_resource(data: CustomResourceCreate, current_user: dict = Depends(get_current_user)):
    resource = CustomResource(
        user_id=current_user['id'],
        title=data.title,
        url=data.url,
        notes=data.notes
    )
    await db.custom_resources.insert_one(resource.model_dump())
    return resource

@api_router.delete("/resources/{resource_id}")
async def delete_custom_resource(resource_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.custom_resources.delete_one({"id": resource_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"success": True}

# ============ TIMER GUIDANCE ============
@api_router.get("/timer-guidance/{duration}")
async def get_timer_guidance(duration: str):
    guidance = await db.timer_guidance.find_one({}, {"_id": 0})
    if not guidance or duration not in guidance:
        return {"guidance": []}
    return {"guidance": guidance[duration]}

# ============ DATA EXPORT ============
@api_router.get("/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    # Get all user data
    journal_entries = await db.journal_entries.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", 1).to_list(10000)
    
    craving_sessions = await db.craving_sessions.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("started_at", 1).to_list(10000)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write journal entries
    writer.writerow(['DATA TYPE: JOURNAL ENTRIES'])
    writer.writerow(['Date', 'Had Craving', 'Triggers', 'Intensity', 'Tools Used', 'Outcome', 'Notes'])
    for entry in journal_entries:
        writer.writerow([
            entry.get('created_at', ''),
            entry.get('had_craving', ''),
            ', '.join(entry.get('triggers', [])),
            entry.get('intensity', ''),
            ', '.join(entry.get('tools_used', [])),
            entry.get('outcome', ''),
            entry.get('notes', '')
        ])
    
    writer.writerow([])
    writer.writerow(['DATA TYPE: CRAVING SESSIONS'])
    writer.writerow(['Started At', 'Completed At', 'Triggers', 'Intensity', 'Need Type', 'Outcome'])
    for session in craving_sessions:
        writer.writerow([
            session.get('started_at', ''),
            session.get('completed_at', ''),
            ', '.join(session.get('triggers', [])),
            session.get('intensity', ''),
            session.get('need_type', ''),
            session.get('outcome', '')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=anchor_data_export.csv"}
    )

@api_router.delete("/user/delete-account")
async def delete_user_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    
    # Delete all user data
    await db.journal_entries.delete_many({"user_id": user_id})
    await db.craving_sessions.delete_many({"user_id": user_id})
    await db.custom_resources.delete_many({"user_id": user_id})
    await db.user_favorites.delete_many({"user_id": user_id})
    await db.calendar_events.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    
    return {"success": True, "message": "All data deleted"}

# ============ CALENDAR EVENTS ============
class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    duration: int = 60  # minutes
    reminder: int = 30  # minutes before
    reminder_enabled: bool = True

class CalendarEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: Optional[str] = None
    date: str
    time: str
    duration: int
    reminder: int
    reminder_enabled: bool
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

@api_router.get("/calendar/events", response_model=List[CalendarEvent])
async def get_calendar_events(current_user: dict = Depends(get_current_user)):
    events = await db.calendar_events.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("date", 1).to_list(1000)
    return [CalendarEvent(**e) for e in events]

@api_router.post("/calendar/events", response_model=CalendarEvent)
async def create_calendar_event(data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    event = CalendarEvent(
        user_id=current_user['id'],
        title=data.title,
        description=data.description,
        date=data.date,
        time=data.time,
        duration=data.duration,
        reminder=data.reminder,
        reminder_enabled=data.reminder_enabled
    )
    await db.calendar_events.insert_one(event.model_dump())
    return event

@api_router.get("/calendar/events/{event_id}", response_model=CalendarEvent)
async def get_calendar_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.calendar_events.find_one(
        {"id": event_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return CalendarEvent(**event)

@api_router.put("/calendar/events/{event_id}", response_model=CalendarEvent)
async def update_calendar_event(event_id: str, data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    result = await db.calendar_events.update_one(
        {"id": event_id, "user_id": current_user['id']},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event = await db.calendar_events.find_one({"id": event_id}, {"_id": 0})
    return CalendarEvent(**event)

@api_router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.calendar_events.delete_one({"id": event_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
