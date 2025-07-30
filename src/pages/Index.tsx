import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [selectedMode, setSelectedMode] = useState('');
  const [coins, setCoins] = useState(1250);

  const gameModes = [
    {
      id: 'pvp',
      title: 'PvP Битвы',
      description: 'Сражайся с другими игроками в динамичных перестрелках',
      icon: 'Crosshair',
      color: 'bg-game-orange',
      players: '8 игроков онлайн'
    },
    {
      id: 'races',
      title: 'Гонки',
      description: 'Участвуй в захватывающих гонках на крутых машинках',
      icon: 'Car',
      color: 'bg-game-green',
      players: '12 трасс доступно'
    },
    {
      id: 'sandbox',
      title: 'Песочница',
      description: 'Свободно исследуй мир и тестируй новое оружие',
      icon: 'Map',
      color: 'bg-game-yellow',
      players: 'Безлимитное время'
    },
    {
      id: 'shop',
      title: 'Магазин',
      description: 'Кастомизируй своих куриц и покупай новое оружие',
      icon: 'ShoppingBag',
      color: 'bg-game-blue',
      players: '47 предметов'
    }
  ];

  const shopItems = [
    {
      id: 1,
      name: 'Боевая курица',
      type: 'character',
      price: 500,
      image: '/img/d77ba6ae-11c2-40de-afb6-9454bd89ae34.jpg',
      rarity: 'Редкая'
    },
    {
      id: 2,
      name: 'Золотой автомат',
      type: 'weapon',
      price: 800,
      image: '/img/d77ba6ae-11c2-40de-afb6-9454bd89ae34.jpg',
      rarity: 'Эпическая'
    },
    {
      id: 3,
      name: 'Красная шляпа',
      type: 'accessory',
      price: 200,
      image: '/img/d77ba6ae-11c2-40de-afb6-9454bd89ae34.jpg',
      rarity: 'Обычная'  
    }
  ];

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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-game-yellow px-4 py-2 rounded-full">
              <Icon name="Coins" size={20} />
              <span className="font-bold text-gray-800">{coins}</span>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="modes" className="text-lg font-bold">
              <Icon name="Gamepad2" size={20} className="mr-2" />
              Игровые Режимы
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-lg font-bold">
              <Icon name="ShoppingBag" size={20} className="mr-2" />
              Магазин
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
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${mode.color} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                      <Icon name={mode.icon as any} size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">{mode.title}</CardTitle>
                    <CardDescription className="text-gray-600">{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="mb-4">{mode.players}</Badge>
                    <Button className={`w-full ${mode.color} hover:opacity-90 text-white font-bold py-2 px-4 rounded-full`}>
                      Играть
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedMode && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-4 border-game-orange animate-bounce-in">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  🎮 Режим выбран: {gameModes.find(m => m.id === selectedMode)?.title}
                </h3>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" className="bg-game-orange hover:bg-game-orange/90 text-white font-bold">
                    Быстрая игра
                  </Button>
                  <Button size="lg" variant="outline">
                    Создать комнату
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shop" className="space-y-6">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Магазин кастомизации</h2>
              <p className="text-lg text-gray-600">Сделай свою курицу уникальной!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-transparent hover:border-game-blue animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">{item.name}</CardTitle>
                    <Badge 
                      variant={item.rarity === 'Эпическая' ? 'destructive' : item.rarity === 'Редкая' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {item.rarity}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Icon name="Coins" size={20} className="text-game-yellow" />
                      <span className="text-xl font-bold text-gray-800">{item.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-game-blue hover:bg-game-blue/90 text-white font-bold"
                      disabled={coins < item.price}
                    >
                      {coins >= item.price ? 'Купить' : 'Недостаточно монет'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-game-orange to-game-yellow rounded-2xl p-6 text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-4">
                💰 Получи больше монет!
              </h3>
              <p className="text-white/90 mb-4">Побеждай в битвах и участвуй в гонках, чтобы заработать монеты</p>
              <Button size="lg" variant="secondary" className="font-bold">
                Играть за монеты
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t-4 border-game-orange mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">🐔 Chicken Gun - Веселые перестрелки и крутые гонки! 🏁</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;