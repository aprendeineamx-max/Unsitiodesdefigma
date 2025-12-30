import { Search, BookOpen, Users, Eye, Edit, Clock } from 'lucide-react';
import { wikiArticles } from '../data/wikiArticles';

export function WikiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Wiki Platzi</h1>
          <p className="text-gray-600">Base de conocimientos colaborativa de la comunidad</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar en la wiki..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold mb-4">Categorías</h3>
              <div className="space-y-2">
                {['Desarrollo Web', 'Data Science', 'Diseño', 'Marketing', 'DevOps', 'Mobile'].map((cat) => (
                  <button key={cat} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700">
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-[#98ca3f] text-[#121f3d] px-4 py-2 rounded-lg hover:bg-[#87b935] transition-colors text-sm">
                  Crear artículo
                </button>
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="lg:col-span-3 space-y-4">
            {wikiArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-[#98ca3f]" />
                      <h2 className="text-2xl hover:text-[#98ca3f] cursor-pointer">{article.title}</h2>
                    </div>
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      {article.category}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">{article.content}</p>

                {/* Table of Contents */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-sm mb-2">Contenido del artículo</h4>
                  <ul className="space-y-1">
                    {article.sections.map((section) => (
                      <li key={section.id}>
                        <button className="text-sm text-gray-700 hover:text-[#98ca3f] transition-colors">
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {article.contributors} contribuidores
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()} vistas
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Actualizado {new Date(article.lastUpdated).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
