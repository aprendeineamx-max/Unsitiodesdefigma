import { useState } from 'react';
import { Users, Video, Calendar, MessageSquare, Plus, Search, Lock, Globe, TrendingUp } from 'lucide-react';
import { studyGroups } from '../data/studyGroups';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function StudyGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState(studyGroups[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'members' | 'activity'>('overview');
  const [newMessage, setNewMessage] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Add message to group (this would be an API call)
      console.log('Message sent:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl mb-2 text-gray-900 dark:text-white">Grupos de Estudio</h1>
            <p className="text-gray-600 dark:text-gray-400">Aprende en comunidad con tutores y compañeros</p>
          </div>
          <button className="bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Crear grupo
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text"
                  placeholder="Buscar grupos..."
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                />
              </div>
            </div>

            {studyGroups.map((group) => (
              <div 
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-all ${
                  selectedGroup.id === group.id ? 'ring-2 ring-[#98ca3f]' : 'hover:shadow-md dark:hover:border-[#98ca3f]/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback 
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-gray-900 dark:text-white">{group.name}</h3>
                      {group.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{group.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group.members.length + group.tutors.length}/{group.maxMembers}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {group.sessions.length} sesiones
                  </span>
                </div>

                {group.nextSession && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-[#98ca3f] font-medium">
                      Próxima sesión: {new Date(group.nextSession.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Group Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="relative h-48">
                <ImageWithFallback 
                  src={selectedGroup.image}
                  alt={selectedGroup.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl mb-2">{selectedGroup.name}</h2>
                  <p className="text-sm opacity-90">{selectedGroup.description}</p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Users className="w-6 h-6 text-[#98ca3f] mx-auto mb-1" />
                  <p className="text-2xl mb-1 text-gray-900 dark:text-white">{selectedGroup.members.length + selectedGroup.tutors.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Miembros</p>
                </div>
                <div className="text-center">
                  <Video className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl mb-1 text-gray-900 dark:text-white">{selectedGroup.sessions.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl mb-1 text-gray-900 dark:text-white">
                    {selectedGroup.members.reduce((sum, m) => sum + m.contributions, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contribuciones</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 p-2">
                  {[
                    { id: 'overview', label: 'Resumen' },
                    { id: 'sessions', label: 'Sesiones' },
                    { id: 'members', label: 'Miembros' },
                    { id: 'activity', label: 'Actividad' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#98ca3f] text-[#121f3d]'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {selectedGroup.nextSession && (
                      <div className="bg-gradient-to-r from-[#98ca3f]/10 to-blue-50 dark:from-[#98ca3f]/20 dark:to-blue-900/20 rounded-lg p-6 border-l-4 border-[#98ca3f]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-5 h-5 text-[#98ca3f]" />
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Próxima sesión</h3>
                            </div>
                            <h4 className="text-xl mb-2 text-gray-900 dark:text-white">{selectedGroup.nextSession.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              📅 {formatDate(selectedGroup.nextSession.date)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>⏱️ {selectedGroup.nextSession.duration} min</span>
                              <span>👨‍🏫 {selectedGroup.nextSession.tutor}</span>
                              <span>👥 {selectedGroup.nextSession.attendees}/{selectedGroup.nextSession.maxAttendees}</span>
                            </div>
                          </div>
                          <button className="bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors whitespace-nowrap">
                            Unirse a la sesión
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Tutores del grupo</h3>
                      <div className="space-y-3">
                        {selectedGroup.tutors.map((tutor) => (
                          <div key={tutor.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img 
                              src={tutor.avatar}
                              alt={tutor.name}
                              className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{tutor.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{tutor.contributions} contribuciones</p>
                            </div>
                            <span className="bg-[#98ca3f] text-[#121f3d] text-xs px-3 py-1 rounded-full">
                              Tutor
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div className="space-y-4">
                    {selectedGroup.sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{session.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(session.date)}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            session.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : session.status === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {session.status === 'completed' ? 'Completada' : 
                             session.status === 'in_progress' ? 'En progreso' : 'Programada'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>⏱️ {session.duration} min</span>
                          <span>👥 {session.attendees}/{session.maxAttendees}</span>
                          <span>👨‍🏫 {session.tutor}</span>
                        </div>
                        {session.status === 'completed' && (
                          <button className="mt-3 text-sm text-[#98ca3f] hover:underline">
                            Ver grabación →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[...selectedGroup.tutors, ...selectedGroup.members].map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 rounded-lg">
                          <img 
                            src={member.avatar}
                            alt={member.name}
                            className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-gray-900 dark:text-white">{member.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{member.contributions} contribuciones</p>
                          </div>
                          {member.role === 'tutor' && (
                            <span className="bg-[#98ca3f] text-[#121f3d] text-xs px-2 py-1 rounded flex-shrink-0">
                              Tutor
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    {/* Message Input */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje al grupo..."
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg p-3 min-h-24 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={sendMessage}
                          className="bg-[#98ca3f] text-[#121f3d] px-6 py-2 rounded-lg hover:bg-[#87b935] transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="space-y-4">
                      {selectedGroup.activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">{activity.user}</span>
                              {' '}
                              <span className="text-gray-600 dark:text-gray-400">{activity.content}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
