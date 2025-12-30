import { ArrowRight, Play, Star, Users, BookOpen, TrendingUp, Sparkles, Zap } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-[#121f3d] via-[#1a2d5a] to-[#2a3d6a] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#98ca3f]/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydi0yIDJ6bS0yIDB2MmgtMnYtMmgyem0wLTJ2LTJoMnYyaC0yem0tMiAydjJoLTJ2LTJoMnptMC0ydi0yaDJ2MmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#98ca3f]" />
              <span className="text-sm font-medium">Más de 50,000 estudiantes activos</span>
            </div>

            {/* Main Heading */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Aprende lo que
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#98ca3f] to-[#7ab32f]">
                  realmente importa
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Únete a la comunidad de aprendizaje en línea más innovadora. Domina nuevas habilidades con cursos diseñados por expertos de la industria.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-[#98ca3f] text-[#121f3d] rounded-xl hover:bg-[#87b935] transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#98ca3f]/30 hover:shadow-xl hover:shadow-[#98ca3f]/40 hover:scale-105">
                Explorar Cursos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Ver Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#98ca3f]" />
                  <p className="text-3xl font-bold">50K+</p>
                </div>
                <p className="text-sm text-gray-400">Estudiantes</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#98ca3f]" />
                  <p className="text-3xl font-bold">500+</p>
                </div>
                <p className="text-sm text-gray-400">Cursos</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#98ca3f]" />
                  <p className="text-3xl font-bold">4.9</p>
                </div>
                <p className="text-sm text-gray-400">Rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop"
                    alt="Course"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#98ca3f] font-medium mb-1">Desarrollo Web</p>
                    <h3 className="font-semibold mb-2">Complete React Course</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-300">(12,450)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      alt="Instructor"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-xs text-gray-400">Instructor</p>
                      <p className="text-sm font-medium">Max Schmidt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Progreso</p>
                    <p className="text-sm font-bold text-[#98ca3f]">68%</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Racha actual</p>
                    <p className="text-lg font-bold">15 días 🔥</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">XP Total</p>
                    <p className="text-lg font-bold">2,450 XP</p>
                  </div>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="absolute top-1/2 -right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-lg">
                <p className="text-2xl font-bold text-center mb-1">12</p>
                <p className="text-xs text-gray-400 text-center">Cursos<br/>Completados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)"/>
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
}
