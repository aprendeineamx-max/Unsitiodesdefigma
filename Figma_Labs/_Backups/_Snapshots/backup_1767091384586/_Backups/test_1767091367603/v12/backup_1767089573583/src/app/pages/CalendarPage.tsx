import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'class' | 'workshop' | 'exam' | 'meeting';
  date: Date;
  startTime: string;
  endTime: string;
  instructor: string;
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events: Event[] = [
    {
      id: '1',
      title: 'Live: React Avanzado - Hooks y Patrones',
      type: 'class',
      date: new Date(2024, 11, 23, 18, 0),
      startTime: '18:00',
      endTime: '20:00',
      instructor: 'Carlos Fernández',
      attendees: 245,
      maxAttendees: 300,
      isRegistered: true
    },
    {
      id: '2',
      title: 'Workshop: Diseño de Sistemas Escalables',
      type: 'workshop',
      date: new Date(2024, 11, 24, 16, 0),
      startTime: '16:00',
      endTime: '18:30',
      instructor: 'Roberto Silva',
      attendees: 89,
      maxAttendees: 100,
      isRegistered: false
    },
    {
      id: '3',
      title: 'Examen Final: Python para Data Science',
      type: 'exam',
      date: new Date(2024, 11, 25, 10, 0),
      startTime: '10:00',
      endTime: '12:00',
      instructor: 'Laura Gómez',
      attendees: 0,
      maxAttendees: 0,
      isRegistered: true
    },
    {
      id: '4',
      title: 'Reunión de Grupo: JavaScript Fundamentals',
      type: 'meeting',
      date: new Date(2024, 11, 26, 19, 0),
      startTime: '19:00',
      endTime: '20:30',
      instructor: 'Ana López',
      attendees: 12,
      maxAttendees: 20,
      isRegistered: true
    }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => 
      event.date.getDate() === dateToCheck.getDate() &&
      event.date.getMonth() === dateToCheck.getMonth() &&
      event.date.getFullYear() === dateToCheck.getFullYear()
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'workshop': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'exam': return 'bg-red-100 text-red-700 border-red-200';
      case 'meeting': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'class': return 'Clase en vivo';
      case 'workshop': return 'Workshop';
      case 'exam': return 'Examen';
      case 'meeting': return 'Reunión';
      default: return type;
    }
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl mb-2">Calendario</h1>
            <p className="text-gray-600">Organiza tus clases en vivo, workshops y exámenes</p>
          </div>
          <button className="bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar evento
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayEvents = getEventsForDate(day);
                  const isToday = 
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                        isToday
                          ? 'border-[#98ca3f] bg-[#98ca3f]/10'
                          : dayEvents.length > 0
                            ? 'border-blue-200 hover:border-blue-400'
                            : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{day}</div>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-1 mt-1 justify-center flex-wrap">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Próximos eventos
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className={`border-2 rounded-lg p-3 ${getEventTypeColor(event.type)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium">{getEventTypeLabel(event.type)}</span>
                      {event.isRegistered && (
                        <span className="text-xs bg-white px-2 py-1 rounded">Registrado</span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-2">{event.title}</h4>
                    <div className="space-y-1 text-xs">
                      <p className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {event.date.toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime} - {event.endTime}
                      </p>
                      {event.maxAttendees > 0 && (
                        <p className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees}/{event.maxAttendees}
                        </p>
                      )}
                    </div>
                    {!event.isRegistered && event.type !== 'exam' && (
                      <button className="w-full mt-3 bg-white hover:bg-gray-50 px-3 py-2 rounded text-xs font-medium transition-colors">
                        Registrarse
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Leyenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span>Clase en vivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500" />
                  <span>Workshop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span>Examen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Reunión de grupo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
