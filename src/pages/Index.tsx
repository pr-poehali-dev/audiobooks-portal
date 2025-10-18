import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface AudioBook {
  id: number;
  title: string;
  author: string;
  duration: string;
  cover: string;
  audioUrl: string;
  inProgress?: boolean;
  progress?: number;
}

const sampleBooks: AudioBook[] = [
  {
    id: 1,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    duration: "15:42:00",
    cover: "https://cdn.poehali.dev/files/81bab472-98a5-4765-a63f-1c1fc80d5260.jpeg",
    audioUrl: "",
    inProgress: true,
    progress: 35
  },
  {
    id: 2,
    title: "Анна Каренина",
    author: "Лев Толстой",
    duration: "32:15:00",
    cover: "https://cdn.poehali.dev/files/81bab472-98a5-4765-a63f-1c1fc80d5260.jpeg",
    audioUrl: ""
  },
  {
    id: 3,
    title: "Преступление и наказание",
    author: "Федор Достоевский",
    duration: "21:30:00",
    cover: "https://cdn.poehali.dev/files/81bab472-98a5-4765-a63f-1c1fc80d5260.jpeg",
    audioUrl: ""
  },
  {
    id: 4,
    title: "Война и мир",
    author: "Лев Толстой",
    duration: "61:08:00",
    cover: "https://cdn.poehali.dev/files/81bab472-98a5-4765-a63f-1c1fc80d5260.jpeg",
    audioUrl: "",
    inProgress: true,
    progress: 12
  }
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBook, setCurrentBook] = useState<AudioBook | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredBooks = sampleBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const booksInProgress = sampleBooks.filter(book => book.inProgress);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentBook) {
      const currentIndex = sampleBooks.findIndex(b => b.id === currentBook.id);
      const nextIndex = (currentIndex + 1) % sampleBooks.length;
      setCurrentBook(sampleBooks[nextIndex]);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentBook) {
      const currentIndex = sampleBooks.findIndex(b => b.id === currentBook.id);
      const prevIndex = currentIndex === 0 ? sampleBooks.length - 1 : currentIndex - 1;
      setCurrentBook(sampleBooks[prevIndex]);
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current && currentBook && isPlaying) {
      audioRef.current.play();
    }
  }, [currentBook]);

  const renderHome = () => (
    <div className="space-y-12">
      <div className="text-center space-y-4 py-12 animate-fade-in">
        <h1 className="text-6xl font-bold text-foreground mb-4">Аудиобиблиотека</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Погрузитесь в мир литературы через звук
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book, index) => (
          <Card 
            key={book.id} 
            className="overflow-hidden hover-scale cursor-pointer group transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => {
              setCurrentBook(book);
              setIsPlaying(true);
              setActiveSection('player');
            }}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {book.duration}
                </span>
                {book.inProgress && (
                  <span className="text-primary font-medium">{book.progress}%</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInProgress = () => (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">Книги в работе</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksInProgress.map((book) => (
          <Card 
            key={book.id} 
            className="overflow-hidden hover-scale cursor-pointer"
            onClick={() => {
              setCurrentBook(book);
              setIsPlaying(true);
              setActiveSection('player');
            }}
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{book.progress}% прослушано</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPlayer = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
        <img 
          src={currentBook?.cover || "https://cdn.poehali.dev/files/81bab472-98a5-4765-a63f-1c1fc80d5260.jpeg"} 
          alt={currentBook?.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{currentBook?.title || "Выберите аудиокнигу"}</h2>
        <p className="text-lg text-muted-foreground">{currentBook?.author}</p>
      </div>

      <div className="space-y-4">
        <Slider 
          value={[currentTime]} 
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-14 w-14 rounded-full"
          onClick={handlePrevious}
        >
          <Icon name="SkipBack" size={28} />
        </Button>
        
        <Button 
          size="icon" 
          className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Icon name="Pause" size={36} />
          ) : (
            <Icon name="Play" size={36} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-14 w-14 rounded-full"
          onClick={handleNext}
        >
          <Icon name="SkipForward" size={28} />
        </Button>
      </div>

      <audio 
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-8">
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Поиск по названию или автору..."
            className="pl-12 h-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <Card 
            key={book.id} 
            className="overflow-hidden hover-scale cursor-pointer"
            onClick={() => {
              setCurrentBook(book);
              setIsPlaying(true);
              setActiveSection('player');
            }}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-4xl font-bold text-center">Обо мне</h2>
      <Card className="p-8 space-y-6">
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Добро пожаловать в мою аудиобиблиотеку! Я профессиональный чтец с многолетним опытом озвучивания классической и современной литературы.
          </p>
          <p>
            Моя миссия — сделать великие произведения доступными для всех, кто любит слушать книги в дороге, во время прогулок или просто отдыхая дома.
          </p>
          <p>
            Каждая аудиокнига создается с любовью и вниманием к деталям, чтобы передать атмосферу и эмоции произведения.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderOrder = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-4xl font-bold text-center">Заказать озвучку</h2>
      
      <Card className="p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Что входит в услугу</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Icon name="Check" size={24} className="text-primary flex-shrink-0 mt-1" />
              <span>Профессиональная озвучка с выразительной интонацией</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="Check" size={24} className="text-primary flex-shrink-0 mt-1" />
              <span>Качественная обработка звука и мастеринг</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="Check" size={24} className="text-primary flex-shrink-0 mt-1" />
              <span>Разделение на удобные главы</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="Check" size={24} className="text-primary flex-shrink-0 mt-1" />
              <span>Предоставление файлов в формате MP3</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="Check" size={24} className="text-primary flex-shrink-0 mt-1" />
              <span>Возможность правок и корректировок</span>
            </li>
          </ul>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-2xl font-semibold">Стоимость</h3>
          <div className="grid gap-4">
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="font-medium">Короткий рассказ (до 10 страниц)</span>
              <span className="text-xl font-bold text-primary">от 5 000 ₽</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="font-medium">Повесть (до 100 страниц)</span>
              <span className="text-xl font-bold text-primary">от 25 000 ₽</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="font-medium">Роман (более 100 страниц)</span>
              <span className="text-xl font-bold text-primary">договорная</span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button className="w-full h-14 text-lg">
            Связаться со мной
            <Icon name="MessageCircle" size={20} className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Icon name="Headphones" size={32} className="text-primary" />
              <span className="text-2xl font-bold">AudioLib</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={activeSection === 'home' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('home')}
                className="gap-2"
              >
                <Icon name="Home" size={18} />
                Главная
              </Button>
              <Button 
                variant={activeSection === 'progress' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('progress')}
                className="gap-2"
              >
                <Icon name="BookOpen" size={18} />
                В работе
              </Button>
              <Button 
                variant={activeSection === 'player' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('player')}
                className="gap-2"
              >
                <Icon name="Play" size={18} />
                Плеер
              </Button>
              <Button 
                variant={activeSection === 'search' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('search')}
                className="gap-2"
              >
                <Icon name="Search" size={18} />
                Поиск
              </Button>
              <Button 
                variant={activeSection === 'about' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('about')}
                className="gap-2"
              >
                <Icon name="User" size={18} />
                Обо мне
              </Button>
              <Button 
                variant={activeSection === 'order' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('order')}
                className="gap-2"
              >
                <Icon name="Mic" size={18} />
                Заказать
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && renderHome()}
        {activeSection === 'progress' && renderInProgress()}
        {activeSection === 'player' && renderPlayer()}
        {activeSection === 'search' && renderSearch()}
        {activeSection === 'about' && renderAbout()}
        {activeSection === 'order' && renderOrder()}
      </main>
    </div>
  );
}
