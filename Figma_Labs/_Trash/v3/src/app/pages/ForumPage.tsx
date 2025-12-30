import { MessageSquare, Eye, ThumbsUp, CheckCircle2, Pin, Search } from 'lucide-react';
import { forumPosts } from '../data/forumPosts';
import { useState } from 'react';

export function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const categories = ['Todas', 'Desarrollo Web', 'Data Science', 'Diseño', 'Marketing', 'Idiomas'];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const filteredPosts = selectedCategory === 'Todas' 
    ? forumPosts 
    : forumPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl mb-2">Foro de la Comunidad</h1>
            <p className="text-gray-600">Pregunta, comparte y aprende con la comunidad</p>
          </div>
          <button className="bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors">
            Nueva discusión
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar en el foro..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#98ca3f] text-[#121f3d]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Forum Posts */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <img 
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-center mt-1">
                      <span className="text-xs bg-[#121f3d] text-white px-2 py-1 rounded-full">
                        Nv.{post.author.level}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      {post.pinned && <Pin className="w-4 h-4 text-[#98ca3f] flex-shrink-0 mt-1" />}
                      {post.solved && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />}
                      <h3 className="font-semibold text-lg hover:text-[#98ca3f] cursor-pointer">
                        {post.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Tags populares</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Python', 'JavaScript', 'CSS', 'Node.js', 'UI/UX'].map((tag) => (
                  <button key={tag} className="text-sm bg-gray-100 hover:bg-[#98ca3f] hover:text-[#121f3d] text-gray-700 px-3 py-1 rounded-full transition-colors">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Discusiones</span>
                  <span className="font-semibold">12,456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuarios activos</span>
                  <span className="font-semibold">3,892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Respuestas hoy</span>
                  <span className="font-semibold">1,234</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
