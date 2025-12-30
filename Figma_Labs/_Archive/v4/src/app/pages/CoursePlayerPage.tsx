import { useState, useEffect, useRef } from 'react';
import { Play, FileText, HelpCircle, Volume2, CheckCircle2, Lock, ChevronDown, ChevronUp, BookOpen, FolderOpen, PanelRightClose, PanelRightOpen, Send, Sparkles, MessageSquare, X } from 'lucide-react';
import { courseUnits, courseModules, quizQuestions } from '../data/courseContent';

interface ChatMessage {
  id: number;
  sender: 'user' | 'tutor';
  text: string;
  time: string;
}

interface LessonChats {
  [lessonId: string]: ChatMessage[];
}

export function CoursePlayerPage() {
  const [currentLesson, setCurrentLesson] = useState(courseModules[0].lessons[3]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['unit-1']);
  const [expandedModules, setExpandedModules] = useState<string[]>(['1']);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [lessonChats, setLessonChats] = useState<LessonChats>({});
  const [highlightedLessonId, setHighlightedLessonId] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatHeaderRef = useRef<HTMLDivElement>(null);
  const activeLessonRef = useRef<HTMLButtonElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Initialize or load chat history for current lesson
  const currentChatMessages = lessonChats[currentLesson.id] || [];

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('lessonChats');
    if (savedChats) {
      setLessonChats(JSON.parse(savedChats));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(lessonChats).length > 0) {
      localStorage.setItem('lessonChats', JSON.stringify(lessonChats));
    }
  }, [lessonChats]);

  // Initialize chat for new lesson if not exists
  useEffect(() => {
    if (!lessonChats[currentLesson.id]) {
      const welcomeMessage: ChatMessage = {
        id: 1,
        sender: 'tutor',
        text: '¡Hola! 👋 Soy tu Tutor IA. Estoy aquí para ayudarte a entender mejor esta lección. ¿Tienes alguna pregunta sobre el contenido?',
        time: 'Ahora'
      };
      setLessonChats(prev => ({
        ...prev,
        [currentLesson.id]: [welcomeMessage]
      }));
    }
  }, [currentLesson.id]);

  // Hide chat and scroll to top when lesson changes
  useEffect(() => {
    setIsChatVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLesson.id]);

  // Detect scroll to minimize header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear highlight when sidebar is hidden
  useEffect(() => {
    if (!isSidebarVisible) {
      setHighlightedLessonId(null);
    }
  }, [isSidebarVisible]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleToggleSidebarWithFocus = () => {
    const newVisibility = !isSidebarVisible;
    setIsSidebarVisible(newVisibility);

    // Si se está mostrando el sidebar, enfocamos en la lección actual
    if (newVisibility) {
      // Encontrar la unidad y módulo que contienen la lección actual
      let currentUnitId = '';
      let currentModuleId = '';

      courseUnits.forEach(unit => {
        unit.modules.forEach(module => {
          const hasLesson = module.lessons.some(lesson => lesson.id === currentLesson.id);
          if (hasLesson) {
            currentUnitId = unit.id;
            currentModuleId = module.id;
          }
        });
      });

      // Colapsar todas las unidades excepto la que contiene la lección actual
      setExpandedUnits([currentUnitId]);
      
      // Expandir solo el módulo que contiene la lección actual
      setExpandedModules([currentModuleId]);

      // Activar el efecto de resaltado
      setHighlightedLessonId(currentLesson.id);

      // Usar requestAnimationFrame múltiples veces para asegurar que el DOM esté completamente renderizado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (activeLessonRef.current) {
              // Usar scrollIntoView que es más confiable
              activeLessonRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          }, 100);
        });
      });

      // Quitar el resaltado después de 3 segundos
      setTimeout(() => {
        setHighlightedLessonId(null);
      }, 3300);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4 text-blue-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-orange-500" />;
      case 'audio': return <Volume2 className="w-4 h-4 text-green-500" />;
      case 'infographic': return (
        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
      case 'exercise': return (
        <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
      default: return <Play className="w-4 h-4" />;
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const currentMessages = lessonChats[currentLesson.id] || [];
    const newUserMessage: ChatMessage = {
      id: currentMessages.length + 1,
      sender: 'user',
      text: chatMessage,
      time: 'Ahora'
    };
    
    // Update chat for current lesson
    setLessonChats(prev => ({
      ...prev,
      [currentLesson.id]: [...currentMessages, newUserMessage]
    }));
    setChatMessage('');
    
    // Simular respuesta del tutor IA
    setTimeout(() => {
      const tutorResponse: ChatMessage = {
        id: currentMessages.length + 2,
        sender: 'tutor',
        text: 'Excelente pregunta. Basándome en el contenido de esta lección, puedo ayudarte con eso. En React, los hooks son funciones especiales que te permiten "enganchar" características de React como el estado y el ciclo de vida en componentes funcionales. ¿Quieres que profundice en algún hook específico?',
        time: 'Ahora'
      };
      setLessonChats(prev => ({
        ...prev,
        [currentLesson.id]: [...(prev[currentLesson.id] || []), tutorResponse]
      }));
      
      // Scroll to bottom of chat
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 1000);
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    // Focus on input and scroll to chat header when opening chat
    if (!isChatVisible) {
      setTimeout(() => {
        chatInputRef.current?.focus();
        // Scroll to show chat header using scrollIntoView
        if (chatHeaderRef.current) {
          // Get header height (navbar 64px + lesson header height)
          const lessonHeader = document.querySelector('.sticky.top-\\[64px\\]');
          const lessonHeaderHeight = lessonHeader ? lessonHeader.getBoundingClientRect().height : 0;
          const totalHeaderHeight = 64 + lessonHeaderHeight + 8; // 64px navbar + lesson header + 8px spacing
          
          const chatPosition = chatHeaderRef.current.getBoundingClientRect().top;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          window.scrollTo({
            top: scrollTop + chatPosition - totalHeaderHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const renderLessonContent = () => {
    switch (currentLesson.type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={currentLesson.url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📄 Configuración del Entorno de Desarrollo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lectura recomendada • 15 min</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Instalar Node.js
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Descarga Node.js desde <span className="font-mono text-sm bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600">nodejs.org</span>. Recomendamos la versión LTS para mayor estabilidad.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tip: Verifica la instalación con <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded">node --version</code></span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Instalar Visual Studio Code
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    VS Code es el editor recomendado para desarrollo React. Descárgalo desde <span className="font-mono text-sm bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600">code.visualstudio.com</span>.
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Extensiones recomendadas:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        ES7+ React/Redux/React-Native snippets
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        ESLint
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        Prettier - Code formatter
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Crear tu primer proyecto
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Utiliza Create React App para inicializar un nuevo proyecto con todas las configuraciones necesarias.
                  </p>
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-gray-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-gray-700">
                      <span className="text-xs text-gray-400 font-mono">Terminal</span>
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">
                        Copiar código
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-sm text-gray-100 font-mono leading-relaxed">{`npx create-react-app my-first-app\ncd my-first-app\nnpm start`}</code>
                    </pre>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tu aplicación se abrirá automáticamente en <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded">http://localhost:3000</code></span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors font-semibold shadow-lg shadow-[#98ca3f]/20 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF completo
                </button>
                <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz: Fundamentos de React</h3>
                <p className="text-gray-600 dark:text-gray-400">Responde las siguientes preguntas para evaluar tu conocimiento</p>
              </div>
              
              {quizQuestions.map((question, qIndex) => (
                <div key={question.id} className="mb-6 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[question.id] === oIndex;
                      const isCorrect = oIndex === question.correctAnswer;
                      const showFeedback = showResults && isSelected;
                      
                      return (
                        <button
                          key={oIndex}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: oIndex })}
                          disabled={showResults}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium ${
                            showFeedback 
                              ? isCorrect 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              : isSelected
                                ? 'border-[#98ca3f] bg-[#98ca3f]/10 dark:bg-[#98ca3f]/20 text-gray-900 dark:text-white'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-[#98ca3f] hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'border-[#98ca3f] bg-[#98ca3f]' 
                                : 'border-gray-400 dark:border-gray-500'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {showResults && quizAnswers[question.id] !== undefined && (
                    <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                      quizAnswers[question.id] === question.correctAnswer
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300'
                    }`}>
                      <p className="font-bold mb-2 flex items-center gap-2">
                        {quizAnswers[question.id] === question.correctAnswer ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            ¡Correcto!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Explicación:
                          </>
                        )}
                      </p>
                      <p className="text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                onClick={() => setShowResults(!showResults)}
                className="w-full bg-[#98ca3f] text-[#121f3d] px-6 py-4 rounded-lg hover:bg-[#87b935] transition-colors font-semibold text-lg shadow-lg shadow-[#98ca3f]/20"
              >
                {showResults ? '🔄 Reintentar Quiz' : '✓ Verificar Respuestas'}
              </button>
              
              {showResults && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-center font-semibold text-blue-900 dark:text-blue-300">
                    📊 Puntuación: {Object.values(quizAnswers).filter((answer, idx) => answer === quizQuestions[idx]?.correctAnswer).length} de {quizQuestions.length} correctas
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="max-w-3xl mx-auto">
              {/* Audio Header */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-[#121f3d] to-[#98ca3f] rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <Volume2 className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎧 Audioclase: Buenas Prácticas en React</h3>
                <p className="text-gray-600 dark:text-gray-400">Escucha y aprende • 15 minutos</p>
              </div>
              
              {/* Audio Player */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
                {/* Play/Pause Controls */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <button className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>
                  <button className="w-16 h-16 bg-[#98ca3f] rounded-full flex items-center justify-center hover:bg-[#87b935] transition-all shadow-lg hover:scale-105">
                    <Play className="w-8 h-8 text-[#121f3d] ml-1" />
                  </button>
                  <button className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all">
                    <div className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] rounded-full" style={{ width: '33%' }} />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2 font-mono">
                    <span>5:23</span>
                    <span>15:00</span>
                  </div>
                </div>

                {/* Additional Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="w-20 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#98ca3f]" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      1.0x
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Transcript Section */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#98ca3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transcripción del audio
                  </h4>
                  <button className="text-sm text-[#98ca3f] hover:text-[#87b935] font-medium transition-colors">
                    Descargar
                  </button>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  <div className="flex gap-3">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 pt-1">00:00</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Bienvenidos a esta audioclase sobre buenas prácticas en React. Hoy vamos a explorar los patrones más importantes que todo desarrollador debe conocer.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 pt-1">01:23</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Empezaremos hablando sobre la composición de componentes y cómo crear componentes reutilizables que sean fáciles de mantener.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 pt-1">03:45</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Luego veremos cómo manejar el estado de manera efectiva usando hooks como useState y useReducer...
                    </p>
                  </div>
                  <div className="flex gap-3 bg-[#98ca3f]/10 dark:bg-[#98ca3f]/20 rounded-lg p-3 -mx-3">
                    <span className="text-xs font-mono text-[#98ca3f] pt-1">05:23</span>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed font-medium">
                      <span className="bg-[#98ca3f] text-[#121f3d] px-1 rounded">Reproduciendo ahora</span> - La optimización del rendimiento es crucial. Hablaremos sobre React.memo, useMemo y useCallback.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#98ca3f] text-[#121f3d] rounded-lg hover:bg-[#87b935] transition-colors font-semibold shadow-lg shadow-[#98ca3f]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar audio
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'infographic':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="max-w-4xl mx-auto">
              {/* Infographic Header */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📊 Infografía: Ecosistema React</h3>
                <p className="text-gray-600 dark:text-gray-400">Visualiza las herramientas más importantes • 5 min</p>
              </div>

              {/* Main Infographic Content */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 mb-6">
                {/* Center: React Logo */}
                <div className="text-center mb-8">
                  <div className="inline-block relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <span className="text-3xl font-bold text-white">⚛️</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">React</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Librería para construir interfaces</p>
                </div>

                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* State Management */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Estado Global</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manejo de datos</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Redux / Redux Toolkit</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Zustand</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Context API</span>
                      </div>
                    </div>
                  </div>

                  {/* Routing */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Routing</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Navegación</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">React Router</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Next.js Router</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">TanStack Router</span>
                      </div>
                    </div>
                  </div>

                  {/* Styling */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Estilización</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CSS y diseño</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tailwind CSS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Styled Components</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">CSS Modules</span>
                      </div>
                    </div>
                  </div>

                  {/* Fetching */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Data Fetching</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">APIs y datos</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">TanStack Query</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">SWR</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Axios</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Tools */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Herramientas de Testing
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Jest</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unit Testing</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Testing Library</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">React Testing</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Cypress</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">E2E Testing</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Playwright</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">E2E Testing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#98ca3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Puntos clave del ecosistema
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">💡</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Modular</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Elige las herramientas que necesites</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🚀</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Escalable</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Crece con tu aplicación</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🌐</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Gran comunidad</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Miles de paquetes disponibles</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📚</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Documentación</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Recursos abundantes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#98ca3f] text-[#121f3d] rounded-lg hover:bg-[#87b935] transition-colors font-semibold shadow-lg shadow-[#98ca3f]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar infografía
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </button>
              </div>
            </div>
          </div>
        );

      case 'exercise':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="max-w-4xl mx-auto">
              {/* Exercise Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">💻 Ejercicio Práctico: Lista de Tareas</h3>
                    <p className="text-gray-600 dark:text-gray-400">Construye una aplicación completa usando componentes React</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-sm font-medium rounded-full">
                    🎯 Dificultad: Intermedio
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium rounded-full">
                    ⏱️ 40 minutos
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                    📚 Práctica guiada
                  </span>
                </div>
              </div>

              {/* Objectives */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Objetivos de aprendizaje
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Crear componentes funcionales</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manejar estado con useState</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Trabajar con arrays de objetos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Eventos y formularios</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#98ca3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Instrucciones paso a paso
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Crear el componente TodoApp',
                      description: 'Crea un componente funcional que será el contenedor principal de la aplicación.',
                      completed: true
                    },
                    {
                      step: 2,
                      title: 'Definir el estado inicial',
                      description: 'Usa useState para crear un array de tareas con propiedades: id, text, completed.',
                      completed: true
                    },
                    {
                      step: 3,
                      title: 'Crear el formulario de entrada',
                      description: 'Agrega un input y un botón para añadir nuevas tareas.',
                      completed: false
                    },
                    {
                      step: 4,
                      title: 'Implementar función addTodo',
                      description: 'Crea una función que agregue una nueva tarea al estado.',
                      completed: false
                    },
                    {
                      step: 5,
                      title: 'Renderizar la lista de tareas',
                      description: 'Usa .map() para renderizar cada tarea con un checkbox y botón eliminar.',
                      completed: false
                    },
                    {
                      step: 6,
                      title: 'Implementar toggleTodo',
                      description: 'Permite marcar/desmarcar tareas como completadas.',
                      completed: false
                    },
                    {
                      step: 7,
                      title: 'Implementar deleteTodo',
                      description: 'Agrega la funcionalidad para eliminar tareas.',
                      completed: false
                    }
                  ].map((step) => (
                    <div 
                      key={step.step}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                        step.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-cyan-500 text-white'
                      }`}>
                        {step.completed ? '✓' : step.step}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-semibold mb-1 ${
                          step.completed
                            ? 'text-green-900 dark:text-green-300'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h5>
                        <p className={`text-sm ${
                          step.completed
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Editor Simulation */}
              <div className="bg-slate-900 dark:bg-black rounded-xl overflow-hidden border border-gray-700 mb-6">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-slate-900 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-gray-400 font-mono ml-2">TodoApp.jsx</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors">
                      Ejecutar
                    </button>
                    <button className="text-xs text-gray-400 hover:text-white transition-colors">
                      Copiar código
                    </button>
                  </div>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono leading-relaxed">
                    <span className="text-purple-400">import</span> <span className="text-white">{'{'} useState {'}'}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span><span className="text-gray-500">;</span>
                    {'\n\n'}
                    <span className="text-purple-400">export default function</span> <span className="text-yellow-400">TodoApp</span><span className="text-white">() {'{'}</span>
                    {'\n  '}
                    <span className="text-purple-400">const</span> <span className="text-white">[todos, setTodos] =</span> <span className="text-yellow-400">useState</span><span className="text-white">([</span>
                    {'\n    '}
                    <span className="text-white">{'{'} </span><span className="text-cyan-300">id</span><span className="text-white">: </span><span className="text-orange-400">1</span><span className="text-white">, </span><span className="text-cyan-300">text</span><span className="text-white">: </span><span className="text-green-400">'Aprender React'</span><span className="text-white">, </span><span className="text-cyan-300">completed</span><span className="text-white">: </span><span className="text-orange-400">false</span> <span className="text-white">{'},'}</span>
                    {'\n  '}
                    <span className="text-white">]);</span>
                    {'\n\n  '}
                    <span className="text-gray-500">// Tu código aquí...</span>
                    {'\n\n  '}
                    <span className="text-purple-400">return</span> <span className="text-white">{'('}</span>
                    {'\n    '}
                    <span className="text-gray-500">{'<'}</span><span className="text-pink-400">div</span> <span className="text-cyan-300">className</span><span className="text-white">=</span><span className="text-green-400">"todo-app"</span><span className="text-gray-500">{'>'}</span>
                    {'\n      '}
                    <span className="text-gray-500">{'<'}</span><span className="text-pink-400">h1</span><span className="text-gray-500">{'>'}</span><span className="text-white">Mi Lista de Tareas</span><span className="text-gray-500">{'</'}</span><span className="text-pink-400">h1</span><span className="text-gray-500">{'>'}</span>
                    {'\n      '}
                    <span className="text-gray-500">{'{'}</span><span className="text-white">/* Agregar formulario aquí */</span><span className="text-gray-500">{'}'}</span>
                    {'\n    '}
                    <span className="text-gray-500">{'</'}</span><span className="text-pink-400">div</span><span className="text-gray-500">{'>'}</span>
                    {'\n  '}
                    <span className="text-white">);</span>
                    {'\n'}
                    <span className="text-white">{'}'}</span>
                  </code>
                </pre>
              </div>

              {/* Hints */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Pistas útiles
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">→</span>
                    <span>Usa <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded font-mono text-xs">Date.now()</code> para generar IDs únicos</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">→</span>
                    <span>Recuerda que el estado es inmutable, usa spread operator <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded font-mono text-xs">[...todos]</code></span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">→</span>
                    <span>Para actualizar un item, usa <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded font-mono text-xs">.map()</code> y devuelve el objeto modificado</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-3 gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#98ca3f] text-[#121f3d] rounded-lg hover:bg-[#87b935] transition-colors font-semibold shadow-lg shadow-[#98ca3f]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marcar como completado
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver solución
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pedir ayuda
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Función para obtener todas las lecciones en orden
  const getAllLessons = () => {
    const allLessons: any[] = [];
    courseModules.forEach(module => {
      module.lessons.forEach(lesson => {
        allLessons.push({ ...lesson, moduleId: module.id, moduleName: module.title });
      });
    });
    return allLessons;
  };

  // Función para encontrar el índice de la lección actual
  const getCurrentLessonIndex = () => {
    const allLessons = getAllLessons();
    return allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  };

  // Función para navegar a la lección anterior
  const goToPreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
      // Expandir el módulo de la nueva lección
      const newModuleId = allLessons[currentIndex - 1].moduleId;
      if (!expandedModules.includes(newModuleId)) {
        setExpandedModules(prev => [...prev, newModuleId]);
      }
    }
  };

  // Función para navegar a la siguiente lección
  const goToNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < allLessons.length - 1) {
      // Marcar la lección actual como completada
      const currentModule = courseModules.find(m => 
        m.lessons.some(l => l.id === currentLesson.id)
      );
      if (currentModule) {
        const lesson = currentModule.lessons.find(l => l.id === currentLesson.id);
        if (lesson) {
          lesson.completed = true;
        }
      }
      
      setCurrentLesson(allLessons[currentIndex + 1]);
      // Expandir el módulo de la nueva lección
      const newModuleId = allLessons[currentIndex + 1].moduleId;
      if (!expandedModules.includes(newModuleId)) {
        setExpandedModules(prev => [...prev, newModuleId]);
      }
    }
  };

  // Calcular el progreso real
  const calculateProgress = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    if (allLessons.length === 0) return 0;
    // Progreso basado en lecciones completadas + lección actual
    return Math.round(((currentIndex + 1) / allLessons.length) * 100);
  };

  // Verificar si hay lección anterior/siguiente
  const hasPreviousLesson = () => getCurrentLessonIndex() > 0;
  const hasNextLesson = () => {
    const allLessons = getAllLessons();
    return getCurrentLessonIndex() < allLessons.length - 1;
  };

  const lessonProgress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`transition-all duration-300 ${isSidebarVisible ? 'lg:pr-[25%]' : 'lg:pr-0'}`}>
        {/* Main Content */}
        <div className="bg-gray-50 dark:bg-gray-900">
          {/* Lesson Header - Compact on Scroll */}
          <div className={`sticky top-[64px] z-20 bg-[#121f3d] dark:bg-[#0a1628] shadow-md transition-all duration-300 border-b ${
            isScrolled 
              ? 'py-1.5 border-[#98ca3f]/20' 
              : 'py-4 lg:py-6 border-transparent'
          }`}>
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 bg-[#98ca3f]/20 text-[#98ca3f] font-semibold rounded-full border border-[#98ca3f]/30 shadow-sm backdrop-blur-sm transition-all ${
                  isScrolled ? 'text-[10px]' : 'text-xs'
                }`}>
                  {currentLesson.type === 'video' ? '🎥' : 
                   currentLesson.type === 'pdf' ? '📄' : 
                   currentLesson.type === 'quiz' ? '❓' : 
                   currentLesson.type === 'audio' ? '🎧' :
                   currentLesson.type === 'infographic' ? '📊' :
                   currentLesson.type === 'exercise' ? '💻' : '📚'}
                  {!isScrolled && (currentLesson.type === 'video' ? ' Video' : 
                   currentLesson.type === 'pdf' ? ' Lectura' : 
                   currentLesson.type === 'quiz' ? ' Quiz' : 
                   currentLesson.type === 'audio' ? ' Audio' :
                   currentLesson.type === 'infographic' ? ' Infografía' :
                   currentLesson.type === 'exercise' ? ' Ejercicio' : ' Contenido')}
                </span>
                <h1 className={`text-white font-medium transition-all duration-300 truncate flex-1 text-center ${
                  isScrolled ? 'text-sm' : 'text-xl lg:text-2xl'
                }`}>
                  {currentLesson.title}
                </h1>
                {!isScrolled && (
                  <span className="text-xs text-gray-400 whitespace-nowrap text-[15px]">
                    {(() => {
                      const unit = courseUnits.find(u => u.modules.some(m => m.lessons.some(l => l.id === currentLesson.id)));
                      const module = unit?.modules.find(m => m.lessons.some(l => l.id === currentLesson.id));
                      const unitNumber = unit ? courseUnits.indexOf(unit) + 1 : '?';
                      const moduleNumber = module ? module.id : '?';
                      const lessonNumber = currentLesson.id.split('-')[1] || currentLesson.id;
                      return `Unidad ${unitNumber} · Tema ${moduleNumber} · Lección ${lessonNumber}`;
                    })()}
                  </span>
                )}
              </div>
              {!isScrolled && (
                <p className="text-sm text-gray-300 mt-2 text-center text-[16px]">{currentLesson.description}</p>
              )}
            </div>
          </div>

            {/* Main Content Area */}
            <div className={`transition-all duration-300 mx-auto px-6 lg:px-8 pb-8 ${
              isSidebarVisible ? 'max-w-5xl' : 'max-w-7xl'
            }`}>

            {/* Lesson Content Container */}
            <div className="mb-8">
              {renderLessonContent()}
            </div>
          
            {/* Notes Section */}
            <div className="mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#98ca3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Mis notas
                  </h3>
                  <button className="text-sm text-[#98ca3f] hover:text-[#87b935] font-medium transition-colors">
                    Guardar
                  </button>
                </div>
                <textarea 
                  placeholder="Escribe tus notas, ideas o preguntas sobre esta lección..."
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-40 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-all resize-none"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>💡 Tip: Tus notas se guardan automáticamente</span>
                  <span>Última edición: hace 5 min</span>
                </div>
              </div>
            </div>

            {/* Additional Resources Section */}
            <div className={isChatVisible ? "mb-4" : "mb-6"}>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Recursos adicionales
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Documentación oficial</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">React Docs</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">Código ejemplo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GitHub Repo</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* AI Tutor Chat Section */}
            {isChatVisible && (
              <div className="mt-0 mb-0">
                <div ref={chatHeaderRef} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-[#121f3d] to-[#1a2f5a] border-b border-gray-200 dark:border-gray-700 px-[16px] py-[15px] mx-[0px] my-[1px] pt-[15px] pr-[16px] pb-[30px] pl-[16px]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#98ca3f] to-[#7ab32f] flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-[#121f3d]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#121f3d]"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          Tutor IA
                          <span className="px-2 py-0.5 bg-[#98ca3f]/20 text-[#98ca3f] text-xs rounded-full border border-[#98ca3f]/30">En línea</span>
                        </h3>
                        <p className="text-xs text-gray-300">Listo para ayudarte con: {currentLesson.title}</p>
                      </div>
                      <button
                        onClick={toggleChat}
                        className="text-gray-300 hover:text-white transition-colors p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900/50">
                    {currentChatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        {message.sender === 'tutor' && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#98ca3f] to-[#7ab32f] flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-[#121f3d]" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Tutor IA</span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-3 ${
                            message.sender === 'user'
                              ? 'bg-[#98ca3f] text-[#121f3d]'
                              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <span className={`text-xs mt-1 block ${
                            message.sender === 'user' 
                              ? 'text-[#121f3d]/70' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 pt-[16px] pr-[16px] pb-[3px] pl-[16px]">
                  <div className="flex gap-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Pregúntame sobre esta lección..."
                      className="flex-1 bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-all"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="bg-[#98ca3f] text-[#121f3d] px-4 py-2.5 rounded-lg hover:bg-[#87b935] transition-colors shadow-lg shadow-[#98ca3f]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-3 h-3 text-[#98ca3f]" />
                    <span>El Tutor IA puede responder preguntas sobre el contenido de esta lección</span>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Lesson Navigation - FIXED at bottom of content */}
          <div className={`bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl relative ${
            isChatVisible ? 'mt-[1px]' : 'mt-8'
          }`}>
            <div className={`transition-all duration-300 mx-auto px-4 lg:px-8 pb-2 pt-2 ${
              isSidebarVisible ? 'max-w-5xl' : 'max-w-7xl'
            }`}>
              {/* Toggle Chat Button - Desktop Only (Floating) */}
              <button
                onClick={toggleChat}
                className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#98ca3f] to-[#87b935] border-2 border-[#98ca3f] rounded-lg p-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group z-10"
                title={isChatVisible ? 'Cerrar chat con Tutor IA' : 'Abrir chat con Tutor IA'}
              >
                {isChatVisible ? (
                  <X className="w-5 h-5 text-[#121f3d] group-hover:rotate-90 transition-transform duration-200" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-[#121f3d] group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>

              {/* Toggle Sidebar Button - Desktop Only (Floating) */}
              <button
                onClick={handleToggleSidebarWithFocus}
                className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group z-10"
                title={isSidebarVisible ? 'Ocultar contenido del curso' : 'Mostrar contenido del curso'}
              >
                {isSidebarVisible ? (
                  <PanelRightClose className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#98ca3f]" />
                ) : (
                  <PanelRightOpen className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#98ca3f]" />
                )}
              </button>
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 mx-3 sm:mx-12 lg:mx-[55px] p-3 sm:p-4 lg:py-2 lg:px-4 my-[0px]">
                {/* Mobile Only - Action Buttons Row */}
                <div className="flex lg:hidden items-center gap-2">
                  {/* Chat Button - Mobile */}
                  <button
                    onClick={toggleChat}
                    className="bg-gradient-to-r from-[#98ca3f] to-[#87b935] border-2 border-[#98ca3f] rounded-lg p-2 hover:scale-105 transition-all duration-200 group"
                    title={isChatVisible ? 'Cerrar chat con Tutor IA' : 'Abrir chat con Tutor IA'}
                  >
                    {isChatVisible ? (
                      <X className="w-4 h-4 text-[#121f3d]" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-[#121f3d]" />
                    )}
                  </button>

                  {/* Progress Bar - Mobile Center */}
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] transition-all duration-500" 
                          style={{ width: `${lessonProgress}%` }} 
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#98ca3f] min-w-[2rem]">{lessonProgress}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Lección {getCurrentLessonIndex() + 1} de {getAllLessons().length}
                    </p>
                  </div>

                  {/* Sidebar Toggle Button - Mobile */}
                  <button
                    onClick={handleToggleSidebarWithFocus}
                    className="bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:scale-105 transition-all duration-200 group"
                    title={isSidebarVisible ? 'Ocultar contenido del curso' : 'Mostrar contenido del curso'}
                  >
                    {isSidebarVisible ? (
                      <PanelRightClose className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                </div>

                {/* Left Button - Desktop Only */}
                <button 
                  onClick={goToPreviousLesson}
                  disabled={!hasPreviousLesson()}
                  className={`hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    hasPreviousLesson()
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
                      : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Lección anterior</span>
                </button>

                {/* Progress Bar - Desktop Only (Center) */}
                <div className="hidden lg:flex flex-1 items-center justify-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] transition-all duration-500" 
                        style={{ width: `${lessonProgress}%` }} 
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#98ca3f] min-w-[2.5rem] text-right">{lessonProgress}%</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {getCurrentLessonIndex() + 1}/{getAllLessons().length}
                  </p>
                </div>

                {/* Right Button - Desktop Only */}
                <button 
                  onClick={goToNextLesson}
                  disabled={!hasNextLesson()}
                  className={`hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    hasNextLesson()
                      ? 'bg-[#98ca3f] text-[#121f3d] hover:bg-[#87b935] cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="font-medium">Siguiente lección</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Navigation Buttons - Mobile/Tablet Only */}
                <div className="flex lg:hidden items-stretch gap-2 sm:gap-3">
                  <button 
                    onClick={goToPreviousLesson}
                    disabled={!hasPreviousLesson()}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      hasPreviousLesson()
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium hidden sm:inline">Lección anterior</span>
                    <span className="font-medium sm:hidden text-xs">Anterior</span>
                  </button>
                  
                  <button 
                    onClick={goToNextLesson}
                    disabled={!hasNextLesson()}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      hasNextLesson()
                        ? 'bg-[#98ca3f] text-[#121f3d] hover:bg-[#87b935] cursor-pointer'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="font-medium hidden sm:inline">Siguiente lección</span>
                    <span className="font-medium sm:hidden text-xs">Siguiente</span>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content - Toggle on Mobile and Desktop */}
        <div className={`bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 lg:fixed lg:right-0 lg:top-[127px] lg:w-1/4 lg:h-[calc(100vh-135px)] lg:z-50 flex flex-col transition-all duration-300 ${
          isSidebarVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden lg:max-h-full lg:opacity-100 lg:translate-x-full'
        }`}>
          {/* Header - ALWAYS VISIBLE */}
          <div className="px-3 py-2 lg:px-4 lg:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="space-y-1 lg:space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[rgb(234,238,246)] dark:text-gray-400 text-sm">Tu Progreso Completado del Curso</span>
                <span className="font-semibold text-[#98ca3f]">38%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] rounded-full transition-all duration-300" style={{ width: '38%' }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>12 de 32 lecciones</span>
                <span>~5h restantes</span>
              </div>
            </div>
          </div>

          {/* Lessons List - SCROLLABLE */}
          <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto lg:p-4 space-y-2 lg:space-y-4 min-h-0 course-sidebar-scroll pt-[15px] pr-[16px] pb-[5px] pl-[3px] px-[16px] py-[5px]">
            {courseUnits.map((unit) => (
              <div key={unit.id} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden shadow-md">
                {/* NIVEL 1: UNIDAD */}
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex items-center justify-between p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-2 lg:gap-2.5 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{unit.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {unit.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {unit.modules.length} temas • {unit.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lecciones
                      </p>
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedUnits.includes(unit.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </button>

                {/* NIVEL 2 y 3: TEMAS y LECCIONES */}
                {expandedUnits.includes(unit.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-900/50 p-1 lg:p-2 space-y-1 lg:space-y-2">
                    {unit.modules.map((module) => (
                      <div key={module.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 overflow-hidden">
                        {/* NIVEL 2: TEMA */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-2 lg:p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 lg:gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-[#98ca3f]/10 dark:bg-[#98ca3f]/20 flex items-center justify-center flex-shrink-0 border border-[#98ca3f]/20">
                              <FolderOpen className="w-4 h-4 text-[#98ca3f]" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{module.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {module.lessons.filter(l => l.completed).length}/{module.lessons.length} completadas
                              </p>
                            </div>
                          </div>
                          <div className="ml-2">
                            {expandedModules.includes(module.id) ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* NIVEL 3: LECCIONES */}
                        {expandedModules.includes(module.id) && (
                          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-900/50">
                            {module.lessons.map((lesson, index) => (
                              <button
                                key={lesson.id}
                                ref={currentLesson.id === lesson.id ? activeLessonRef : null}
                                onClick={() => !lesson.locked && setCurrentLesson(lesson)}
                                disabled={lesson.locked}
                                className={`w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 transition-all text-left border-l-4 ${
                                  highlightedLessonId === lesson.id
                                    ? 'bg-gradient-to-r from-[#98ca3f]/30 via-[#98ca3f]/20 to-[#98ca3f]/30 dark:from-[#98ca3f]/40 dark:via-[#98ca3f]/30 dark:to-[#98ca3f]/40 border-[#98ca3f] animate-pulse shadow-lg shadow-[#98ca3f]/30'
                                    : currentLesson.id === lesson.id
                                    ? 'bg-[#98ca3f]/10 dark:bg-[#98ca3f]/20 border-[#98ca3f]'
                                    : lesson.locked
                                      ? 'opacity-60 cursor-not-allowed border-transparent'
                                      : 'hover:bg-white dark:hover:bg-slate-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                } ${index !== module.lessons.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                              >
                                <div className="flex-shrink-0">
                                  {lesson.completed ? (
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                  ) : lesson.locked ? (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                      {getLessonIcon(lesson.type)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    currentLesson.id === lesson.id 
                                      ? 'text-[#98ca3f]' 
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration} min</span>
                                    {lesson.completed && (
                                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                        ✓ Completada
                                      </span>
                                    )}
                                    {lesson.locked && (
                                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                        🔒 Bloqueada
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}