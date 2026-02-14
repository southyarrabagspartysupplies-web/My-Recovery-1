import requests
import sys
import json
from datetime import datetime

class AnchorAPITester:
    def __init__(self, base_url="https://anchor-recovery.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED {details}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name}: FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200, auth=True):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            success = response.status_code == expected_status
            response_data = {}
            try:
                response_data = response.json()
            except:
                pass

            return success, response.status_code, response_data

        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test registration with new user (timestamped)
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"test_{timestamp}@anchor.com"
        
        success, status, data = self.make_request('POST', 'auth/register', {
            "email": test_email,
            "password": "test123",
            "display_name": f"Test User {timestamp}"
        }, auth=False)
        
        if self.log_result("User Registration", success, f"Status: {status}"):
            self.token = data.get('token')
            self.user_id = data.get('user', {}).get('id')
        
        # Test login with existing test user
        success, status, data = self.make_request('POST', 'auth/login', {
            "email": "test@anchor.com",
            "password": "test123"
        }, auth=False)
        
        if self.log_result("User Login", success, f"Status: {status}"):
            self.token = data.get('token')
            self.user_id = data.get('user', {}).get('id')

        # Test getting current user
        success, status, data = self.make_request('GET', 'auth/me')
        self.log_result("Get Current User", success, f"Status: {status}")

        # Test onboarding completion
        success, status, data = self.make_request('POST', 'auth/onboarding', {
            "timezone": "America/New_York",
            "sponsor_name": "John Doe",
            "sponsor_phone": "+1234567890",
            "timer_minutes": 15,
            "sobriety_date": "2024-01-01"
        })
        self.log_result("Complete Onboarding", success, f"Status: {status}")

    def test_coping_tools(self):
        """Test coping tools endpoints"""
        print("\n🛠️ Testing Coping Tools...")
        
        # Get coping tools
        success, status, data = self.make_request('GET', 'coping-tools')
        tools_count = len(data) if isinstance(data, list) else 0
        self.log_result("Get Coping Tools", success, f"Status: {status}, Count: {tools_count}")
        
        # Test favorite toggle (if tools exist)
        if success and tools_count > 0:
            tool_id = data[0].get('id')
            if tool_id:
                success, status, data = self.make_request('POST', f'coping-tools/{tool_id}/favorite')
                self.log_result("Toggle Favorite Tool", success, f"Status: {status}")

    def test_craving_sessions(self):
        """Test craving session endpoints"""
        print("\n⚡ Testing Craving Sessions...")
        
        # Create craving session
        session_data = {
            "triggers": ["Stress", "Boredom"],
            "intensity": 7,
            "need_type": "distract"
        }
        success, status, data = self.make_request('POST', 'craving-sessions', session_data)
        session_id = data.get('id') if success else None
        self.log_result("Create Craving Session", success, f"Status: {status}")

        # Get craving sessions
        success, status, data = self.make_request('GET', 'craving-sessions')
        sessions_count = len(data) if isinstance(data, list) else 0
        self.log_result("Get Craving Sessions", success, f"Status: {status}, Count: {sessions_count}")

        # Complete craving session
        if session_id:
            success, status, data = self.make_request('PATCH', f'craving-sessions/{session_id}/complete', {
                "outcome": "resisted"
            })
            self.log_result("Complete Craving Session", success, f"Status: {status}")

    def test_journal(self):
        """Test journal endpoints"""
        print("\n📖 Testing Journal...")
        
        # Create journal entry
        entry_data = {
            "had_craving": True,
            "triggers": ["Stress", "Loneliness"],
            "intensity": 6,
            "tools_used": ["Deep Breathing"],
            "outcome": "resisted",
            "notes": "Used breathing technique successfully"
        }
        success, status, data = self.make_request('POST', 'journal', entry_data)
        entry_id = data.get('id') if success else None
        self.log_result("Create Journal Entry", success, f"Status: {status}")

        # Get journal entries
        success, status, data = self.make_request('GET', 'journal')
        entries_count = len(data) if isinstance(data, list) else 0
        self.log_result("Get Journal Entries", success, f"Status: {status}, Count: {entries_count}")

        # Get specific journal entry
        if entry_id:
            success, status, data = self.make_request('GET', f'journal/{entry_id}')
            self.log_result("Get Journal Entry by ID", success, f"Status: {status}")

        # Get journal insights
        success, status, data = self.make_request('GET', 'journal/insights')
        self.log_result("Get Journal Insights", success, f"Status: {status}")

    def test_progress(self):
        """Test progress endpoint"""
        print("\n📈 Testing Progress...")
        
        success, status, data = self.make_request('GET', 'progress')
        has_data = bool(data.get('current_streak') is not None) if success else False
        self.log_result("Get Progress Stats", success, f"Status: {status}, Has data: {has_data}")

    def test_resources(self):
        """Test resources endpoints"""
        print("\n📚 Testing Resources...")
        
        # Get custom resources
        success, status, data = self.make_request('GET', 'resources')
        resources_count = len(data) if isinstance(data, list) else 0
        self.log_result("Get Custom Resources", success, f"Status: {status}, Count: {resources_count}")

        # Create custom resource
        resource_data = {
            "title": "Test Resource",
            "url": "https://test.com",
            "notes": "Test notes"
        }
        success, status, data = self.make_request('POST', 'resources', resource_data)
        resource_id = data.get('id') if success else None
        self.log_result("Create Custom Resource", success, f"Status: {status}")

        # Delete custom resource
        if resource_id:
            success, status, data = self.make_request('DELETE', f'resources/{resource_id}')
            self.log_result("Delete Custom Resource", success, f"Status: {status}")

    def test_timer_guidance(self):
        """Test timer guidance endpoint"""
        print("\n⏱️ Testing Timer Guidance...")
        
        success, status, data = self.make_request('GET', 'timer-guidance/15', auth=False)
        has_guidance = bool(data.get('guidance')) if success else False
        self.log_result("Get Timer Guidance", success, f"Status: {status}, Has guidance: {has_guidance}")

    def test_user_settings(self):
        """Test user settings endpoint"""
        print("\n⚙️ Testing User Settings...")
        
        settings_data = {
            "display_name": "Updated Test User",
            "sponsor_name": "Jane Doe",
            "timer_minutes": 20
        }
        success, status, data = self.make_request('PATCH', 'user/settings', settings_data)
        self.log_result("Update User Settings", success, f"Status: {status}")

    def test_data_export(self):
        """Test data export endpoint"""
        print("\n💾 Testing Data Export...")
        
        success, status, data = self.make_request('GET', 'export')
        self.log_result("Export User Data", success, f"Status: {status}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🧪 Starting Anchor API Testing...")
        print(f"Base URL: {self.base_url}")
        
        # Test core flows in order
        self.test_auth_flow()
        
        if self.token:
            self.test_coping_tools()
            self.test_craving_sessions()
            self.test_journal()
            self.test_progress()
            self.test_resources()
            self.test_timer_guidance()
            self.test_user_settings()
            self.test_data_export()
        else:
            print("❌ Cannot proceed with other tests - Authentication failed")
        
        # Print summary
        print(f"\n📊 Test Results Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AnchorAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())