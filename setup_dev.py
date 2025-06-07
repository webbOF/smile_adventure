#!/usr/bin/env python3
"""
Development setup script for Smile Adventure
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command with error handling"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return None

def setup_development_environment():
    """Setup the complete development environment"""
    print("🚀 Setting up Smile Adventure Development Environment")
    print("=" * 60)
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    # Check if we're in the right directory
    if not backend_dir.exists():
        print("❌ Backend directory not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # 1. Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    # 2. Setup environment file
    env_example = backend_dir / ".env.example"
    env_file = backend_dir / ".env"
    
    if env_example.exists() and not env_file.exists():
        print("🔧 Creating .env file from template...")
        with open(env_example) as f:
            env_content = f.read()
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
    
    # 3. Initialize Alembic (if not already done)
    versions_dir = backend_dir / "alembic" / "versions"
    if not versions_dir.exists():
        run_command("alembic init alembic", "Initializing Alembic migrations")
    
    # 4. Create initial migration
    if not any(versions_dir.glob("*.py")) if versions_dir.exists() else True:
        run_command(
            'alembic revision --autogenerate -m "Initial migration"',
            "Creating initial database migration"
        )
    
    print("\n🎉 Development Environment Setup Complete!")
    print("=" * 60)
    print("Next steps:")
    print("1. Start PostgreSQL database (or run: docker-compose up -d db)")
    print("2. Update .env file with your database credentials")
    print("3. Run database migrations: alembic upgrade head")
    print("4. Start the development server: uvicorn main:app --reload")
    print("5. Visit http://localhost:8000/docs for API documentation")
    
    return True

if __name__ == "__main__":
    success = setup_development_environment()
    sys.exit(0 if success else 1)
