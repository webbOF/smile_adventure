import traceback

try:
    from app.core.config import settings
    print('Config loaded successfully')
    print('DATABASE_URL:', settings.DATABASE_URL)
except Exception as e:
    print('Error:', e)
    traceback.print_exc()
