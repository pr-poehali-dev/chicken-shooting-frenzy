import json
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

@dataclass
class Player:
    id: str
    nickname: str
    x: float
    y: float
    emoji: str = "🐥"
    room: str = "main"

@dataclass
class GameObject:
    id: str
    type: str
    x: float
    y: float
    emoji: str
    created_by: str

@dataclass
class Bullet:
    id: str
    x: float
    y: float
    direction: float
    speed: float = 5
    created_by: str

class GameRoom:
    def __init__(self, name: str):
        self.name = name
        self.players: Dict[str, Player] = {}
        self.objects: Dict[str, GameObject] = {}
        self.bullets: Dict[str, Bullet] = {}
    
    def add_player(self, player_id: str, nickname: str):
        """Добавить игрока в комнату"""
        self.players[player_id] = Player(
            id=player_id,
            nickname=nickname,
            x=400,
            y=300,
            room=self.name
        )
        return self.players[player_id]
    
    def remove_player(self, player_id: str):
        """Удалить игрока из комнаты"""
        if player_id in self.players:
            del self.players[player_id]
    
    def update_player_position(self, player_id: str, x: float, y: float):
        """Обновить позицию игрока"""
        if player_id in self.players:
            self.players[player_id].x = x
            self.players[player_id].y = y
    
    def spawn_object(self, object_type: str, x: float, y: float, created_by: str):
        """Создать объект в игре"""
        object_id = str(uuid.uuid4())
        emoji_map = {
            'tree': '🌲',
            'rock': '🗿', 
            'house': '🏠',
            'car': '🚗',
            'star': '⭐',
            'diamond': '💎'
        }
        
        self.objects[object_id] = GameObject(
            id=object_id,
            type=object_type,
            x=x,
            y=y,
            emoji=emoji_map.get(object_type, '🟫'),
            created_by=created_by
        )
        return self.objects[object_id]
    
    def create_bullet(self, x: float, y: float, direction: float, created_by: str):
        """Создать пулю"""
        bullet_id = str(uuid.uuid4())
        self.bullets[bullet_id] = Bullet(
            id=bullet_id,
            x=x,
            y=y,
            direction=direction,
            created_by=created_by
        )
        return self.bullets[bullet_id]
    
    def get_game_state(self):
        """Получить состояние игры"""
        return {
            'players': [asdict(player) for player in self.players.values()],
            'objects': [asdict(obj) for obj in self.objects.values()],
            'bullets': [asdict(bullet) for bullet in self.bullets.values()]
        }

# Глобальные переменные для хранения состояния
rooms: Dict[str, GameRoom] = {}

def get_or_create_room(room_name: str) -> GameRoom:
    """Получить или создать комнату"""
    if room_name not in rooms:
        rooms[room_name] = GameRoom(room_name)
    return rooms[room_name]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    REST API сервер для мультиплеера с синхронизацией игроков
    Args: event - dict с httpMethod, body
          context - объект контекста
    Returns: HTTP JSON ответ
    '''
    method = event.get('httpMethod', 'POST')
    
    # Обработка HTTP OPTIONS для CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Player-Id, X-Nickname',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    # Обработка POST запросов
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            room_name = body_data.get('room', 'main')
            player_id = body_data.get('playerId')
            
            room = get_or_create_room(room_name)
            
            if action == 'join':
                # Подключение игрока
                nickname = body_data.get('nickname', 'Player')
                player = room.add_player(player_id, nickname)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'player': asdict(player),
                        'game_state': room.get_game_state()
                    })
                }
            
            elif action == 'move':
                # Движение игрока
                x = body_data.get('x', 0)
                y = body_data.get('y', 0)
                room.update_player_position(player_id, x, y)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'game_state': room.get_game_state()
                    })
                }
            
            elif action == 'spawn_object':
                # Создание объекта
                obj_type = body_data.get('object_type', 'tree')
                x = body_data.get('x', 0)
                y = body_data.get('y', 0)
                
                game_object = room.spawn_object(obj_type, x, y, player_id)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'object': asdict(game_object),
                        'game_state': room.get_game_state()
                    })
                }
            
            elif action == 'shoot':
                # Стрельба
                x = body_data.get('x', 0)
                y = body_data.get('y', 0)
                direction = body_data.get('direction', 0)
                
                bullet = room.create_bullet(x, y, direction, player_id)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'bullet': asdict(bullet),
                        'game_state': room.get_game_state()
                    })
                }
            
            elif action == 'get_state':
                # Получить текущее состояние игры
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'game_state': room.get_game_state()
                    })
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Unknown action'})
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }