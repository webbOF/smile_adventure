import psycopg2

conn = psycopg2.connect(
    host='localhost', 
    port=5434, 
    database='smile_adventure', 
    user='smileuser', 
    password='smilepass123'
)
cursor = conn.cursor()

cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'game_sessions' 
    ORDER BY ordinal_position;
""")

columns = cursor.fetchall()
print('Colonne nella tabella game_sessions:')
for col_name, col_type in columns:
    print(f'  - {col_name}: {col_type}')

cursor.close()
conn.close()
