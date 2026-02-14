import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Default coping tools
DEFAULT_TOOLS = [
    {
        "id": "tool-deep-breathing",
        "title": "Deep Breathing",
        "duration": "2 minutes",
        "steps": [
            "Exhale completely through your mouth",
            "Close your mouth and inhale through your nose for 4 counts",
            "Hold your breath for 7 counts",
            "Exhale completely through your mouth for 8 counts",
            "Repeat 4 times"
        ],
        "when_to_use": "When feeling anxious or stressed",
        "is_default": True,
        "is_mandatory": True
    },
    {
        "id": "tool-box-breathing",
        "title": "Box Breathing",
        "duration": "3 minutes",
        "steps": [
            "Inhale for 4 counts",
            "Hold for 4 counts",
            "Exhale for 4 counts",
            "Hold for 4 counts",
            "Repeat 5-6 times"
        ],
        "when_to_use": "To calm down and regain control",
        "is_default": True,
        "is_mandatory": True
    },
    {
        "id": "tool-grounding",
        "title": "Grounding",
        "duration": "5 minutes",
        "steps": [
            "Name 5 things you can see",
            "Name 4 things you can touch",
            "Name 3 things you can hear",
            "Name 2 things you can smell",
            "Name 1 thing you can taste"
        ],
        "when_to_use": "When feeling disconnected or overwhelmed",
        "is_default": True,
        "is_mandatory": True
    },
    {
        "id": "tool-delay-10",
        "title": "Delay 10 Minutes",
        "duration": "10 minutes",
        "steps": [
            "Tell yourself: I'll wait 10 minutes",
            "Set a timer",
            "Do something else in that time",
            "After 10 minutes, reassess",
            "Repeat if needed"
        ],
        "when_to_use": "When craving first appears",
        "is_default": True,
        "is_mandatory": True
    },
    {
        "id": "tool-change-location",
        "title": "Change Your Location",
        "duration": "5 minutes",
        "steps": [
            "Specify which room you are currently in",
            "Leave that room and move to a different space",
            "Specify which room you moved to",
            "Wait 5 minutes in the new location",
            "Stay in the new space until stable"
        ],
        "when_to_use": "When environment is triggering",
        "is_default": True,
        "is_mandatory": True
    },
    {
        "id": "tool-craving-surfing",
        "title": "Craving Surfing",
        "duration": "10 minutes",
        "steps": [
            "Notice the craving without judgment",
            "Observe where you feel it in your body",
            "Breathe into that sensation",
            "Notice how the intensity rises and falls like a wave",
            "Remind yourself: this will pass",
            "Stay present until the peak passes"
        ],
        "when_to_use": "During strong cravings",
        "is_default": True,
        "is_mandatory": False
    },
    {
        "id": "tool-short-walk",
        "title": "Take a Short Walk",
        "duration": "10 minutes",
        "steps": [
            "Put on shoes and go outside",
            "Walk at a comfortable pace",
            "Notice your surroundings",
            "Focus on your breath and steps",
            "Change your physical location"
        ],
        "when_to_use": "When feeling restless or trapped",
        "is_default": True,
        "is_mandatory": False
    },
    {
        "id": "tool-cold-water",
        "title": "Cold Water Reset",
        "duration": "2 minutes",
        "steps": [
            "Splash cold water on your face",
            "Hold ice cubes in your hands",
            "Or take a cold shower",
            "Focus on the physical sensation",
            "Let it interrupt the craving pattern"
        ],
        "when_to_use": "For immediate intensity reduction",
        "is_default": True,
        "is_mandatory": False
    },
    {
        "id": "tool-reach-out",
        "title": "Reach Out to Someone",
        "duration": "10 minutes",
        "steps": [
            "Call your sponsor or trusted friend",
            "Text someone in recovery",
            "Go to an online meeting",
            "Use a recovery hotline",
            "Don't isolate - connection helps"
        ],
        "when_to_use": "When feeling alone or overwhelmed",
        "is_default": True,
        "is_mandatory": False
    }
]

# Timer guidance for 15-minute session
TIMER_GUIDANCE = {
    "15": [
        {"minute": 1, "text": "You're doing the right thing by stopping. Take a deep breath. You've got this."},
        {"minute": 2, "text": "Notice where you feel the craving in your body. Just observe it without judgment."},
        {"minute": 3, "text": "This feeling will pass. Cravings typically peak and then decrease. You're already 3 minutes in."},
        {"minute": 4, "text": "Try the Deep Breathing technique. Breathe in for 4, hold for 7, out for 8."},
        {"minute": 5, "text": "You're one-third through. Think about why you started recovery. That reason still matters."},
        {"minute": 6, "text": "Name 5 things you can see right now. Ground yourself in this moment."},
        {"minute": 7, "text": "The craving is temporary. Your recovery is what lasts. Keep going."},
        {"minute": 8, "text": "More than halfway there. You're stronger than this craving."},
        {"minute": 9, "text": "Think about how proud you'll feel in a few minutes when you've made it through."},
        {"minute": 10, "text": "Try splashing cold water on your face or holding ice cubes. Physical sensation can help."},
        {"minute": 11, "text": "You're in the final stretch. Just a few more minutes."},
        {"minute": 12, "text": "Remember: one day at a time. Right now, you're winning this moment."},
        {"minute": 13, "text": "Almost there. Take three slow, deep breaths."},
        {"minute": 14, "text": "Final minute. You've done incredibly well. Stay present."},
        {"minute": 15, "text": "You made it! Take a moment to acknowledge your strength. You chose recovery today."}
    ]
}

async def seed_database():
    print("Seeding database with default coping tools...")
    
    # Delete existing tools to update with new data
    await db.coping_tools.delete_many({})
    print("Cleared existing tools")
    
    # Insert default tools
    result = await db.coping_tools.insert_many(DEFAULT_TOOLS)
    print(f"Inserted {len(result.inserted_ids)} coping tools")
    
    # Insert timer guidance
    await db.timer_guidance.delete_many({})
    await db.timer_guidance.insert_one(TIMER_GUIDANCE)
    print("Inserted timer guidance")
    
    print("Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()
