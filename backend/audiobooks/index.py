import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление аудиокнигами - CRUD операции
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными аудиокниг
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            book_id = params.get('id')
            search = params.get('search', '')
            in_progress = params.get('inProgress')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if book_id:
                    cur.execute('SELECT * FROM audiobooks WHERE id = %s', (book_id,))
                    book = cur.fetchone()
                    if book:
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps(dict(book), default=str)
                        }
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Book not found'})
                    }
                
                query = 'SELECT * FROM audiobooks WHERE 1=1'
                params_list = []
                
                if search:
                    query += ' AND (title ILIKE %s OR author ILIKE %s)'
                    search_pattern = f'%{search}%'
                    params_list.extend([search_pattern, search_pattern])
                
                if in_progress is not None:
                    query += ' AND in_progress = %s'
                    params_list.append(in_progress.lower() == 'true')
                
                query += ' ORDER BY created_at DESC'
                
                cur.execute(query, params_list)
                books = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(book) for book in books], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    INSERT INTO audiobooks 
                    (title, author, description, cover_url, audio_url, duration_seconds, file_size_mb)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (
                    body_data.get('title'),
                    body_data.get('author'),
                    body_data.get('description', ''),
                    body_data.get('coverUrl', ''),
                    body_data.get('audioUrl', ''),
                    body_data.get('durationSeconds', 0),
                    body_data.get('fileSizeMb', 0)
                ))
                new_book = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(new_book), default=str)
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            book_id = body_data.get('id')
            
            if not book_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Book ID required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                update_fields = []
                params_list = []
                
                if 'title' in body_data:
                    update_fields.append('title = %s')
                    params_list.append(body_data['title'])
                if 'author' in body_data:
                    update_fields.append('author = %s')
                    params_list.append(body_data['author'])
                if 'description' in body_data:
                    update_fields.append('description = %s')
                    params_list.append(body_data['description'])
                if 'coverUrl' in body_data:
                    update_fields.append('cover_url = %s')
                    params_list.append(body_data['coverUrl'])
                if 'audioUrl' in body_data:
                    update_fields.append('audio_url = %s')
                    params_list.append(body_data['audioUrl'])
                if 'durationSeconds' in body_data:
                    update_fields.append('duration_seconds = %s')
                    params_list.append(body_data['durationSeconds'])
                if 'inProgress' in body_data:
                    update_fields.append('in_progress = %s')
                    params_list.append(body_data['inProgress'])
                if 'progressPercent' in body_data:
                    update_fields.append('progress_percent = %s')
                    params_list.append(body_data['progressPercent'])
                
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                params_list.append(book_id)
                
                query = f"UPDATE audiobooks SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
                cur.execute(query, params_list)
                updated_book = cur.fetchone()
                conn.commit()
                
                if updated_book:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(dict(updated_book), default=str)
                    }
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Book not found'})
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            book_id = params.get('id')
            
            if not book_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Book ID required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('DELETE FROM audiobooks WHERE id = %s', (book_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
