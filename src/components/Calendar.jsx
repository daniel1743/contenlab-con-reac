import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Youtube, Instagram, Twitter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { toast } = useToast();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Eventos de ejemplo
  const events = [
    {
      id: 1,
      date: new Date(2024, currentDate.getMonth(), 15),
      title: 'Video YouTube: Tutorial IA',
      platform: 'youtube',
      time: '10:00',
      status: 'scheduled'
    },
    {
      id: 2,
      date: new Date(2024, currentDate.getMonth(), 18),
      title: 'Post Instagram: Tips Productividad',
      platform: 'instagram',
      time: '14:30',
      status: 'scheduled'
    },
    {
      id: 3,
      date: new Date(2024, currentDate.getMonth(), 22),
      title: 'Thread Twitter: Tendencias',
      platform: 'twitter',
      time: '09:15',
      status: 'draft'
    },
    {
      id: 4,
      date: new Date(2024, currentDate.getMonth(), 25),
      title: 'Live Instagram: Q&A',
      platform: 'instagram',
      time: '19:00',
      status: 'scheduled'
    },
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-3 h-3 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-3 h-3 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-3 h-3 text-blue-500" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Calendario de Publicaciones</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Planifica y programa tu contenido en todas las plataformas sociales
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario Principal */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      className="border-purple-500/20 hover:bg-purple-500/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      className="border-purple-500/20 hover:bg-purple-500/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                    return (
                      <motion.div
                        key={index}
                        className={`
                          relative p-2 min-h-[80px] border border-purple-500/10 rounded-lg cursor-pointer
                          transition-all duration-200 hover:border-purple-500/30
                          ${day.isCurrentMonth ? 'bg-transparent' : 'bg-gray-800/30'}
                          ${isToday ? 'ring-2 ring-purple-500' : ''}
                          ${isSelected ? 'bg-purple-500/20' : ''}
                        `}
                        onClick={() => setSelectedDate(day.date)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`text-sm font-medium ${
                          day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                        }`}>
                          {day.date.getDate()}
                        </div>
                        
                        {/* Eventos del día */}
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded bg-purple-500/20 text-purple-200 truncate flex items-center space-x-1"
                            >
                              {getPlatformIcon(event.platform)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Botón Agregar Evento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => toast({
                title: '🚧 Esta función no está implementada aún',
                description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
              })}
              className="w-full gradient-primary hover:opacity-90 h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              Programar Publicación
            </Button>
          </motion.div>

          {/* Eventos del día seleccionado */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg glass-effect border border-purple-500/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getPlatformIcon(event.platform)}
                              <span className="text-sm font-medium text-white">
                                {event.title}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              event.status === 'scheduled' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {event.status === 'scheduled' ? 'Programado' : 'Borrador'}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay eventos programados</p>
                      <p className="text-xs">Haz clic en "Programar Publicación" para añadir uno</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Próximos Eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Próximos Eventos</CardTitle>
                <CardDescription>Publicaciones programadas para esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg glass-effect border border-purple-500/10"
                    >
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(event.platform)}
                        <div>
                          <p className="text-sm font-medium text-white truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {event.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Estadísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Este Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Publicaciones programadas</span>
                    <span className="text-lg font-bold text-white">{events.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Plataformas activas</span>
                    <span className="text-lg font-bold text-white">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Contenido en borrador</span>
                    <span className="text-lg font-bold text-yellow-400">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;