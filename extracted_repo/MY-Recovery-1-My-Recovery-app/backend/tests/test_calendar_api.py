"""
Backend API tests for Calendar feature and updated endpoints
Tests: Calendar CRUD, Auth endpoints, Settings update
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://recovery-auth-flow.preview.emergentagent.com').rstrip('/')

# Test user credentials
TEST_EMAIL = "testuser_dark@test.com"
TEST_PASSWORD = "testpass123"


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials return 401")
    
    def test_get_me_authenticated(self):
        """Test /auth/me with valid token"""
        # First login to get token
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["token"]
        
        # Get user profile
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        user = response.json()
        assert "id" in user
        assert "email" in user
        assert "display_name" in user
        print(f"✓ Get me returned user: {user['display_name']}")
    
    def test_get_me_unauthenticated(self):
        """Test /auth/me without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Unauthenticated request returns 403")


class TestCalendarAPI:
    """Calendar API endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, "Failed to login for test setup"
        self.token = login_resp.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_calendar_events(self):
        """Test GET /calendar/events returns list"""
        response = requests.get(
            f"{BASE_URL}/api/calendar/events",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        events = response.json()
        assert isinstance(events, list), "Response should be a list"
        print(f"✓ Calendar events returned: {len(events)} events")
    
    def test_create_calendar_event(self):
        """Test POST /calendar/events creates new event"""
        new_event = {
            "title": "TEST_API_Event",
            "description": "Test event from API tests",
            "date": "2026-02-15",
            "time": "14:00",
            "duration": 60,
            "reminder": 30,
            "reminder_enabled": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/calendar/events",
            json=new_event,
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created, "Created event should have an id"
        assert created["title"] == new_event["title"]
        assert created["date"] == new_event["date"]
        assert created["time"] == new_event["time"]
        print(f"✓ Calendar event created with id: {created['id']}")
        
        # Store for cleanup
        self.created_event_id = created["id"]
        
        # Verify event exists by getting it
        get_response = requests.get(
            f"{BASE_URL}/api/calendar/events/{created['id']}",
            headers=self.headers
        )
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["title"] == new_event["title"]
        print(f"✓ Verified event persisted correctly")
    
    def test_update_calendar_event(self):
        """Test PUT /calendar/events/{id} updates event"""
        # First create an event
        new_event = {
            "title": "TEST_Update_Event",
            "date": "2026-02-16",
            "time": "10:00",
            "duration": 30,
            "reminder": 15,
            "reminder_enabled": True
        }
        
        create_resp = requests.post(
            f"{BASE_URL}/api/calendar/events",
            json=new_event,
            headers=self.headers
        )
        assert create_resp.status_code == 200
        event_id = create_resp.json()["id"]
        
        # Update the event
        updated_event = {
            "title": "TEST_Updated_Title",
            "date": "2026-02-17",
            "time": "11:00",
            "duration": 45,
            "reminder": 30,
            "reminder_enabled": False
        }
        
        update_resp = requests.put(
            f"{BASE_URL}/api/calendar/events/{event_id}",
            json=updated_event,
            headers=self.headers
        )
        assert update_resp.status_code == 200, f"Expected 200, got {update_resp.status_code}"
        
        updated = update_resp.json()
        assert updated["title"] == updated_event["title"]
        assert updated["date"] == updated_event["date"]
        print(f"✓ Calendar event updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/calendar/events/{event_id}", headers=self.headers)
    
    def test_delete_calendar_event(self):
        """Test DELETE /calendar/events/{id} removes event"""
        # First create an event
        new_event = {
            "title": "TEST_Delete_Event",
            "date": "2026-02-18",
            "time": "09:00",
            "duration": 30,
            "reminder": 15,
            "reminder_enabled": True
        }
        
        create_resp = requests.post(
            f"{BASE_URL}/api/calendar/events",
            json=new_event,
            headers=self.headers
        )
        assert create_resp.status_code == 200
        event_id = create_resp.json()["id"]
        
        # Delete the event
        delete_resp = requests.delete(
            f"{BASE_URL}/api/calendar/events/{event_id}",
            headers=self.headers
        )
        assert delete_resp.status_code == 200, f"Expected 200, got {delete_resp.status_code}"
        
        # Verify event is deleted - should return 404
        get_resp = requests.get(
            f"{BASE_URL}/api/calendar/events/{event_id}",
            headers=self.headers
        )
        assert get_resp.status_code == 404, "Deleted event should return 404"
        print(f"✓ Calendar event deleted and verified")
    
    def test_calendar_events_unauthenticated(self):
        """Test calendar endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/calendar/events")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Calendar events require authentication")


class TestUserSettings:
    """User settings API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        self.token = login_resp.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_update_settings(self):
        """Test PATCH /user/settings updates user settings"""
        # Update settings with emergency contact
        settings = {
            "sponsor_name": "TEST Emergency Contact",
            "sponsor_phone": "+1234567890",
            "timer_minutes": 15
        }
        
        response = requests.patch(
            f"{BASE_URL}/api/user/settings",
            json=settings,
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify by getting user
        me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert me_resp.status_code == 200
        user = me_resp.json()
        assert user["sponsor_name"] == settings["sponsor_name"]
        assert user["sponsor_phone"] == settings["sponsor_phone"]
        print("✓ User settings updated and verified")
        
        # Cleanup - reset fields
        requests.patch(
            f"{BASE_URL}/api/user/settings",
            json={"sponsor_name": None, "sponsor_phone": None},
            headers=self.headers
        )


class TestCopingTools:
    """Coping tools API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        self.token = login_resp.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_coping_tools(self):
        """Test GET /coping-tools returns list"""
        response = requests.get(
            f"{BASE_URL}/api/coping-tools",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        tools = response.json()
        assert isinstance(tools, list), "Response should be a list"
        print(f"✓ Coping tools returned: {len(tools)} tools")


# Cleanup function to remove test data after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup test data after all tests complete"""
    yield
    
    # Login to get token
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if login_resp.status_code == 200:
        token = login_resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get all calendar events and delete test ones
        events_resp = requests.get(f"{BASE_URL}/api/calendar/events", headers=headers)
        if events_resp.status_code == 200:
            events = events_resp.json()
            for event in events:
                if event.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/calendar/events/{event['id']}", headers=headers)
        
        print("\n✓ Cleanup completed - removed TEST_ prefixed data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
