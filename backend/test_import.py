"""Test AuthService import"""
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from app.auth.services import AuthService
    print("✅ AuthService imported successfully")
    print(f"✅ AuthService class found with {len([m for m in dir(AuthService) if not m.startswith('_')])} public methods")
    
    # Check key methods
    required_methods = [
        'authenticate_user',
        'create_user',
        'get_user_by_email', 
        'get_user_by_id',
        'create_access_token',
        'verify_access_token'
    ]
    
    for method in required_methods:
        if hasattr(AuthService, method):
            print(f"✅ Method {method} found")
        else:
            print(f"❌ Method {method} missing")
            
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
