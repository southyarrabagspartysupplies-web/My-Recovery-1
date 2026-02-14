"""
Test cases for craving session API and related endpoints.
Tests the updated 2-step craving flow with optional need_type and started_at.
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser2@example.com"
TEST_PASSWORD = "test123456"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.text}")
    return response.json()["token"]


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestCravingSessionAPI:
    """Test craving session creation with updated model (optional need_type and started_at)"""

    def test_create_craving_session_with_started_at(self, auth_headers):
        """Test creating a craving session with started_at timestamp"""
        started_at = datetime.utcnow().isoformat()
        payload = {
            "triggers": ["Stress", "Boredom"],
            "intensity": 7,
            "started_at": started_at
        }
        
        response = requests.post(
            f"{BASE_URL}/api/craving-sessions",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "id" in data
        assert data["triggers"] == ["Stress", "Boredom"]
        assert data["intensity"] == 7
        assert "started_at" in data
        # need_type should be optional (None)
        assert data.get("need_type") is None
        
        print(f"Created craving session: {data['id']}")

    def test_create_craving_session_without_need_type(self, auth_headers):
        """Test that need_type is optional in the updated model"""
        payload = {
            "triggers": ["Loneliness"],
            "intensity": 5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/craving-sessions",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["triggers"] == ["Loneliness"]
        assert data["intensity"] == 5
        assert data.get("need_type") is None  # Optional, should be None
        print(f"Craving session created without need_type: {data['id']}")

    def test_create_craving_session_with_custom_trigger(self, auth_headers):
        """Test creating session with custom 'Other' trigger"""
        payload = {
            "triggers": ["Anxiety", "Custom trigger from test"],
            "intensity": 8,
            "started_at": datetime.utcnow().isoformat()
        }
        
        response = requests.post(
            f"{BASE_URL}/api/craving-sessions",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "Custom trigger from test" in data["triggers"]
        print(f"Session with custom trigger created: {data['id']}")

    def test_get_craving_sessions(self, auth_headers):
        """Test retrieving all craving sessions for user"""
        response = requests.get(
            f"{BASE_URL}/api/craving-sessions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Retrieved {len(data)} craving sessions")


class TestCopingToolsAPI:
    """Test coping tools endpoint"""

    def test_get_coping_tools(self, auth_headers):
        """Test getting all coping tools"""
        response = requests.get(
            f"{BASE_URL}/api/coping-tools",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify tool structure
        if len(data) > 0:
            tool = data[0]
            assert "id" in tool
            assert "title" in tool
            assert "duration" in tool
            assert "steps" in tool
            
        print(f"Retrieved {len(data)} coping tools")


class TestBottomNavAPI:
    """Test APIs used by bottom navigation"""

    def test_progress_endpoint(self, auth_headers):
        """Test progress API used by Progress nav item"""
        response = requests.get(
            f"{BASE_URL}/api/progress",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected fields
        assert "current_streak" in data
        assert "cravings_this_week" in data
        print(f"Progress: streak={data['current_streak']}, cravings_this_week={data['cravings_this_week']}")

    def test_user_settings_endpoint(self, auth_headers):
        """Test settings API used by Settings nav item"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "display_name" in data
        print(f"User: {data['display_name']}, email: {data['email']}")


class TestAuthFlow:
    """Test authentication flow"""

    def test_login_success(self):
        """Test successful login with test credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print("Login successful")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@example.com", "password": "wrongpassword"}
        )
        
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
