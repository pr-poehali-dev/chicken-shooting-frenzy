import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [selectedMode, setSelectedMode] = useState('');
  const [coins, setCoins] = useState(1250);
  const [promoCode, setPromoCode] = useState('');
  const [usedPromoCodes, setUsedPromoCodes] = useState<string[]>([]);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [racePosition, setRacePosition] = useState(1);
  const [playersOnline, setPlayersOnline] = useState(2847);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Мобильная проверка
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Звуковые эффекты
  const playSound = (type: 'click' | 'coin' | 'error' | 'race') => {
    const sounds = {
      click: '🔊',
      coin: '💰',
      error: '❌',
      race: '🏁'
    };
    console.log(`Playing sound: ${sounds[type]}`);
  };

  const gameModes = [
    {
      id: 'pvp',
      title: 'PvP Битвы',
      description: 'Сражайся с другими игроками в динамичных перестрелках',
      icon: 'Crosshair',
      color: 'bg-game-orange',
      players: `${playersOnline} игроков онлайн`,
      multiplayer: true
    },
    {
      id: 'races',
      title: 'Гонки',
      description: 'Доезжай первым! Обгоняй соперников на крутых трассах',
      icon: 'Car',
      color: 'bg-game-green',
      players: '8 игроков в гонке',
      multiplayer: true
    },
    {
      id: 'sandbox',
      title: 'Песочница',
      description: 'Свободно исследуй мир и тестируй новое оружие',
      icon: 'Map',
      color: 'bg-game-yellow',
      players: 'Одиночная игра',
      multiplayer: false
    },
    {
      id: 'shop',
      title: 'Магазин',
      description: 'Кастомизируй куриц, покупай оружие за монеты',
      icon: 'ShoppingBag',
      color: 'bg-game-blue',
      players: '127 предметов',
      multiplayer: false
    }
  ];

  const shopItems = [
    {
      id: 1,
      name: 'Боевая курица',
      type: 'character',
      price: 500,
      image: '/img/d77ba6ae-11c2-40de-afb6-9454bd89ae34.jpg',
      rarity: 'Редкая',
      description: 'Опытный боец с увеличенным здоровьем'
    },
    {
      id: 2,
      name: 'Золотой автомат',
      type: 'weapon',
      price: 800,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Эпическая',
      description: 'Увеличенный урон и скорострельность'
    },
    {
      id: 3,
      name: 'Красная шляпа',
      type: 'accessory',
      price: 200,
      image: '/img/d77ba6ae-11c2-40de-afb6-9454bd89ae34.jpg',
      rarity: 'Обычная',
      description: 'Стильный аксессуар для твоей курицы'
    },
    {
      id: 4,
      name: 'Гоночная машина',
      type: 'vehicle',
      price: 1200,
      image: '/img/5d22640a-5af8-46ec-b1ba-93f244fc9716.jpg',
      rarity: 'Эпическая',
      description: 'Максимальная скорость в гонках'
    },
    {
      id: 5,
      name: 'Дробовик',
      type: 'weapon',
      price: 600,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Редкая',
      description: 'Высокий урон на близкой дистанции'
    },
    {
      id: 6,
      name: 'Пистолет новичка',
      type: 'weapon',
      price: 100,
      image: '/img/a7f38b6b-0ef4-4eee-8148-3960f69ff529.jpg',
      rarity: 'Обычная',
      description: 'Надежное базовое оружие'
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

  const startRace = () => {
    playSound('race');
    setIsRacing(true);
    setRaceProgress(0);
    setRacePosition(Math.floor(Math.random() * 3) + 1);
    
    const raceInterval = setInterval(() => {
      setRaceProgress(prev => {
        if (prev >= 100) {
          clearInterval(raceInterval);
          setIsRacing(false);
          const reward = racePosition === 1 ? 150 : racePosition === 2 ? 100 : 50;
          setCoins(prevCoins => prevCoins + reward);
          playSound('coin');
          alert(`🏁 Гонка завершена! Место: ${racePosition}. Награда: ${reward} монет`);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 100);
  };

  const buyItem = (item: any) => {
    playSound('click');
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      playSound('coin');
      alert(`✅ Куплено: ${item.name}!`);
    } else {
      playSound('error');
      alert('❌ Недостаточно монет!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-orange/20 via-game-yellow/20 to-game-blue/20 font-rubik">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b-4 border-game-orange shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-game-orange rounded-full flex items-center justify-center animate-bounce-in">
              <span className="text-2xl">🐔</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">CHICKEN GUN</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 bg-game-yellow px-2 md:px-4 py-1 md:py-2 rounded-full">
              <Icon name="Coins" size={isMobile ? 16 : 20} />
              <span className="font-bold text-gray-800 text-sm md:text-base">{coins}</span>
            </div>
            {!isMobile && (
              <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-bold">{playersOnline} онлайн</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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

          <TabsContent value="modes" className="space-y-6">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Выбери свой путь к победе!</h2>
              <p className="text-lg text-gray-600">Динамичные битвы, крутые гонки и безграничные возможности</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gameModes.map((mode, index) => (
                <Card 
                  key={mode.id} 
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-orange animate-scale-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    playSound('click');
                  }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${mode.color} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                      <Icon name={mode.icon as any} size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">{mode.title}</CardTitle>
                    <CardDescription className="text-gray-600">{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center items-center mb-3">
                      <Badge variant="secondary" className="text-xs md:text-sm">{mode.players}</Badge>
                      {mode.multiplayer && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <Icon name="Users" size={12} className="mr-1" />
                          Мультиплеер
                        </Badge>
                      )}
                    </div>
                    <Button 
                      className={`w-full ${mode.color} hover:opacity-90 text-white font-bold py-2 px-4 rounded-full text-sm md:text-base`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mode.id === 'races') {
                          startRace();
                        } else {
                          playSound('click');
                          alert(`🎮 Запуск режима: ${mode.title}`);
                        }
                      }}
                    >
                      {mode.id === 'races' ? 'Начать гонку' : 'Играть'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isRacing && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-4 border-game-green animate-bounce-in">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
                  🏁 Гонка в процессе! Позиция: {racePosition}
                </h3>
                <Progress value={raceProgress} className="mb-4" />
                <div className="text-center">
                  <span className="text-sm md:text-base text-gray-600">Прогресс: {Math.round(raceProgress)}%</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shop" className="space-y-6">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Магазин кастомизации</h2>
              <p className="text-lg text-gray-600">Сделай свою курицу уникальной!</p>
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
                          variant={item.rarity === 'Эпическая' ? 'destructive' : item.rarity === 'Редкая' ? 'default' : 'secondary'}
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
                        disabled={coins < item.price}
                        onClick={() => buyItem(item)}
                      >
                        {coins >= item.price ? 'Купить' : 'Недостаточно монет'}
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
          <p className="text-sm md:text-base text-gray-600">🐔 Chicken Gun - Веселые перестрелки и крутые гонки! 🏁</p>
          <p className="text-xs text-gray-500 mt-2">Поддержка мобильных устройств • Мультиплеер • Звуковые эффекты</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;