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
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  // Состояния игр
  const [currentGame, setCurrentGame] = useState<'menu' | 'race' | 'pvp' | 'sandbox' | 'multiplayer' | 'login'>('menu');
  const [gameStats, setGameStats] = useState({ hp: 50, timeLeft: 60, score: 0 });
  
  // Состояния песочницы
  const [sandboxData, setSandboxData] = useState({
    selectedMap: 'forest',
    chickenX: 200,
    chickenY: 200,
    isPlaying: false,
    direction: 'right' as 'up' | 'down' | 'left' | 'right',
    backgroundObjects: Array.from({ length: 20 }, () => ({
      x: Math.random() * 90,
      y: Math.random() * 90
    }))
  });
  
  // Состояния гонки
  const [raceData, setRaceData] = useState({
    playerX: 150,
    playerY: 400,
    obstacles: [] as Array<{id: number, x: number, y: number}>,
    gameTime: 0,
    isPlaying: false,
    lives: 1,
    speed: 2,
    score: 0
  });

  // Состояния PvP
  const [pvpData, setPvpData] = useState({
    chickens: [] as Array<{id: number, x: number, y: number, speed: number, hp: number, maxHp: number}>,
    weapon: 'pistol',
    ammo: 30,
    kills: 0,
    isPlaying: false,
    gameTime: 0
  });

  // Инвентарь
  const [inventory, setInventory] = useState({
    activeWeapon: 'pistol',
    activeVehicle: 'bike',
    items: [] as number[],
    playerEmoji: '🤖'
  });

  // Состояния мультиплеера
  const [multiplayerData, setMultiplayerData] = useState({
    playerX: 400,
    playerY: 300,
    playerId: `player_${Math.random().toString(36).substr(2, 9)}`,
    isPlaying: false,
    spawnedObjects: [] as Array<{id: string, type: string, x: number, y: number, emoji: string}>,
    bullets: [] as Array<{id: string, x: number, y: number, direction: number}>,
    onlinePlayers: [] as Array<{id: string, nickname: string, x: number, y: number, emoji: string}>,
    currentRoom: 'main',
    selectedSpawnType: 'tree',
    isConnected: false
  });

  // Система аккаунтов
  const [accountData, setAccountData] = useState({
    username: '',
    level: 1,
    xp: 0,
    totalKills: 0,
    gamesWon: 0,
    isLoggedIn: false,
    loginForm: { username: '', password: '' },
    registerForm: { username: '', email: '', password: '' }
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

  // Мультиплеер API
  const MULTIPLAYER_URL = 'https://functions.poehali.dev/51d56b9b-a81f-4756-b894-cdfcc4497f8e';
  
  const multiplayerAPI = {
    async joinRoom(playerId: string, nickname: string, room: string = 'main') {
      const response = await fetch(MULTIPLAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId,
          nickname,
          room
        })
      });
      return response.json();
    },

    async movePlayer(playerId: string, x: number, y: number, room: string = 'main') {
      const response = await fetch(MULTIPLAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          playerId,
          x,
          y,
          room
        })
      });
      return response.json();
    },

    async spawnObject(playerId: string, objectType: string, x: number, y: number, room: string = 'main') {
      const response = await fetch(MULTIPLAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'spawn_object',
          playerId,
          object_type: objectType,
          x,
          y,
          room
        })
      });
      return response.json();
    },

    async shoot(playerId: string, x: number, y: number, direction: number, room: string = 'main') {
      const response = await fetch(MULTIPLAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shoot',
          playerId,
          x,
          y,
          direction,
          room
        })
      });
      return response.json();
    },

    async getState(room: string = 'main') {
      const response = await fetch(MULTIPLAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_state',
          room
        })
      });
      return response.json();
    }
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

  const handleNicknameSubmit = () => {
    const trimmedNick = nicknameInput.trim();
    if (!trimmedNick || trimmedNick.length < 2) {
      alert('❌ Введите ник (минимум 2 символа)!');
      return;
    }
    setNicknameInput(trimmedNick);
    setShowNicknameInput(false);
    startGame('multiplayer');
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

  // Управление для мультиплеера
  useEffect(() => {
    if (currentGame !== 'multiplayer' || !multiplayerData.isPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const moveSpeed = 20;
      setMultiplayerData(prev => {
        let newX = prev.playerX;
        let newY = prev.playerY;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            newY = Math.max(0, prev.playerY - moveSpeed);
            break;
          case 's':
          case 'arrowdown':
            newY = Math.min(window.innerHeight - 60, prev.playerY + moveSpeed);
            break;
          case 'a':
          case 'arrowleft':
            newX = Math.max(0, prev.playerX - moveSpeed);
            break;
          case 'd':
          case 'arrowright':
            newX = Math.min(window.innerWidth - 60, prev.playerX + moveSpeed);
            break;
          case ' ':
          case 'space':
            e.preventDefault();
            // Стрельба на пробел
            const newBullet = {
              id: Date.now(),
              x: prev.playerX + 25,
              y: prev.playerY + 25,
              direction: 0
            };
            return {
              ...prev,
              playerX: newX,
              playerY: newY,
              bullets: [...prev.bullets, newBullet]
            };
        }

        return {
          ...prev,
          playerX: newX,
          playerY: newY
        };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, multiplayerData.isPlaying]);

  // Сохранение прогресса
  useEffect(() => {
    const saveProgress = () => {
      if (accountData.isLoggedIn) {
        const progressData = {
          username: accountData.username,
          level: accountData.level,
          xp: accountData.xp,
          totalKills: accountData.totalKills,
          gamesWon: accountData.gamesWon,
          coins: coins,
          inventory: inventory,
          stats: stats,
          timestamp: Date.now()
        };
        localStorage.setItem(`redGan_progress_${accountData.username}`, JSON.stringify(progressData));
      }
    };

    // Автосохранение каждые 10 секунд
    const saveInterval = setInterval(saveProgress, 10000);
    return () => clearInterval(saveInterval);
  }, [accountData, coins, inventory, stats]);

  // Загрузка прогресса при входе
  const loadProgress = (username: string) => {
    const savedProgress = localStorage.getItem(`redGan_progress_${username}`);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setAccountData(prev => ({
          ...prev,
          level: data.level || 1,
          xp: data.xp || 0,
          totalKills: data.totalKills || 0,
          gamesWon: data.gamesWon || 0
        }));
        setCoins(data.coins || 100);
        setInventory(data.inventory || { activeWeapon: 'pistol', activeVehicle: 'bike', items: [] });
        setStats(data.stats || { gamesPlayed: 0, totalKills: 0, bestTime: 0, totalCoins: 0 });
      } catch (error) {
        console.log('Ошибка загрузки прогресса:', error);
      }
    }
  };

  // Управление для гонок
  useEffect(() => {
    if (currentGame !== 'race' || !raceData.isPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const moveSpeed = 15;
      setRaceData(prev => {
        let newX = prev.playerX;
        let newY = prev.playerY;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            newY = Math.max(50, prev.playerY - moveSpeed);
            break;
          case 's':
          case 'arrowdown':
            newY = Math.min(window.innerHeight - 100, prev.playerY + moveSpeed);
            break;
          case 'a':
          case 'arrowleft':
            newX = Math.max(50, prev.playerX - moveSpeed);
            break;
          case 'd':
          case 'arrowright':
            newX = Math.min(window.innerWidth - 100, prev.playerX + moveSpeed);
            break;
        }

        return {
          ...prev,
          playerX: newX,
          playerY: newY
        };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, raceData.isPlaying]);

  // Управление для мультиплеера
  useEffect(() => {
    if (currentGame !== 'multiplayer' || !multiplayerData.isPlaying) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const moveSpeed = 20;
      
      setMultiplayerData(prev => {
        let newX = prev.playerX;
        let newY = prev.playerY;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            newY = Math.max(0, prev.playerY - moveSpeed);
            break;
          case 's':
          case 'arrowdown':
            newY = Math.min(window.innerHeight - 100, prev.playerY + moveSpeed);
            break;
          case 'a':
          case 'arrowleft':
            newX = Math.max(0, prev.playerX - moveSpeed);
            break;
          case 'd':
          case 'arrowright':
            newX = Math.min(window.innerWidth - 100, prev.playerX + moveSpeed);
            break;
          case 'r':
            // Спавн выбранного объекта на сервере
            multiplayerAPI.spawnObject(prev.playerId, prev.selectedSpawnType, prev.playerX, prev.playerY)
              .then(response => {
                if (response.success && response.game_state) {
                  setMultiplayerData(current => ({
                    ...current,
                    spawnedObjects: response.game_state.objects,
                    onlinePlayers: response.game_state.players.filter((p: any) => p.id !== current.playerId)
                  }));
                }
              })
              .catch(error => console.error('Ошибка спавна объекта:', error));
            return prev;
            
          case ' ':
          case 'space':
            // Стрельба на сервере
            multiplayerAPI.shoot(prev.playerId, prev.playerX + 25, prev.playerY + 25, 0)
              .then(response => {
                if (response.success && response.game_state) {
                  setMultiplayerData(current => ({
                    ...current,
                    bullets: response.game_state.bullets,
                    onlinePlayers: response.game_state.players.filter((p: any) => p.id !== current.playerId)
                  }));
                }
              })
              .catch(error => console.error('Ошибка стрельбы:', error));
            return prev;
        }

        // Обновляем позицию на сервере
        if (newX !== prev.playerX || newY !== prev.playerY) {
          multiplayerAPI.movePlayer(prev.playerId, newX, newY)
            .then(response => {
              if (response.success && response.game_state) {
                setMultiplayerData(current => ({
                  ...current,
                  onlinePlayers: response.game_state.players.filter((p: any) => p.id !== current.playerId),
                  spawnedObjects: response.game_state.objects,
                  bullets: response.game_state.bullets
                }));
              }
            })
            .catch(error => console.error('Ошибка движения:', error));
        }

        return { ...prev, playerX: newX, playerY: newY };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, multiplayerData.isPlaying]);

  // Генерация препятствий и игровая логика гонок
  useEffect(() => {
    if (currentGame !== 'race' || !raceData.isPlaying) return;

    const gameInterval = setInterval(() => {
      setRaceData(prev => {
        let newObstacles = prev.obstacles;
        
        // Добавляем новые препятствия
        if (Math.random() < 0.3) {
          newObstacles = [...prev.obstacles, {
            id: Date.now(),
            x: Math.random() * (window.innerWidth - 100),
            y: -50
          }];
        }
        
        // Двигаем препятствия вниз
        newObstacles = newObstacles
          .map(obstacle => ({ ...obstacle, y: obstacle.y + prev.speed * 2 }))
          .filter(obstacle => obstacle.y < window.innerHeight);
        
        // Проверяем столкновения
        const collision = newObstacles.some(obstacle => 
          Math.abs(obstacle.x - prev.playerX) < 50 && 
          Math.abs(obstacle.y - prev.playerY) < 50
        );
        
        if (collision) {
          playSound('hit');
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            setCurrentGame('menu');
            alert('💥 Игра окончена! Вы врезались!');
            return prev;
          }
          return { ...prev, lives: newLives };
        }

        return {
          ...prev,
          obstacles: newObstacles,
          gameTime: prev.gameTime + 0.1,
          score: prev.score + 1
        };
      });
    }, 100);

    return () => clearInterval(gameInterval);
  }, [currentGame, raceData.isPlaying]);

  // Обновление состояния мультиплеера
  useEffect(() => {
    if (currentGame !== 'multiplayer' || !multiplayerData.isPlaying || !multiplayerData.isConnected) return;

    const syncInterval = setInterval(() => {
      multiplayerAPI.getState('main')
        .then(response => {
          if (response.success && response.game_state) {
            setMultiplayerData(prev => ({
              ...prev,
              onlinePlayers: response.game_state.players.filter((p: any) => p.id !== prev.playerId),
              spawnedObjects: response.game_state.objects,
              bullets: response.game_state.bullets
            }));
          }
        })
        .catch(error => {
          console.error('Ошибка синхронизации:', error);
          setMultiplayerData(prev => ({ ...prev, isConnected: false }));
        });
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(syncInterval);
  }, [currentGame, multiplayerData.isPlaying, multiplayerData.isConnected]);

  const startGame = (gameType: 'race' | 'pvp' | 'sandbox' | 'multiplayer') => {
    playSound('click');
    setCurrentGame(gameType);
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));

    if (gameType === 'race') {
      setRaceData({
        playerX: 150,
        playerY: 400,
        obstacles: [],
        gameTime: 0,
        isPlaying: true,
        lives: inventory.activeVehicle === 'monster-truck' ? 2 : 1,
        speed: inventory.activeVehicle === 'racing-car' ? 3 : 2,
        score: 0
      });
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
    } else if (gameType === 'multiplayer') {
      // Показываем форму ввода ника если пользователь не залогинен
      if (!accountData.isLoggedIn && !nicknameInput) {
        setShowNicknameInput(true);
        return;
      }

      const nickname = nicknameInput || accountData.username || 'Игрок';
      
      setMultiplayerData(prev => ({
        ...prev,
        isPlaying: true,
        isConnected: true,
        spawnedObjects: [],
        bullets: []
      }));
      
      setCurrentGame('multiplayer');
      
      // Подключаемся к серверу
      multiplayerAPI.joinRoom(multiplayerData.playerId, nickname, 'main')
        .then(response => {
          if (response.success) {
            console.log('✅ Подключились к мультиплееру!', response);
            // Обновляем состояние игры с сервера
            if (response.game_state) {
              setMultiplayerData(prev => ({
                ...prev,
                onlinePlayers: response.game_state.players.filter((p: any) => p.id !== prev.playerId),
                spawnedObjects: response.game_state.objects,
                bullets: response.game_state.bullets,
                isConnected: true
              }));
            }
          }
        })
        .catch(error => {
          console.error('❌ Ошибка подключения:', error);
          alert('Не удалось подключиться к серверу');
          setMultiplayerData(prev => ({ ...prev, isConnected: false }));
          setCurrentGame('menu');
        });
    }
  };

  const handleMouseMove = (e: any) => {
    // Логика для управления мышью в играх
  };

  const renderGame = () => {
    if (currentGame === 'race') {
      return (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-green-400 z-50">
          <div className="absolute top-4 left-4 text-white font-bold bg-black/50 rounded-lg p-3">
            <p>⏱️ Время: {Math.floor(raceData.gameTime)}с / 60с</p>
            <p>❤️ Жизни: {raceData.lives}</p>
            <p>🚗 Скорость: {raceData.speed}</p>
            <p>🏆 Очки: {raceData.score}</p>
          </div>
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>
          
          <div className="w-full h-full relative overflow-hidden">
            {/* Дорога */}
            <div className="absolute inset-0 bg-gray-700">
              {/* Разметка дороги */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-12 bg-yellow-400 left-1/2 transform -translate-x-1/2 animate-pulse"
                  style={{
                    top: `${i * 10}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            
            {/* Препятствия */}
            {raceData.obstacles.map((obstacle) => (
              <div
                key={obstacle.id}
                className="absolute text-4xl animate-bounce"
                style={{
                  left: `${obstacle.x}px`,
                  top: `${obstacle.y}px`,
                }}
              >
                🚧
              </div>
            ))}
            
            {/* Игрок */}
            <div 
              className="absolute text-6xl transition-all duration-100 drop-shadow-lg"
              style={{
                left: `${raceData.playerX}px`,
                top: `${raceData.playerY}px`,
              }}
            >
              🏎️
            </div>
            
            {/* Инструкции */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-black/70 text-white rounded-lg p-4">
                <p className="font-bold mb-2">🏁 Управление</p>
                <div className="text-sm space-y-1">
                  <p>A/D или ← → - влево/вправо</p>
                  <p>W/S или ↑ ↓ - вверх/вниз</p>
                  <p>Уворачивайтесь от препятствий! 🚧</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentGame === 'pvp') {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-red-600 to-orange-500 z-50">
          <div className="absolute top-4 left-4 text-white font-bold bg-black/50 rounded-lg p-3">
            <p>🎯 Убийства: {pvpData.kills}/10</p>
            <p>🔫 Патроны: {pvpData.ammo}</p>
            <p>⚔️ Оружие: {inventory.activeWeapon || 'Базовое'}</p>
            <p>⏱️ Время: {Math.floor(pvpData.gameTime)}с</p>
          </div>
          <div className="absolute top-4 right-4">
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm">
              Выход
            </Button>
          </div>
          
          <div className="w-full h-full relative overflow-hidden">
            {/* Фон арены */}
            <div className="absolute inset-0">
              {/* Декорации */}
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-3xl opacity-40"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                  }}
                >
                  {['🗿', '🌋', '💀', '⚔️'][Math.floor(Math.random() * 4)]}
                </div>
              ))}
            </div>
            
            {/* Враги */}
            {pvpData.chickens.map((chicken) => (
              <div
                key={chicken.id}
                className="absolute text-4xl cursor-crosshair hover:scale-125 transition-transform animate-bounce"
                style={{
                  left: `${chicken.x}px`,
                  top: `${chicken.y}px`,
                }}
                onClick={() => {
                  if (pvpData.ammo > 0) {
                    setPvpData(prev => ({
                      ...prev,
                      kills: prev.kills + 1,
                      ammo: prev.ammo - 1,
                      chickens: prev.chickens.filter(c => c.id !== chicken.id).concat([
                        {
                          id: Date.now(),
                          x: Math.random() * (window.innerWidth - 100) + 50,
                          y: Math.random() * (window.innerHeight - 200) + 100,
                          speed: Math.random() * 2 + 1,
                          direction: Math.random() > 0.5 ? 1 : -1
                        }
                      ])
                    }));
                    setCoins(prev => prev + 10);
                    playSound('hit');
                  }
                }}
              >
                🐔
              </div>
            ))}
            
            {/* Прицел */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none animate-pulse">
              🎯
            </div>
            
            {/* Инструкции */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-black/70 text-white rounded-lg p-4">
                <p className="font-bold mb-2">⚔️ Стреляйте по курицам!</p>
                <div className="text-sm space-y-1">
                  <p>Клик по курице = выстрел</p>
                  <p>За убийство +10 монет</p>
                  <p>Цель: 10 убийств</p>
                </div>
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
              {sandboxData.backgroundObjects.map((obj, i) => (
                <div
                  key={i}
                  className="absolute text-2xl opacity-60"
                  style={{
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
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

    if (currentGame === 'login') {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🎮 Вход в аккаунт</h2>
              <p className="text-gray-600">Войдите, чтобы играть в мультиплеере</p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Имя пользователя"
                value={accountData.loginForm.username}
                onChange={(e) => setAccountData(prev => ({
                  ...prev,
                  loginForm: { ...prev.loginForm, username: e.target.value }
                }))}
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={accountData.loginForm.password}
                onChange={(e) => setAccountData(prev => ({
                  ...prev,
                  loginForm: { ...prev.loginForm, password: e.target.value }
                }))}
              />
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    const username = accountData.loginForm.username || 'Игрок';
                    loadProgress(username);
                    setAccountData(prev => ({
                      ...prev,
                      isLoggedIn: true,
                      username: username
                    }));
                    setCurrentGame('multiplayer');
                  }}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Войти и играть
                </Button>
                
                <Button 
                  onClick={() => setCurrentGame('menu')} 
                  variant="outline" 
                  className="w-full"
                >
                  Назад в меню
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentGame === 'multiplayer') {
      return (
        <div className="fixed inset-0 bg-gray-300 z-50">
          {/* UI панель */}
          <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg">
            <p className="font-bold">👤 {accountData.username}</p>
            <p>⭐ Уровень: {accountData.level}</p>
            <p>🎯 Опыт: {accountData.xp % 100}/100</p>
            <p>🌐 Комната: {multiplayerData.currentRoom || 'Основная'}</p>
            <p>👥 Игроков: {multiplayerData.onlinePlayers.length + 1}</p>
            <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(accountData.xp % 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Кнопки управления и статус */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${multiplayerData.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{multiplayerData.isConnected ? 'Подключен' : 'Офлайн'}</span>
              <span className="text-gray-400">|</span>
              <span>👥 {multiplayerData.onlinePlayers.length}</span>
            </div>
            <Button onClick={() => setCurrentGame('menu')} variant="secondary" size="sm" className="w-full">
              Выход
            </Button>
          </div>

          {/* Панель спавна объектов */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg z-50">
            <p className="font-bold mb-2">🛠️ Спавн объектов:</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['🌳', '🗿', '🏠', '🚗', '⭐', '💎'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMultiplayerData(prev => ({ ...prev, selectedSpawnType: ['tree', 'rock', 'house', 'car', 'star', 'gem'][index] }))}
                  className={`w-10 h-10 rounded text-xl z-50 ${
                    multiplayerData.selectedSpawnType === ['tree', 'rock', 'house', 'car', 'star', 'gem'][index] 
                      ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p>R - поставить объект</p>
              <p>Пробел - стрелять</p>
              <p>WASD - движение</p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="absolute bottom-4 right-4 space-x-2">
            <Button 
              onClick={() => {
                const newBullet = {
                  id: Date.now(),
                  x: multiplayerData.playerX + 25,
                  y: multiplayerData.playerY + 25,
                  direction: 0
                };
                setMultiplayerData(prev => ({
                  ...prev,
                  bullets: [...prev.bullets, newBullet]
                }));
                
                // Добавляем опыт за выстрел
                setAccountData(prev => {
                  const newXp = prev.xp + 2;
                  const newLevel = Math.floor(newXp / 100) + 1;
                  return {
                    ...prev,
                    xp: newXp,
                    level: newLevel,
                    totalKills: prev.totalKills + 1
                  };
                });
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              🔫 Стрелять
            </Button>
          </div>

          {/* Игровая область */}
          <div 
            className="w-full h-full relative cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const emojis = ['🌳', '🗿', '🏠', '🚗', '⭐', '💎'];
              const selectedEmoji = emojis[['tree', 'rock', 'house', 'car', 'star', 'gem'].indexOf(multiplayerData.selectedSpawnType)];
              
              setMultiplayerData(prev => ({
                ...prev,
                spawnedObjects: [...prev.spawnedObjects, {
                  id: Date.now(),
                  type: prev.selectedSpawnType,
                  x: x - 25,
                  y: y - 25,
                  emoji: selectedEmoji
                }]
              }));
              
              // Добавляем опыт за размещение объекта
              setAccountData(prev => {
                const newXp = prev.xp + 5;
                const newLevel = Math.floor(newXp / 100) + 1;
                return {
                  ...prev,
                  xp: newXp,
                  level: newLevel
                };
              });
            }}
          >
            {/* Объекты на карте */}
            {multiplayerData.spawnedObjects.map((obj) => (
              <div
                key={obj.id}
                className="absolute text-4xl pointer-events-none"
                style={{ left: `${obj.x}px`, top: `${obj.y}px` }}
              >
                {obj.emoji}
              </div>
            ))}

            {/* Пули */}
            {multiplayerData.bullets.map((bullet) => (
              <div
                key={bullet.id}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }}
              />
            ))}

            {/* Игрок */}
            <div 
              className="absolute text-5xl transition-all duration-100"
              style={{ left: `${multiplayerData.playerX}px`, top: `${multiplayerData.playerY}px` }}
            >
              🤖
            </div>

            {/* Другие игроки */}
            {multiplayerData.onlinePlayers.map((player) => (
              <div
                key={player.id}
                className="absolute transition-all duration-200"
                style={{ left: `${player.x}px`, top: `${player.y}px` }}
              >
                <div className="text-4xl">{player.emoji}</div>
                <div className="text-xs text-center bg-black/50 text-white rounded px-1">
                  {player.nickname}
                </div>
              </div>
            ))}
          </div>

          {/* Управление движением */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:hidden">
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <Button 
                onClick={() => {
                  const newY = Math.max(0, multiplayerData.playerY - 20);
                  setMultiplayerData(prev => ({ ...prev, playerY: newY }));
                  multiplayerAPI.movePlayer(multiplayerData.playerId, multiplayerData.playerX, newY).catch(console.error);
                }}
                className="w-12 h-12"
              >
                ⬆️
              </Button>
              <div></div>
              <Button 
                onClick={() => {
                  const newX = Math.max(0, multiplayerData.playerX - 20);
                  setMultiplayerData(prev => ({ ...prev, playerX: newX }));
                  multiplayerAPI.movePlayer(multiplayerData.playerId, newX, multiplayerData.playerY).catch(console.error);
                }}
                className="w-12 h-12"
              >
                ⬅️
              </Button>
              <div></div>
              <Button 
                onClick={() => {
                  const newX = Math.min(window.innerWidth - 60, multiplayerData.playerX + 20);
                  setMultiplayerData(prev => ({ ...prev, playerX: newX }));
                  multiplayerAPI.movePlayer(multiplayerData.playerId, newX, multiplayerData.playerY).catch(console.error);
                }}
                className="w-12 h-12"
              >
                ➡️
              </Button>
              <div></div>
              <Button 
                onClick={() => {
                  const newY = Math.min(window.innerHeight - 60, multiplayerData.playerY + 20);
                  setMultiplayerData(prev => ({ ...prev, playerY: newY }));
                  multiplayerAPI.movePlayer(multiplayerData.playerId, multiplayerData.playerX, newY).catch(console.error);
                }}
                className="w-12 h-12"
              >
                ⬇️
              </Button>
              <div></div>
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
              <span className="курица красная страх крутость">🐔</span>
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
                <Button onClick={() => setShowNicknameInput(true)} size={isMobile ? "sm" : "default"}>
                  Мультиплеер
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Диалог ввода ника */}
      <Dialog open={showNicknameInput} onOpenChange={setShowNicknameInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🌐 Мультиплеер</DialogTitle>
            <DialogDescription>
              Введите ваш игровой ник для подключения
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Введите ваш ник"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  const nickname = nicknameInput.trim() || 'Игрок';
                  setAccountData(prev => ({
                    ...prev,
                    isLoggedIn: true,
                    username: nickname
                  }));
                  setShowNicknameInput(false);
                  startGame('multiplayer');
                }}
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={!nicknameInput.trim()}
              >
                🚀 Подключиться
              </Button>
              
              <Button 
                onClick={() => setShowNicknameInput(false)} 
                variant="outline" 
                className="w-full"
              >
                Отмена
              </Button>
            </div>
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
          
          {/* Прогресс аккаунта */}
          {accountData.isLoggedIn && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto mb-6">
              <div className="text-center">
                <h3 className="font-bold text-gray-800">👤 {accountData.username}</h3>
                <div className="flex justify-center space-x-4 mt-2 text-sm">
                  <span>⭐ Ур. {accountData.level}</span>
                  <span>🎯 {accountData.totalKills} убийств</span>
                  <span>🏆 {accountData.gamesWon} побед</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-600">Опыт: {accountData.xp % 100}/100</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(accountData.xp % 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
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

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-500">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">🌐</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Мультиплеер</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Играйте с друзьями на пустой карте</p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${multiplayerData.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{multiplayerData.isConnected ? 'Подключен' : 'Офлайн'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Игроков онлайн: {playersOnline}</p>
                </div>

                <Button 
                  onClick={() => accountData.isLoggedIn ? startGame('multiplayer') : setShowNicknameInput(true)} 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  size={isMobile ? "sm" : "default"}
                >
                  {accountData.isLoggedIn ? 'Играть онлайн' : 'Ввести ник'}
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

      {/* Диалог ввода ника для мультиплеера */}
      <Dialog open={showNicknameInput} onOpenChange={setShowNicknameInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🌐 Вход в мультиплеер</DialogTitle>
            <DialogDescription>
              Введите ваш никнейм для игры с другими игроками
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Ваш ник..."
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
              autoFocus
            />
            <Button onClick={handleNicknameSubmit} className="w-full bg-blue-500 hover:bg-blue-600">
              Подключиться 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-game-dark text-white py-6 md:py-8 mt-12 md:mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🐔</span>
            <span className="text-xl md:text-2xl font-bold text-red-700">Игры</span>
          </div>
          <p className="text-gray-300 mb-4">Самые захватывающие игры в одном месте</p>
          <p className="text-xs text-gray-500 mt-2">Поддержка мобильных устройств • Реальный геймплей • {playersOnline} игроков онлайн</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;