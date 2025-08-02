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
    isPlaying: false,
    timeLeft: 60,
    hp: 50,
    kills: 0
  });

  // Инвентарь
  const [inventory, setInventory] = useState({
    weapons: ['pistol'],
    vehicles: ['basic-car'],
    activeWeapon: 'pistol',
    activeVehicle: 'basic-car'
  });

  // Статистика
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalKills: 0,
    bestRaceTime: 0
  });
  
  // Карты для песочницы
  const sandboxMaps = [
    { id: 'forest', name: 'Лес', emoji: '🌲', bg: 'bg-green-400' },
    { id: 'desert', name: 'Пустыня', emoji: '🏜️', bg: 'bg-yellow-400' },
    { id: 'city', name: 'Город', emoji: '🏙️', bg: 'bg-gray-400' },
    { id: 'space', name: 'Космос', emoji: '🌌', bg: 'bg-purple-900' },
    { id: 'ocean', name: 'Океан', emoji: '🌊', bg: 'bg-blue-400' }
  ];

  // Обработчики авторизации
  const handleLogin = (userData: any, gameData: any) => {
    setUser(userData);
    if (gameData.coins !== undefined) setCoins(gameData.coins);
    if (gameData.usedPromoCodes) setUsedPromoCodes(gameData.usedPromoCodes);
    if (gameData.inventory) setInventory(gameData.inventory);
    if (gameData.stats) setStats(gameData.stats);
    if (gameData.sandboxData) setSandboxData(gameData.sandboxData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    // Сбрасываем до начальных значений
    setCoins(100);
    setUsedPromoCodes([]);
    setInventory({
      weapons: ['pistol'],
      vehicles: ['basic-car'],
      activeWeapon: 'pistol',
      activeVehicle: 'basic-car'
    });
    setStats({
      gamesPlayed: 0,
      totalKills: 0,
      bestRaceTime: 0
    });
    setSandboxData({
      selectedMap: 'forest',
      chickenX: 200,
      chickenY: 200,
      isPlaying: false,
      direction: 'right'
    });
  };

  const gameCanvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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
    console.log(`Playing sound: ${sounds[type]}`);
  };

  // Управление мышкой/пальцем
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (currentGame !== 'race' || !raceData.isPlaying) return;
    
    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let clientX: number;
    if ('touches' in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const x = Math.max(10, Math.min(rect.width - 40, clientX - rect.left - 20));
    setRaceData(prev => ({ ...prev, playerX: x }));
  }, [currentGame, raceData.isPlaying]);

  // Обработчик кликов по курицам
  const handleChickenClick = (chickenId: number) => {
    if (currentGame !== 'pvp' || !pvpData.isPlaying) return;
    
    playSound('shoot');
    const weaponDamage = getWeaponPower(inventory.activeWeapon);
    
    setPvpData(prev => {
      const updatedChickens = prev.chickens.map(chicken => {
        if (chicken.id === chickenId) {
          const newHp = Math.max(0, chicken.hp - weaponDamage);
          return { ...chicken, hp: newHp };
        }
        return chicken;
      }).filter(chicken => chicken.hp > 0);
      
      // Подсчитываем убитых куриц
      const killedChickens = prev.chickens.length - updatedChickens.length;
      
      return {
        ...prev,
        chickens: updatedChickens,
        kills: prev.kills + killedChickens
      };
    });
    
    const reward = Math.floor(weaponDamage / 2);
    setCoins(prev => prev + reward);
  };

  // Логика гонки
  useEffect(() => {
    if (currentGame !== 'race' || !raceData.isPlaying) return;

    const gameLoop = setInterval(() => {
      setRaceData(prev => {
        const newObstacles = prev.obstacles
          .map(obs => ({ ...obs, y: obs.y + prev.speed }))
          .filter(obs => obs.y < window.innerHeight);

        // Добавляем новые препятствия - быстрее и по всей ширине
        if (Math.random() < 0.08) {
          const canvasWidth = gameCanvasRef.current?.clientWidth || 400;
          newObstacles.push({
            id: Date.now(),
            x: Math.random() * (canvasWidth - 60) + 30,
            y: -20
          });
        }

        // Проверка столкновений
        const collision = newObstacles.some(obs => 
          Math.abs(obs.x - prev.playerX) < 25 && 
          Math.abs(obs.y - prev.playerY) < 25
        );

        if (collision) {
          if (prev.lives > 1) {
            playSound('hit');
            return { ...prev, lives: prev.lives - 1, obstacles: newObstacles.filter(obs => 
              !(Math.abs(obs.x - prev.playerX) < 25 && Math.abs(obs.y - prev.playerY) < 25)
            )};
          } else {
            playSound('error');
            setStats(prevStats => ({ ...prevStats, gamesPlayed: prevStats.gamesPlayed + 1 }));
            setTimeout(() => {
              alert('💥 Авария! Игра окончена!');
              setCurrentGame('menu');
            }, 100);
            return { ...prev, isPlaying: false };
          }
        }

        const newTime = prev.gameTime + 0.1;
        if (newTime >= 50) {
          // Победа!
          const reward = 200 + (prev.lives * 50);
          setCoins(prevCoins => prevCoins + reward);
          setStats(prevStats => ({ 
            ...prevStats, 
            gamesPlayed: prevStats.gamesPlayed + 1,
            bestRaceTime: Math.max(prevStats.bestRaceTime, 50)
          }));
          setTimeout(() => {
            alert(`🏁 Поздравляю! Ты доехал до финиша! +${reward} монет`);
            setCurrentGame('menu');
          }, 100);
          return { ...prev, isPlaying: false, gameTime: 50 };
        }

        return { ...prev, obstacles: newObstacles, gameTime: newTime };
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, [currentGame, raceData.isPlaying, inventory.activeVehicle]);

  // Логика PvP
  useEffect(() => {
    if (currentGame !== 'pvp' || !pvpData.isPlaying) return;

    const gameLoop = setInterval(() => {
      setPvpData(prev => {
        // Двигаем куриц
        const updatedChickens = prev.chickens
          .map(chicken => ({
            ...chicken,
            x: chicken.x + chicken.speed,
            y: chicken.y + (Math.random() - 0.5) * 2
          }))
          .filter(chicken => chicken.x < window.innerWidth);

        // Добавляем новых куриц - быстрее
        const newChickens = [...updatedChickens];
        if (Math.random() < 0.25) {
          const chickenHp = 10 + Math.floor(Math.random() * 15); // HP от 10 до 25
          newChickens.push({
            id: Date.now(),
            x: -30,
            y: Math.random() * (window.innerHeight - 100) + 50,
            speed: 2 + Math.random() * 4,
            hp: chickenHp,
            maxHp: chickenHp
          });
        }

        // Проверяем куриц, которые убежали
        const canvasWidth = window.innerWidth || 400;
        const escapedChickens = prev.chickens.filter(c => c.x >= canvasWidth).length;
        const newHp = Math.max(0, prev.hp - escapedChickens * 10);
        
        const newTimeLeft = prev.timeLeft - 0.1;
        
        if (newHp <= 0) {
          setStats(prevStats => ({ ...prevStats, gamesPlayed: prevStats.gamesPlayed + 1 }));
          setTimeout(() => {
            alert('💀 Игра окончена! Тебя одолели курицы!');
            setCurrentGame('menu');
          }, 100);
          return { ...prev, isPlaying: false, hp: 0 };
        }

        if (newTimeLeft <= 0) {
          const reward = prev.kills * 10 + 100;
          setCoins(prevCoins => prevCoins + reward);
          setStats(prevStats => ({ 
            ...prevStats, 
            gamesPlayed: prevStats.gamesPlayed + 1,
            totalKills: prevStats.totalKills + prev.kills
          }));
          setTimeout(() => {
            alert(`🎉 Победа! Ты продержался минуту! Убито куриц: ${prev.kills}. +${reward} монет`);
            setCurrentGame('menu');
          }, 100);
          return { ...prev, isPlaying: false, timeLeft: 0 };
        }

        return { 
          ...prev, 
          chickens: newChickens, 
          hp: newHp,
          timeLeft: newTimeLeft
        };
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, [currentGame, pvpData.isPlaying]);

  const getWeaponPower = (weapon: string) => {
    const powers: Record<string, number> = {
      'pistol': 5,
      'shotgun': 8,
      'machine-gun': 12,
      'cannon': 20,
      'freeze-gun': 15
    };
    return powers[weapon] || 5;
  };

  const getVehicleLives = (vehicle: string) => {
    const lives: Record<string, number> = {
      'basic-car': 1,
      'monster-truck': 2,
      'racing-car': 1
    };
    return lives[vehicle] || 1;
  };

  const shopItems = [
    // Оружие
    {
      id: 1,
      name: 'Дробовик',
      type: 'weapon',
      price: 300,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Редкая',
      description: 'Увеличенный урон в PvP битвах',
      gameId: 'shotgun'
    },
    {
      id: 2,
      name: 'Пулемет',
      type: 'weapon',
      price: 500,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Эпическая',
      description: 'Высокая скорострельность и урон',
      gameId: 'machine-gun'
    },
    {
      id: 3,
      name: 'Пушка замедления',
      type: 'weapon',
      price: 800,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Легендарная',
      description: 'Замедляет куриц в PvP режиме',
      gameId: 'freeze-gun'
    },
    {
      id: 4,
      name: 'Ракетница',
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
    playSound('click');
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      
      if (item.type === 'weapon') {
        setInventory(prev => ({
          ...prev,
          weapons: [...prev.weapons, item.gameId],
          activeWeapon: item.gameId
        }));
      } else if (item.type === 'vehicle') {
        setInventory(prev => ({
          ...prev,
          vehicles: [...prev.vehicles, item.gameId],
          activeVehicle: item.gameId
        }));
      }
      
      playSound('coin');
      alert(`✅ Куплено: ${item.name}!`);
    } else {
      playSound('error');
      alert('❌ Недостаточно монет!');
    }
  };

  const startGame = (gameType: 'race' | 'pvp' | 'sandbox') => {
    playSound('click');
    setCurrentGame(gameType);
    
    if (gameType === 'race') {
      setRaceData({
        playerX: 150,
        playerY: 400,
        obstacles: [],
        gameTime: 0,
        isPlaying: true,
        lives: getVehicleLives(inventory.activeVehicle),
        speed: inventory.activeVehicle === 'racing-car' ? 3 : 2
      });
    } else if (gameType === 'pvp') {
      setPvpData({
        chickens: [],
        weapon: inventory.activeWeapon,
        isPlaying: true,
        timeLeft: 60,
        hp: 50,
        kills: 0
      });
    } else if (gameType === 'sandbox') {
      setSandboxData(prev => ({
        ...prev,
        isPlaying: true,
        chickenX: 200,
        chickenY: 200
      }));
    }
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
          
          <div 
            ref={gameCanvasRef}
            className="w-full h-full relative overflow-hidden cursor-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onTouchStart={handleMouseMove}
          >
            {/* Дорога */}
            <div className="absolute inset-0 bg-gray-700">
              <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800">
                {/* Разметка дороги */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-8 bg-white left-1/2 transform -translate-x-1/2"
                    style={{ 
                      top: `${i * 60 + (raceData.gameTime * 50) % 60}px`,
                      opacity: 0.8 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Игрок */}
            <div
              className="absolute w-8 h-8 bg-blue-500 rounded transform -translate-x-1/2"
              style={{ 
                left: `${Math.min(raceData.playerX, window.innerWidth - 50)}px`, 
                top: `${raceData.playerY}px`,
                transition: isMobile ? 'none' : 'left 0.1s ease'
              }}
            >
              🚗
            </div>

            {/* Препятствия */}
            {raceData.obstacles.map(obstacle => (
              <div
                key={obstacle.id}
                className="absolute w-8 h-8 bg-red-500 rounded z-5"
                style={{ 
                  left: `${obstacle.x}px`, 
                  top: `${obstacle.y}px` 
                }}
              >
                🚛
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentGame === 'pvp') {
      return (
        <div className="fixed inset-0 bg-orange-300 z-50">
          <div className="absolute top-4 left-4 text-white font-bold">
            <p>Время: {Math.floor(pvpData.timeLeft)}с</p>
            <p>HP: {pvpData.hp}/50</p>
            <p>Убито: {pvpData.kills}</p>
            <p>Оружие: {inventory.activeWeapon}</p>
          </div>
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>

          <div className="w-full h-full relative overflow-hidden">
            {/* Курицы */}
            {pvpData.chickens.map(chicken => (
              <div
                key={chicken.id}
                className="absolute cursor-pointer hover:scale-110 transition-transform z-10"
                style={{ 
                  left: `${chicken.x}px`, 
                  top: `${chicken.y}px`,
                  pointerEvents: 'auto'
                }}
                onClick={() => handleChickenClick(chicken.id)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleChickenClick(chicken.id);
                }}
              >
                <div className="relative">
                  <div className="text-4xl">🐔</div>
                  {/* HP полоска */}
                  <div className="absolute -top-2 left-0 w-12 h-1 bg-red-300 rounded">
                    <div 
                      className="h-full bg-red-600 rounded transition-all duration-200"
                      style={{ width: `${(chicken.hp / chicken.maxHp) * 100}%` }}
                    />
                  </div>
                  {/* HP текст */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-1 rounded">
                    {chicken.hp}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white font-bold mb-2">Кликай по курицам!</p>
              <div className="w-16 h-16 bg-brown-600 rounded-full flex items-center justify-center">
                🎯
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentGame === 'sandbox') {
      const currentMap = sandboxMaps.find(m => m.id === sandboxData.selectedMap) || sandboxMaps[0];
      
      return (
        <div className={`fixed inset-0 ${currentMap.bg} z-50 relative`}>
          {/* Верхняя панель */}
          <div className="absolute top-4 left-4 text-white font-bold bg-black/50 rounded-lg p-3">
            <p>🗺️ Карта: {currentMap.name} {currentMap.emoji}</p>
            <p>🐔 Управление: WASD или стрелки</p>
          </div>
          
          {/* Селектор карт */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2 bg-black/50 rounded-lg p-2">
              {sandboxMaps.map(map => (
                <Button
                  key={map.id}
                  size="sm"
                  variant={sandboxData.selectedMap === map.id ? "default" : "outline"}
                  onClick={() => setSandboxData(prev => ({ ...prev, selectedMap: map.id }))}
                  className="text-xs"
                >
                  {map.emoji} {map.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>

          {/* Игровая область */}
          <div 
            className="w-full h-full relative overflow-hidden cursor-none"
            tabIndex={0}
            onKeyDown={(e) => {
              const speed = 10;
              setSandboxData(prev => {
                let newX = prev.chickenX;
                let newY = prev.chickenY;
                let newDirection = prev.direction;
                
                switch(e.key.toLowerCase()) {
                  case 'w':
                  case 'arrowup':
                    newY = Math.max(20, prev.chickenY - speed);
                    newDirection = 'up';
                    break;
                  case 's':
                  case 'arrowdown':
                    newY = Math.min(window.innerHeight - 80, prev.chickenY + speed);
                    newDirection = 'down';
                    break;
                  case 'a':
                  case 'arrowleft':
                    newX = Math.max(20, prev.chickenX - speed);
                    newDirection = 'left';
                    break;
                  case 'd':
                  case 'arrowright':
                    newX = Math.min(window.innerWidth - 80, prev.chickenX + speed);
                    newDirection = 'right';
                    break;
                }
                
                return { ...prev, chickenX: newX, chickenY: newY, direction: newDirection };
              });
            }}
          >
            {/* Фоновые элементы карты */}
            {currentMap.id === 'forest' && (
              <>
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="absolute text-4xl" style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`
                  }}>🌲</div>
                ))}
              </>
            )}
            
            {currentMap.id === 'desert' && (
              <>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute text-4xl" style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`
                  }}>🌵</div>
                ))}
              </>
            )}
            
            {currentMap.id === 'city' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute text-5xl" style={{
                    left: `${Math.random() * 70 + 15}%`,
                    top: `${Math.random() * 70 + 15}%`
                  }}>🏢</div>
                ))}
              </>
            )}
            
            {currentMap.id === 'space' && (
              <>
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute text-2xl" style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`
                  }}>⭐</div>
                ))}
              </>
            )}
            
            {currentMap.id === 'ocean' && (
              <>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute text-3xl" style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`
                  }}>🐠</div>
                ))}
              </>
            )}
            
            {/* Управляемая курица */}
            <div
              className="absolute w-16 h-16 cursor-pointer transition-all duration-100 z-10"
              style={{ 
                left: `${sandboxData.chickenX}px`, 
                top: `${sandboxData.chickenY}px`,
                transform: sandboxData.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
              }}
            >
              <div className="text-6xl animate-bounce hover:scale-110 transition-transform">
                🐔
              </div>
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
              <p className="text-gray-700">Кликай для тестирования урона</p>
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
              <span className="text-xl md:text-2xl">🐔</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">CHICKEN GUN</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 bg-game-yellow px-2 md:px-4 py-1 md:py-2 rounded-full">
              <Icon name="Coins" size={isMobile ? 16 : 20} />
              <span className="font-bold text-gray-800 text-sm md:text-base">{coins}</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-bold">{playersOnline} онлайн</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="modes" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3'} mb-6 md:mb-8`}>
            <TabsTrigger value="modes" className="text-sm md:text-lg font-bold">
              <Icon name="Gamepad2" size={isMobile ? 16 : 20} className="mr-1 md:mr-2" />
              Игровые Режимы
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-sm md:text-lg font-bold">
              <Icon name="ShoppingBag" size={isMobile ? 16 : 20} className="mr-1 md:mr-2" />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="promo" className="text-sm md:text-lg font-bold">
              <Icon name="Gift" size={isMobile ? 16 : 20} className="mr-1 md:mr-2" />
              Промокоды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modes" className="space-y-4 md:space-y-6">
            <div className="text-center mb-6 md:mb-8 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Выбери режим игры!</h2>
              <p className="text-sm md:text-lg text-gray-600">Настоящие мини-игры с управлением и экшеном</p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-4 md:gap-6`}>
              <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-green">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-game-green rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Icon name="Car" size={isMobile ? 24 : 32} className="text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800">Гонки</CardTitle>
                  <CardDescription className="text-sm md:text-base text-gray-600">
                    Управляй машиной мышкой/пальцем. Доберись до финиша за 50 секунд!
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-3">Время: 50 секунд</Badge>
                  <Button 
                    className="w-full bg-game-green hover:bg-game-green/90 text-white font-bold"
                    onClick={() => startGame('race')}
                  >
                    Начать гонку 🏁
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-orange">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-game-orange rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Icon name="Crosshair" size={isMobile ? 24 : 32} className="text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800">PvP Битвы</CardTitle>
                  <CardDescription className="text-sm md:text-base text-gray-600">
                    Кликай по курицам! Продержись 1 минуту. 50 HP, -10 за пропуск.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-3">HP: 50 • Время: 60с</Badge>
                  <Button 
                    className="w-full bg-game-orange hover:bg-game-orange/90 text-white font-bold"
                    onClick={() => startGame('pvp')}
                  >
                    В бой! 🎯
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-yellow">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-game-yellow rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Icon name="Map" size={isMobile ? 24 : 32} className="text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-800">Песочница</CardTitle>
                  <CardDescription className="text-sm md:text-base text-gray-600">
                    Тестируй новое оружие и проверяй урон без ограничений.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-3">Свободная игра</Badge>
                  <Button 
                    className="w-full bg-game-yellow hover:bg-game-yellow/90 text-white font-bold"
                    onClick={() => startGame('sandbox')}
                  >
                    Тестировать 🔧
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-4 border-blue-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                🎮 Твой арсенал
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-700 mb-2">Активное оружие:</p>
                  <Badge variant="outline" className="text-sm">{inventory.activeWeapon}</Badge>
                </div>
                <div>
                  <p className="font-bold text-gray-700 mb-2">Активный транспорт:</p>
                  <Badge variant="outline" className="text-sm">{inventory.activeVehicle}</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4 md:space-y-6">
            <div className="text-center mb-6 md:mb-8 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Магазин улучшений</h2>
              <p className="text-sm md:text-lg text-gray-600">Покупай мощное оружие и быстрые машины!</p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-6`}>
              {shopItems.map((item, index) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-blue animate-scale-in"
                          style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-2xl mx-auto mb-4 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardTitle className="text-sm md:text-lg font-bold text-gray-800">{item.name}</CardTitle>
                        <Badge 
                          variant={
                            item.rarity === 'Мифическая' ? 'destructive' : 
                            item.rarity === 'Легендарная' ? 'default' : 
                            item.rarity === 'Эпическая' ? 'secondary' : 'outline'
                          }
                          className="mb-2 text-xs"
                        >
                          {item.rarity}
                        </Badge>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <Icon name="Coins" size={16} className="text-game-yellow" />
                          <span className="text-lg md:text-xl font-bold text-gray-800">{item.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
                      <DialogDescription className="text-base">
                        {item.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-center space-y-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-32 h-32 mx-auto rounded-xl object-cover"
                      />
                      <div className="flex items-center justify-center space-x-2">
                        <Icon name="Coins" size={20} className="text-game-yellow" />
                        <span className="text-2xl font-bold">{item.price}</span>
                      </div>
                      <Button 
                        className="w-full bg-game-blue hover:bg-game-blue/90 text-white font-bold"
                        disabled={
                          coins < item.price || 
                          (item.type === 'weapon' && inventory.weapons.includes(item.gameId)) ||
                          (item.type === 'vehicle' && inventory.vehicles.includes(item.gameId))
                        }
                        onClick={() => buyItem(item)}
                      >
                        {
                          (item.type === 'weapon' && inventory.weapons.includes(item.gameId)) ||
                          (item.type === 'vehicle' && inventory.vehicles.includes(item.gameId)) ? 
                          'Уже куплено' :
                          coins >= item.price ? 'Купить' : 'Недостаточно монет'
                        }
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promo" className="space-y-4 md:space-y-6">
            <div className="text-center mb-6 md:mb-8 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Промокоды</h2>
              <p className="text-sm md:text-lg text-gray-600">Введи промокод и получи бонусные монеты!</p>
            </div>

            <Card className="max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-gray-800">Активация промокода</CardTitle>
                <CardDescription>Доступные промокоды: пингвин, зайчик (+100 монет каждый)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Введи промокод..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handlePromoCode}
                    className="bg-game-orange hover:bg-game-orange/90 text-white font-bold"
                    disabled={!promoCode.trim()}
                  >
                    <Icon name="Gift" size={16} className="mr-2" />
                    Активировать
                  </Button>
                </div>
                
                {usedPromoCodes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Использованные промокоды:</p>
                    <div className="flex flex-wrap gap-2">
                      {usedPromoCodes.map((code, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {code} ✅
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-game-green to-game-yellow rounded-xl p-4 text-center">
                  <h3 className="text-lg font-bold text-white mb-2">💎 Ежедневные награды</h3>
                  <p className="text-white/90 text-sm mb-3">Заходи каждый день и получай бонусы!</p>
                  <Button 
                    variant="secondary" 
                    className="font-bold"
                    onClick={() => {
                      setCoins(prev => prev + 50);
                      playSound('coin');
                      alert('🎁 Ежедневная награда: +50 монет!');
                    }}
                  >
                    Получить награду
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t-4 border-game-orange mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-4 md:py-6 text-center">
          <p className="text-sm md:text-base text-gray-600">🐔 Chicken Gun - Настоящие мини-игры с экшеном! 🏁</p>
          <p className="text-xs text-gray-500 mt-2">Поддержка мобильных устройств • Реальный геймплей • {playersOnline} игроков онлайн</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;