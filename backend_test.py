#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for MyRecovery App
Tests all endpoints defined in the FastAPI server.py
"""

import requests
import json
from datetime import datetime, timezone
import sys

# Backend URL from environment
BACKEND_URL = "https://recovery-auth-flow.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_id = None
        self.session_id = None
        self.journal_entry_id = None
        self.resource_id = None
        self.event_id = None
        self.test_results = {
            'passed': [],
            'failed': [],
            'critical_failures': []
        }

    def log_result(self, test_name, success, message="", is_critical=False):
        """Log test result"""
        if success:
            self.test_results['passed'].append(f"✅ {test_name}: {message}")
            print(f"✅ {test_name}: {message}")
        else:
            failure_msg = f"❌ {test_name}: {message}"
            if is_critical:
                self.test_results['critical_failures'].append(failure_msg)
            else:
                self.test_results['failed'].append(failure_msg)
            print(failure_msg)

    def test_auth_register(self):
        """Test user registration"""
        test_name = "AUTH Register"
        
        user_data = {
            "email": "sarah.wilson@example.com",
            "password": "SecurePass123!",
            "display_name": "Sarah Wilson"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/register", json=user_data)
            
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.token = data['token']
                    self.user_id = data['user']['id']
                    self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                    self.log_result(test_name, True, "User registered successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Missing token or user in response", True)
            elif response.status_code == 400 and "already registered" in response.text:
                # User already exists, try login instead
                return self.test_auth_login_existing()
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}", True)
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}", True)
        
        return False

    def test_auth_login_existing(self):
        """Test login with existing user"""
        test_name = "AUTH Login (Existing User)"
        
        login_data = {
            "email": "sarah.wilson@example.com", 
            "password": "SecurePass123!"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.token = data['token']
                    self.user_id = data['user']['id']
                    self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                    self.log_result(test_name, True, "Login successful")
                    return True
                else:
                    self.log_result(test_name, False, "Missing token or user in response", True)
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}", True)
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}", True)
        
        return False

    def test_auth_me(self):
        """Test get current user info"""
        test_name = "AUTH Get Me"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'email' in data:
                    self.log_result(test_name, True, f"Retrieved user info for {data.get('display_name')}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required user fields")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}", True)
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}", True)
        
        return False

    def test_auth_onboarding(self):
        """Test complete onboarding"""
        test_name = "AUTH Onboarding"
        
        onboarding_data = {
            "timezone": "America/New_York",
            "sponsor_name": "Mark Thompson",
            "sponsor_phone": "+1-555-0123",
            "timer_minutes": 20,
            "sobriety_date": "2024-01-15T00:00:00Z"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/onboarding", json=onboarding_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result(test_name, True, "Onboarding completed")
                    return True
                else:
                    self.log_result(test_name, False, "Success flag not true in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_coping_tools_get(self):
        """Test get coping tools"""
        test_name = "COPING TOOLS Get List"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/coping-tools")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} coping tools")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_coping_tools_favorite(self):
        """Test toggle favorite coping tool"""
        test_name = "COPING TOOLS Favorite Toggle"
        
        # Use a dummy tool ID for testing
        tool_id = "test-tool-123"
        
        try:
            response = self.session.post(f"{BACKEND_URL}/coping-tools/{tool_id}/favorite")
            
            if response.status_code == 200:
                data = response.json()
                if 'is_favorited' in data:
                    self.log_result(test_name, True, f"Tool favorite status: {data['is_favorited']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing is_favorited in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_craving_sessions_create(self):
        """Test create craving session"""
        test_name = "CRAVING SESSIONS Create"
        
        session_data = {
            "triggers": ["stress", "work_pressure"],
            "intensity": 7,
            "need_type": "social_support",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/craving-sessions", json=session_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'triggers' in data:
                    self.session_id = data['id']
                    self.log_result(test_name, True, f"Created session with ID: {data['id']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required fields in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_craving_sessions_get(self):
        """Test get all craving sessions"""
        test_name = "CRAVING SESSIONS Get All"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/craving-sessions")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} craving sessions")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_craving_sessions_complete(self):
        """Test complete craving session"""
        test_name = "CRAVING SESSIONS Complete"
        
        if not self.session_id:
            self.log_result(test_name, False, "No session ID available")
            return False
        
        complete_data = {
            "outcome": "resisted_successfully"
        }
        
        try:
            response = self.session.patch(f"{BACKEND_URL}/craving-sessions/{self.session_id}/complete", json=complete_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result(test_name, True, "Session completed successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Success flag not true in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_journal_create(self):
        """Test create journal entry"""
        test_name = "JOURNAL Create Entry"
        
        journal_data = {
            "had_craving": True,
            "triggers": ["anxiety", "social_situation"],
            "intensity": 6,
            "tools_used": ["breathing_exercises", "call_sponsor"],
            "outcome": "resisted",
            "notes": "Used deep breathing and called my sponsor. Feeling much better now."
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/journal", json=journal_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'notes' in data:
                    self.journal_entry_id = data['id']
                    self.log_result(test_name, True, f"Created journal entry with ID: {data['id']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required fields in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_journal_get_all(self):
        """Test get all journal entries"""
        test_name = "JOURNAL Get All Entries"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/journal")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} journal entries")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_journal_get_single(self):
        """Test get single journal entry"""
        test_name = "JOURNAL Get Single Entry"
        
        if not self.journal_entry_id:
            self.log_result(test_name, False, "No journal entry ID available")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/journal/{self.journal_entry_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['id'] == self.journal_entry_id:
                    self.log_result(test_name, True, f"Retrieved journal entry: {self.journal_entry_id}")
                    return True
                else:
                    self.log_result(test_name, False, "Entry ID mismatch")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_journal_insights(self):
        """Test get journal insights"""
        test_name = "JOURNAL Get Insights"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/journal/insights")
            
            if response.status_code == 200:
                data = response.json()
                if 'top_triggers' in data and 'most_helpful_tools' in data:
                    self.log_result(test_name, True, f"Retrieved insights with {data.get('total_entries', 0)} total entries")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required insight fields")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_progress_stats(self):
        """Test get progress stats"""
        test_name = "PROGRESS Get Stats"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/progress")
            
            if response.status_code == 200:
                data = response.json()
                if 'current_streak' in data and 'cravings_this_week' in data:
                    self.log_result(test_name, True, f"Current streak: {data.get('current_streak')} days")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required progress fields")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_progress_chart_data(self):
        """Test get progress chart data"""
        test_name = "PROGRESS Get Chart Data"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/progress/chart-data")
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and isinstance(data['data'], list):
                    self.log_result(test_name, True, f"Retrieved chart data with {len(data['data'])} points")
                    return True
                else:
                    self.log_result(test_name, False, "Missing or invalid chart data")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_calendar_get_events(self):
        """Test get calendar events"""
        test_name = "CALENDAR Get Events"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/calendar/events")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} calendar events")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_calendar_create_event(self):
        """Test create calendar event"""
        test_name = "CALENDAR Create Event"
        
        event_data = {
            "title": "Weekly Support Group Meeting",
            "description": "Regular support group meeting with counselor",
            "date": "2024-12-20",
            "time": "18:00",
            "duration": 90,
            "reminder": 30,
            "reminder_enabled": True
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/calendar/events", json=event_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'title' in data:
                    self.event_id = data['id']
                    self.log_result(test_name, True, f"Created event: {data['title']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required event fields")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_calendar_delete_event(self):
        """Test delete calendar event"""
        test_name = "CALENDAR Delete Event"
        
        if not self.event_id:
            self.log_result(test_name, False, "No event ID available")
            return False
        
        try:
            response = self.session.delete(f"{BACKEND_URL}/calendar/events/{self.event_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result(test_name, True, "Event deleted successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Success flag not true in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_resources_get(self):
        """Test get custom resources"""
        test_name = "RESOURCES Get List"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/resources")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} resources")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_resources_create(self):
        """Test create custom resource"""
        test_name = "RESOURCES Create Resource"
        
        resource_data = {
            "title": "National Suicide Prevention Lifeline",
            "url": "https://suicidepreventionlifeline.org/",
            "notes": "24/7 crisis support hotline"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/resources", json=resource_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'title' in data:
                    self.resource_id = data['id']
                    self.log_result(test_name, True, f"Created resource: {data['title']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required resource fields")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_resources_delete(self):
        """Test delete custom resource"""
        test_name = "RESOURCES Delete Resource"
        
        if not self.resource_id:
            self.log_result(test_name, False, "No resource ID available")
            return False
        
        try:
            response = self.session.delete(f"{BACKEND_URL}/resources/{self.resource_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result(test_name, True, "Resource deleted successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Success flag not true in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def test_user_settings_update(self):
        """Test update user settings"""
        test_name = "USER SETTINGS Update"
        
        settings_data = {
            "display_name": "Sarah Wilson-Smith",
            "timer_minutes": 25,
            "emergency_contact_name": "Jane Wilson",
            "emergency_contact_phone": "+1-555-0199"
        }
        
        try:
            response = self.session.patch(f"{BACKEND_URL}/user/settings", json=settings_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result(test_name, True, "Settings updated successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Success flag not true in response")
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"\n🚀 Starting Backend API Tests for MyRecovery App")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Authentication tests (must be first)
        auth_success = self.test_auth_register()
        if auth_success:
            self.test_auth_me()
            self.test_auth_onboarding()
        
        # Only run authenticated tests if auth succeeded
        if self.token:
            # Coping Tools tests
            self.test_coping_tools_get()
            self.test_coping_tools_favorite()
            
            # Craving Sessions tests
            self.test_craving_sessions_create()
            self.test_craving_sessions_get()
            self.test_craving_sessions_complete()
            
            # Journal tests
            self.test_journal_create()
            self.test_journal_get_all()
            self.test_journal_get_single()
            self.test_journal_insights()
            
            # Progress tests
            self.test_progress_stats()
            self.test_progress_chart_data()
            
            # Calendar tests
            self.test_calendar_get_events()
            self.test_calendar_create_event()
            self.test_calendar_delete_event()
            
            # Resources tests
            self.test_resources_get()
            self.test_resources_create()
            self.test_resources_delete()
            
            # User Settings tests
            self.test_user_settings_update()
        else:
            print("❌ CRITICAL: Authentication failed - skipping all authenticated tests")
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        print(f"\n✅ PASSED TESTS ({len(self.test_results['passed'])})")
        for result in self.test_results['passed']:
            print(f"  {result}")
        
        if self.test_results['failed']:
            print(f"\n⚠️  FAILED TESTS ({len(self.test_results['failed'])})")
            for result in self.test_results['failed']:
                print(f"  {result}")
        
        if self.test_results['critical_failures']:
            print(f"\n🚨 CRITICAL FAILURES ({len(self.test_results['critical_failures'])})")
            for result in self.test_results['critical_failures']:
                print(f"  {result}")
        
        total_tests = len(self.test_results['passed']) + len(self.test_results['failed']) + len(self.test_results['critical_failures'])
        success_rate = (len(self.test_results['passed']) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📊 SUCCESS RATE: {success_rate:.1f}% ({len(self.test_results['passed'])}/{total_tests})")
        
        if len(self.test_results['critical_failures']) > 0:
            print("🚨 CRITICAL ISSUES FOUND - Backend needs immediate attention")
            return False
        elif success_rate >= 80:
            print("✅ Backend is working well")
            return True
        else:
            print("⚠️  Backend has issues that should be addressed")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)