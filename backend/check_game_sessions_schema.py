import psycopg2

try:
    conn = psycopg2.connect('postgresql://smileuser:smilepass123@localhost:5434/smile_adventure')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'game_sessions' 
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    print('Colonne attuali nella tabella game_sessions:')
    for col in columns:
        print(f'  - {col[0]}: {col[1]}')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Errore: {e}")
