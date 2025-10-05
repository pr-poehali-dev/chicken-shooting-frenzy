"""
Business: Multiplayer game server with rooms, players, objects
Args: event with httpMethod, body; context with request_id
Returns: HTTP response with game state
"""
import json
from typing import Dict, Any, List
from dataclasses import dataclass, field, asdict
import time

# In-memory game state (в продакшене использовать Redis)
game_rooms: Dict[str, 'GameRoom'] = {}

@dataclass
class Player:
    id: str
    nickname: str
    x: float = 400
    y: float = 300
    emoji: str = "🚗"
    last_action: float = field(default_factory=time.time)

@dataclass
class GameObject:
    type: str
    emoji: str
    x: float
    y: float
    id: str = ""
    
    def __post_init__(self):
        if not self.id:
            self.id = f"{self.type}_{int(time.time() * 1000)}"

@dataclass
class Bullet:
    id: str
    x: float
    y: float
    dx: float
    dy: float
    owner_id: str
    created_at: float = field(default_factory=time.time)

@dataclass
class GameRoom:
    name: str
    players: Dict[str, Player] = field(default_factory=dict)
    objects: List[GameObject] = field(default_factory=list)
    bullets: List[Bullet] = field(default_factory=list)
    
    def cleanup_inactive(self):
        """Удаляем неактивных игроков (>60 сек)"""
        current_time = time.time()
        self.players = {
            pid: p for pid, p in self.players.items()
            if current_time - p.last_action < 60
        }
        # Удаляем старые пули (>10 сек)
        self.bullets = [b for b in self.bullets if current_time - b.created_at < 10]

def get_room(room_name: str) -> GameRoom:
    """Получить или создать комнату"""
    if room_name not in game_rooms:
        game_rooms[room_name] = GameRoom(name=room_name)
    room = game_rooms[room_name]
    room.cleanup_inactive()
    return room

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # CORS
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')
        room_name = body.get('room', 'main')
        room = get_room(room_name)
        
        if action == 'join':
            player_id = body.get('playerId', f"player_{int(time.time() * 1000)}")
            nickname = body.get('nickname', 'Player')
            
            player = Player(id=player_id, nickname=nickname)
            room.players[player_id] = player
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'player': asdict(player),
                    'game_state': {
                        'players': [asdict(p) for p in room.players.values()],
                        'objects': [asdict(o) for o in room.objects],
                        'bullets': [asdict(b) for b in room.bullets]
                    }
                })
            }
        
        elif action == 'move':
            player_id = body.get('playerId')
            if player_id in room.players:
                room.players[player_id].x = body.get('x', room.players[player_id].x)
                room.players[player_id].y = body.get('y', room.players[player_id].y)
                room.players[player_id].last_action = time.time()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'game_state': {
                        'players': [asdict(p) for p in room.players.values()],
                        'objects': [asdict(o) for o in room.objects],
                        'bullets': [asdict(b) for b in room.bullets]
                    }
                })
            }
        
        elif action == 'spawn_object':
            obj_type = body.get('object_type', 'tree')
            emoji_map = {'tree': '🌲', 'rock': '🪨', 'house': '🏠', 'flower': '🌸'}
            
            obj = GameObject(
                type=obj_type,
                emoji=emoji_map.get(obj_type, '📦'),
                x=body.get('x', 400),
                y=body.get('y', 300)
            )
            room.objects.append(obj)
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'object': asdict(obj),
                    'game_state': {
                        'players': [asdict(p) for p in room.players.values()],
                        'objects': [asdict(o) for o in room.objects],
                        'bullets': [asdict(b) for b in room.bullets]
                    }
                })
            }
        
        elif action == 'shoot':
            bullet = Bullet(
                id=f"bullet_{int(time.time() * 1000)}",
                x=body.get('x', 400),
                y=body.get('y', 300),
                dx=body.get('dx', 0),
                dy=body.get('dy', 0),
                owner_id=body.get('playerId', '')
            )
            room.bullets.append(bullet)
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'bullet': asdict(bullet),
                    'game_state': {
                        'players': [asdict(p) for p in room.players.values()],
                        'objects': [asdict(o) for o in room.objects],
                        'bullets': [asdict(b) for b in room.bullets]
                    }
                })
            }
        
        elif action == 'get_state':
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'game_state': {
                        'players': [asdict(p) for p in room.players.values()],
                        'objects': [asdict(o) for o in room.objects],
                        'bullets': [asdict(b) for b in room.bullets]
                    }
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'success': False, 'error': 'Unknown action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'success': False, 'error': str(e)})
        }
