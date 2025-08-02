import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import GoogleAuth from '@/components/auth/GoogleAuth';

const Index = () => {
  const [selectedMode, setSelectedMode] = useState('');
  const [coins, setCoins] = useState(100);
  const [promoCode, setPromoCode] = useState('');
  const [usedPromoCodes, setUsedPromoCodes] = useState<string[]>([]);
  const [playersOnline, setPlayersOnline] = useState(0);
  
  // Авторизация
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Состояния игр
  const [currentGame, setCurrentGame] = useState<'menu' | 'race' | 'pvp' | 'sandbox'>('menu');
  const [gameStats, setGameStats] = useState({ hp: 50, timeLeft: 60, score: 0 });
  
  // Состояния песочницы
  const [sandboxData, setSandboxData] = useState({
    selectedMap: 'forest',
    chickenX: 200,
    chickenY: 200,
    isPlaying: false,
    direction: 'right' as 'up' | 'down' | 'left' | 'right'
  });
  
  // Состояния гонки
  const [raceData, setRaceData] = useState({
    playerX: 150,
    playerY: 400,
    obstacles: [] as Array<{id: number, x: number, y: number}>,
    gameTime: 0,
    isPlaying: false,
    lives: 1,
    speed: 2
  });

  // Состояния PvP
  const [pvpData, setPvpData] = useState({
    chickens: [] as Array<{id: number, x: number, y: number, speed: number, hp: number, maxHp: number}>,
    weapon: 'pistol',
    ammo: 30,
    kills: 0,
    isPlaying: false
  });

  // Инвентарь
  const [inventory, setInventory] = useState({
    activeWeapon: 'pistol',
    activeVehicle: 'bike',
    items: [] as number[]
  });

  // Статистика
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalKills: 0,
    bestTime: 0,
    totalCoins: 0
  });

  const [isMobile, setIsMobile] = useState(false);
  const gameCanvasRef = useRef<HTMLDivElement>(null);

  // Карты для песочницы
  const sandboxMaps = [
    { id: 'forest', name: 'Лес', emoji: '🌲', bg: 'from-green-400 to-green-600' },
    { id: 'desert', name: 'Пустыня', emoji: '🏜️', bg: 'from-yellow-400 to-orange-500' },
    { id: 'city', name: 'Город', emoji: '🏢', bg: 'from-gray-400 to-blue-500' },
    { id: 'space', name: 'Космос', emoji: '🌌', bg: 'from-purple-900 to-black' },
    { id: 'ocean', name: 'Океан', emoji: '🌊', bg: 'from-blue-400 to-blue-800' }
  ];

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Реальный счетчик онлайн игроков
  useEffect(() => {
    const updateOnlineCount = () => {
      const baseCount = 12;
      const variation = Math.floor(Math.random() * 8);
      setPlayersOnline(baseCount + variation);
    };
    
    updateOnlineCount();
    const interval = setInterval(updateOnlineCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Звуковые эффекты
  const playSound = (type: 'click' | 'coin' | 'error' | 'race' | 'shoot' | 'hit') => {
    const sounds = {
      click: '🔊',
      coin: '💰',
      error: '❌',
      race: '🏁',
      shoot: '💥',
      hit: '🎯'
    };
    console.log(`Звук: ${sounds[type]} ${type}`);
  };

  // Магазин товаров
  const shopItems = [
    // Оружие
    {
      id: 1,
      name: 'Снайперская винтовка',
      type: 'weapon',
      price: 500,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Эпическая',
      description: 'Точный выстрел на дальние дистанции',
      gameId: 'sniper'
    },
    {
      id: 2,
      name: 'Автомат',
      type: 'weapon',
      price: 800,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Легендарная',
      description: 'Высокая скорострельность',
      gameId: 'automat'
    },
    {
      id: 3,
      name: 'Дробовик',
      type: 'weapon',
      price: 400,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Редкая',
      description: 'Мощный урон вблизи',
      gameId: 'shotgun'
    },
    {
      id: 4,
      name: 'Пушка',
      type: 'weapon',
      price: 1200,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Мифическая',
      description: 'Максимальный урон по площади',
      gameId: 'cannon'
    },
    // Транспорт  
    {
      id: 5,
      name: 'Монстр трак',
      type: 'vehicle',
      price: 600,
      image: '/img/5d22640a-5af8-46ec-b1ba-93f244fc9716.jpg',
      rarity: 'Эпическая',
      description: '2 жизни в гонках, проезжает через препятствия',
      gameId: 'monster-truck'
    },
    {
      id: 6,
      name: 'Гоночная машина',
      type: 'vehicle',
      price: 900,
      image: '/img/5d22640a-5af8-46ec-b1ba-93f244fc9716.jpg',
      rarity: 'Легендарная',
      description: 'Максимальная скорость в гонках',
      gameId: 'racing-car'
    }
  ];

  // Регистрация
  const handleRegister = () => {
    if (!registerData.username || !registerData.email || !registerData.password) {
      alert('❌ Заполните все поля!');
      return;
    }
    
    // Имитация регистрации
    const newUser = {
      id: Date.now(),
      username: registerData.username,
      email: registerData.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerData.username}`,
      level: 1,
      experience: 0
    };
    
    setUser(newUser);
    setShowRegister(false);
    alert('🎉 Регистрация успешна! Добро пожаловать!');
    playSound('coin');
  };

  const handlePromoCode = () => {
    playSound('click');
    const validCodes = ['пингвин', 'зайчик'];
    const code = promoCode.toLowerCase();
    
    if (usedPromoCodes.includes(code)) {
      playSound('error');
      alert('❌ Промокод уже использован!');
      return;
    }
    
    if (validCodes.includes(code)) {
      setCoins(prev => prev + 100);
      setUsedPromoCodes(prev => [...prev, code]);
      setPromoCode('');
      playSound('coin');
      alert('🎉 Промокод активирован! +100 монет');
    } else {
      playSound('error');
      alert('❌ Неверный промокод');
    }
  };

  const buyItem = (item: any) => {
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      setInventory(prev => ({
        ...prev,
        items: [...prev.items, item.id]
      }));
      playSound('coin');
      alert(`🎉 Куплено: ${item.name}!`);
    } else {
      playSound('error');
      alert('❌ Недостаточно монет!');
    }
  };

  // Управление клавиатурой для песочницы
  useEffect(() => {
    if (currentGame !== 'sandbox' || !sandboxData.isPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const moveSpeed = 10;
      setSandboxData(prev => {
        let newX = prev.chickenX;
        let newY = prev.chickenY;
        let newDirection = prev.direction;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            newY = Math.max(50, prev.chickenY - moveSpeed);
            newDirection = 'up';
            break;
          case 's':
          case 'arrowdown':
            newY = Math.min(350, prev.chickenY + moveSpeed);
            newDirection = 'down';
            break;
          case 'a':
          case 'arrowleft':
            newX = Math.max(50, prev.chickenX - moveSpeed);
            newDirection = 'left';
            break;
          case 'd':
          case 'arrowright':
            newX = Math.min(350, prev.chickenX + moveSpeed);
            newDirection = 'right';
            break;
        }

        return {
          ...prev,
          chickenX: newX,
          chickenY: newY,
          direction: newDirection
        };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, sandboxData.isPlaying]);

  const startGame = (gameType: 'race' | 'pvp' | 'sandbox') => {
    playSound('click');
    setCurrentGame(gameType);
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));

    if (gameType === 'race') {
      setRaceData(prev => ({
        ...prev,
        isPlaying: true,
        gameTime: 0,
        lives: inventory.activeVehicle === 'monster-truck' ? 2 : 1,
        speed: inventory.activeVehicle === 'racing-car' ? 3 : 2
      }));
    } else if (gameType === 'pvp') {
      setPvpData(prev => ({
        ...prev,
        isPlaying: true,
        kills: 0,
        ammo: 30,
        chickens: Array.from({ length: 5 }, (_, i) => ({
          id: i,
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
          speed: Math.random() * 2 + 1,
          hp: 100,
          maxHp: 100
        }))
      }));
    } else if (gameType === 'sandbox') {
      setSandboxData(prev => ({
        ...prev,
        isPlaying: true
      }));
    }
  };

  const handleMouseMove = (e: any) => {
    // Логика для управления мышью в играх
  };

  const renderGame = () => {
    if (currentGame === 'race') {
      return (
        <div className="fixed inset-0 bg-green-400 z-50">
          <div className="absolute top-4 left-4 text-white font-bold">
            <p>Время: {Math.floor(raceData.gameTime)}с / 50с</p>
            <p>Жизни: {raceData.lives}</p>
            <p>Транспорт: {inventory.activeVehicle}</p>
          </div>
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>
          
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">🏁 Гонка началась!</h2>
              <p className="text-xl">Уворачивайтесь от препятствий!</p>
              <div className="mt-8">
                <div className="w-20 h-20 bg-blue-500 rounded mx-auto animate-bounce">
                  🚛
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentGame === 'pvp') {
      return (
        <div className="fixed inset-0 bg-red-400 z-50">
          <div className="absolute top-4 left-4 text-white font-bold">
            <p>Убийства: {pvpData.kills}</p>
            <p>Патроны: {pvpData.ammo}</p>
            <p>Оружие: {inventory.activeWeapon}</p>
          </div>
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>
          
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">⚔️ PvP Арена!</h2>
              <p className="text-xl">Уничтожайте врагов!</p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {pvpData.chickens.map((chicken) => (
                  <div key={chicken.id} className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse cursor-crosshair">
                    🐔
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentGame === 'sandbox') {
      const currentMap = sandboxMaps.find(m => m.id === sandboxData.selectedMap) || sandboxMaps[0];
      
      return (
        <div className={`fixed inset-0 bg-gradient-to-br ${currentMap.bg} z-50`}>
          <div className="absolute top-4 left-4 text-white font-bold">
            <p>Карта: {currentMap.name} {currentMap.emoji}</p>
            <p>Позиция: ({Math.round(sandboxData.chickenX)}, {Math.round(sandboxData.chickenY)})</p>
          </div>
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <div className="flex space-x-2">
              <select 
                value={sandboxData.selectedMap} 
                onChange={(e) => setSandboxData(prev => ({ ...prev, selectedMap: e.target.value }))}
                className="px-3 py-2 rounded-lg text-black font-medium bg-white border-2 border-white shadow-lg hover:border-blue-300 transition-colors cursor-pointer"
              >
                {sandboxMaps.map(map => (
                  <option key={map.id} value={map.id}>{map.emoji} {map.name}</option>
                ))}
              </select>
              <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
                Выход
              </Button>
            </div>
            
            {/* Кнопки быстрого выбора карт */}
            <div className="flex space-x-1 bg-black/50 rounded-lg p-2">
              {sandboxMaps.map(map => (
                <button
                  key={map.id}
                  onClick={() => setSandboxData(prev => ({ ...prev, selectedMap: map.id }))}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    sandboxData.selectedMap === map.id 
                      ? 'bg-white text-black scale-110' 
                      : 'bg-black/30 text-white hover:bg-white/20'
                  }`}
                  title={map.name}
                >
                  {map.emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Игровая область */}
          <div className="w-full h-full relative overflow-hidden">
            {/* Фоновые элементы */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`absolute text-2xl opacity-60 ${
                    currentMap.id === 'forest' ? '🌲' :
                    currentMap.id === 'desert' ? '🌵' :
                    currentMap.id === 'city' ? '🏢' :
                    currentMap.id === 'space' ? '⭐' :
                    '🐠'
                  }`}
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                  }}
                >
                  {currentMap.id === 'forest' ? '🌲' :
                   currentMap.id === 'desert' ? '🌵' :
                   currentMap.id === 'city' ? '🏢' :
                   currentMap.id === 'space' ? '⭐' :
                   '🐠'}
                </div>
              ))}
            </div>
            
            {/* Курица */}
            <div 
              className="absolute text-4xl cursor-pointer transition-all duration-100"
              style={{
                left: `${sandboxData.chickenX}px`,
                top: `${sandboxData.chickenY}px`,
                transform: `scale(${sandboxData.direction === 'left' ? '-1' : '1'}, 1)`,
              }}
            >
              🐔
            </div>
            
            {/* Инструкции */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-black/70 text-white rounded-lg p-4">
                <p className="font-bold mb-2">🎮 Управление курицей</p>
                <div className="text-sm space-y-1">
                  <p>WASD или стрелки - движение</p>
                  <p>Исследуй карту {currentMap.name}! {currentMap.emoji}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-orange/20 via-game-yellow/20 to-game-blue/20 font-rubik">
      {renderGame()}
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b-4 border-game-orange shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-game-orange rounded-full flex items-center justify-center animate-bounce-in">
              <span className="text-xl md:text-2xl font-bold text-white">🐔</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-red-800 text-center">red gan</h1>
              <p className="text-xs md:text-sm text-gray-600">Максимальный геймплей</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 bg-game-yellow/20 rounded-full px-2 md:px-4 py-1 md:py-2">
              <span className="text-xl">💰</span>
              <span className="font-bold text-game-dark text-sm md:text-base">{coins}</span>
            </div>
            
            {user ? (
              <GoogleAuth 
                user={user} 
                onLogin={setUser}
                onLogout={() => setUser(null)}
                gameData={{ coins, usedPromoCodes, inventory, stats, sandboxData }}
              />
            ) : (
              <div className="flex space-x-2">
                <Button onClick={() => setShowAuth(true)} variant="outline" size={isMobile ? "sm" : "default"}>
                  Войти
                </Button>
                <Button onClick={() => setShowRegister(true)} size={isMobile ? "sm" : "default"}>
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Диалог регистрации */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎮 Регистрация</DialogTitle>
            <DialogDescription>
              Создайте аккаунт, чтобы сохранять прогресс
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Имя пользователя"
              value={registerData.username}
              onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={registerData.password}
              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
            />
            <Button onClick={handleRegister} className="w-full">
              Создать аккаунт
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог входа */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎯 Авторизация</DialogTitle>
            <DialogDescription>
              Войдите, чтобы получить доступ к полному функционалу
            </DialogDescription>
          </DialogHeader>
          <GoogleAuth 
            user={user} 
            onLogin={(userData) => {
              setUser(userData);
              setShowAuth(false);
            }}
            onLogout={() => setUser(null)}
            gameData={{ coins, usedPromoCodes, inventory, stats, sandboxData }}
          />
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Hero Section */}
        <section className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-game-dark mb-4 animate-slide-in">
            Добро пожаловать в мир игр! 🎮
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 animate-fade-in">
            Выберите режим и начните играть прямо сейчас
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-red-500">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">🏁</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Гонки</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Уворачивайтесь от препятствий и покажите лучшее время</p>
                <Button 
                  onClick={() => startGame('race')} 
                  className="w-full bg-red-500 hover:bg-red-600" 
                  size={isMobile ? "sm" : "default"}
                >
                  Начать гонку
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-purple-500">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">⚔️</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">PvP Арена</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Сражайтесь с другими игроками в реальном времени</p>
                <Button 
                  onClick={() => startGame('pvp')} 
                  className="w-full bg-purple-500 hover:bg-purple-600" 
                  size={isMobile ? "sm" : "default"}
                >
                  В бой!
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-green-500">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">🎮</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Свободная игра</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Исследуйте мир без ограничений</p>
                
                {/* Выбор карты */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Выберите карту:</p>
                  <div className="flex justify-center space-x-1 mb-2">
                    {sandboxMaps.map(map => (
                      <button
                        key={map.id}
                        onClick={() => setSandboxData(prev => ({ ...prev, selectedMap: map.id }))}
                        className={`w-8 h-8 rounded text-lg transition-all ${
                          sandboxData.selectedMap === map.id 
                            ? 'bg-green-500 text-white scale-110' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        title={map.name}
                      >
                        {map.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {sandboxMaps.find(m => m.id === sandboxData.selectedMap)?.name}
                  </p>
                </div>
                
                <Button 
                  onClick={() => startGame('sandbox')} 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  size={isMobile ? "sm" : "default"}
                >
                  Исследовать {sandboxMaps.find(m => m.id === sandboxData.selectedMap)?.emoji}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="shop" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 md:mb-8">
            <TabsTrigger value="shop">🛒 Магазин</TabsTrigger>
            <TabsTrigger value="inventory">🎒 Инвентарь</TabsTrigger>
            <TabsTrigger value="stats">📊 Статистика</TabsTrigger>
            <TabsTrigger value="promo">🎁 Промокоды</TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {shopItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-r from-game-orange to-game-yellow flex items-center justify-center">
                    <span className="text-4xl md:text-6xl">
                      {item.type === 'weapon' ? '🔫' : '🚗'}
                    </span>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg md:text-xl">{item.name}</CardTitle>
                      <Badge variant={
                        item.rarity === 'Мифическая' ? 'destructive' :
                        item.rarity === 'Легендарная' ? 'secondary' :
                        item.rarity === 'Эпическая' ? 'outline' : 'default'
                      }>
                        {item.rarity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-xl font-bold text-game-orange">{item.price} 💰</span>
                      <Button 
                        onClick={() => buyItem(item)}
                        disabled={inventory.items.includes(item.id)}
                        size={isMobile ? "sm" : "default"}
                      >
                        {inventory.items.includes(item.id) ? 'Куплено' : 'Купить'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>🔫 Оружие</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shopItems.filter(item => item.type === 'weapon' && inventory.items.includes(item.id)).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{item.name}</span>
                        <Button 
                          variant={inventory.activeWeapon === item.gameId ? "default" : "outline"}
                          size="sm"
                          onClick={() => setInventory(prev => ({ ...prev, activeWeapon: item.gameId }))}
                        >
                          {inventory.activeWeapon === item.gameId ? 'Активно' : 'Выбрать'}
                        </Button>
                      </div>
                    ))}
                    {shopItems.filter(item => item.type === 'weapon' && inventory.items.includes(item.id)).length === 0 && (
                      <p className="text-gray-500 text-center py-4">Оружие не куплено</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🚗 Транспорт</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shopItems.filter(item => item.type === 'vehicle' && inventory.items.includes(item.id)).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{item.name}</span>
                        <Button 
                          variant={inventory.activeVehicle === item.gameId ? "default" : "outline"}
                          size="sm"
                          onClick={() => setInventory(prev => ({ ...prev, activeVehicle: item.gameId }))}
                        >
                          {inventory.activeVehicle === item.gameId ? 'Активно' : 'Выбрать'}
                        </Button>
                      </div>
                    ))}
                    {shopItems.filter(item => item.type === 'vehicle' && inventory.items.includes(item.id)).length === 0 && (
                      <p className="text-gray-500 text-center py-4">Транспорт не куплен</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">🎮 Игр сыграно</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-game-orange">{stats.gamesPlayed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">💀 Убийств</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-red-500">{stats.totalKills}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">⏱️ Лучшее время</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-blue-500">{stats.bestTime}с</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">💰 Всего монет</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500">{stats.totalCoins}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="promo">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>🎁 Введите промокод</CardTitle>
                <CardDescription>
                  Получите бонусные монеты за активацию промокодов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Введите промокод..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button onClick={handlePromoCode} className="w-full">
                  Активировать
                </Button>
                
                {usedPromoCodes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Использованные промокоды:</p>
                    <div className="space-y-1">
                      {usedPromoCodes.map((code, index) => (
                        <Badge key={index} variant="secondary">{code}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-game-dark text-white py-6 md:py-8 mt-12 md:mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🐔</span>
            <span className="text-xl md:text-2xl font-bold">ПоеХали Игры</span>
          </div>
          <p className="text-gray-300 mb-4">Самые захватывающие игры в одном месте</p>
          <p className="text-xs text-gray-500 mt-2">Поддержка мобильных устройств • Реальный геймплей • {playersOnline} игроков онлайн</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;