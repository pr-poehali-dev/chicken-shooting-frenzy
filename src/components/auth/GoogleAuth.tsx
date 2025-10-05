import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface GameData {
  coins: number;
  usedPromoCodes: string[];
  inventory: {
    weapons: string[];
    vehicles: string[];
    activeWeapon: string;
    activeVehicle: string;
  };
  stats: {
    gamesPlayed: number;
    totalKills: number;
    bestRaceTime: number;
  };
  sandboxData?: {
    selectedMap: string;
    chickenX: number;
    chickenY: number;
    isPlaying: boolean;
    direction: 'up' | 'down' | 'left' | 'right';
  };
}

interface GoogleAuthProps {
  onLogin: (user: User, gameData: GameData) => void;
  onLogout: () => void;
  user: User | null;
  gameData: GameData;
}

const GoogleAuth = ({ onLogin, onLogout, user, gameData }: GoogleAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Имитация Google Auth (в реальном проекте используйте Google OAuth)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Симуляция входа через Google
    setTimeout(() => {
      const mockUser: User = {
        id: 'google_' + Date.now(),
        name: 'Игрок ' + Math.floor(Math.random() * 1000),
        email: 'player@example.com',
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
      };

      // Попытка загрузить сохраненные данные
      const savedCloudData = localStorage.getItem(`cloudSave_${mockUser.id}`);
      let cloudGameData = gameData;
      
      if (savedCloudData) {
        try {
          cloudGameData = JSON.parse(savedCloudData);
        } catch (error) {
          console.log('Ошибка загрузки облачных данных:', error);
        }
      }

      onLogin(mockUser, cloudGameData);
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    // Сохраняем данные перед выходом
    if (user) {
      localStorage.setItem(`cloudSave_${user.id}`, JSON.stringify(gameData));
    }
    onLogout();
    setShowProfile(false);
  };

  // Автосохранение в облако каждые 30 секунд
  useEffect(() => {
    if (!user) return;

    const saveToCloud = () => {
      localStorage.setItem(`cloudSave_${user.id}`, JSON.stringify(gameData));
      console.log('🌟 Прогресс сохранен в облаке!');
    };

    const interval = setInterval(saveToCloud, 30000);
    return () => clearInterval(interval);
  }, [user, gameData]);

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Icon name="User" size={32} className="text-white" />
          </div>
          <CardTitle className="text-xl font-bold">save progress</CardTitle>
          <CardDescription>
            Сохраняй прогресс в облаке и играй с любого устройства
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Подключение...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name="Mail" size={20} />
                Войти через Google
              </div>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>✅ Облачное сохранение прогресса</p>
            <p>✅ Синхронизация между устройствами</p>
            <p>✅ Безопасность данных</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 border-2 border-blue-500">
        <img 
          src={user.picture} 
          alt={user.name}
          className="w-10 h-10 rounded-full border-2 border-blue-500"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-800 truncate">{user.name}</p>
          <p className="text-xs text-gray-600">🌟 Онлайн</p>
        </div>
        <Button
          onClick={() => setShowProfile(true)}
          variant="outline"
          size="sm"
          className="px-2 py-1"
        >
          <Icon name="Settings" size={16} />
        </Button>
      </div>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />
              Профиль игрока
            </DialogTitle>
            <DialogDescription>
              Управление аккаунтом и статистикой
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">Информация</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Имя:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">ID:</span> {user.id.slice(-8)}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">Игровая статистика</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">💰 Монеты:</span> {gameData.coins}</p>
                <p><span className="font-medium">🎮 Игр сыграно:</span> {gameData.stats?.gamesPlayed || 0}</p>
                <p><span className="font-medium">🎯 Убийств:</span> {gameData.stats?.totalKills || 0}</p>
                <p><span className="font-medium">🏁 Лучшее время:</span> {gameData.stats?.bestRaceTime || 0}с</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">Облачное сохранение</h4>
              <p className="text-sm text-gray-600 mb-2">
                Прогресс автоматически сохраняется каждые 30 секунд
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Синхронизировано
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти из аккаунта
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleAuth;