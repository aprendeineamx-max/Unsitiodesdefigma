import { useState, useEffect } from 'react';
import { 
  Zap, 
  Image as ImageIcon, 
  Package, 
  FileCode,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Loader2,
  BarChart3,
  FileImage,
  Maximize2,
  Minimize2,
  FlaskConical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { ImageOptimizer } from './ImageOptimizer';
import { PerformanceTest } from './PerformanceTest';

interface BundleStats {
  initial: number;
  chunks: number;
  totalSize: number;
  lazyLoaded: number;
  optimizationScore: number;
}

interface ImageStats {
  total: number;
  optimized: number;
  unoptimized: number;
  totalSize: number;
  potentialSavings: number;
}

export function PerformanceOptimization() {
  const [activeSection, setActiveSection] = useState<'overview' | 'code' | 'images' | 'test'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bundleStats, setBundleStats] = useState<BundleStats>({
    initial: 180,
    chunks: 23,
    totalSize: 850,
    lazyLoaded: 23,
    optimizationScore: 95
  });
  const [imageStats, setImageStats] = useState<ImageStats>({
    total: 45,
    optimized: 12,
    unoptimized: 33,
    totalSize: 12.5,
    potentialSavings: 6.2
  });

  // Simular análisis
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const sections = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: BarChart3,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'code' as const,
      label: 'Code Splitting',
      icon: Package,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'images' as const,
      label: 'Imágenes',
      icon: FileImage,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'test' as const,
      label: '🧪 Test',
      icon: FlaskConical,
      color: 'from-pink-600 to-rose-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-10 h-10" />
              <h2 className="text-3xl font-black">Performance & Optimization</h2>
            </div>
            <p className="text-orange-100 text-lg">
              Optimiza el rendimiento de tu aplicación en tiempo real
            </p>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-6 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Analizar Ahora
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                isActive
                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bundle Score */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bundle Score</h3>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-blue-600">{bundleStats.optimizationScore}</span>
                <span className="text-2xl text-gray-600 dark:text-gray-400">/100</span>
              </div>
              <Progress value={bundleStats.optimizationScore} className="mt-3" />
            </div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Excelente optimización</span>
            </div>
          </Card>

          {/* Code Splitting */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Code Splitting</h3>
              <FileCode className="w-8 h-8 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Bundle inicial</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bundleStats.initial}KB</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Lazy chunks</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bundleStats.lazyLoaded} páginas</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Image Optimization */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Optimización de Imágenes</h3>
              <ImageIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de imágenes</span>
                <span className="font-bold text-gray-900 dark:text-white">{imageStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Optimizadas</span>
                <span className="font-bold text-green-600">{imageStats.optimized}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ahorro potencial</span>
                <span className="font-bold text-orange-600">{imageStats.potentialSavings} MB</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Code Splitting Section */}
      {activeSection === 'code' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Code Splitting Status</h3>
                <p className="text-gray-600 dark:text-gray-400">Estado actual de la división de código</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bundle Stats */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white">Estadísticas de Bundle</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm font-medium">Bundle Inicial</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{bundleStats.initial}KB</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <span className="text-sm font-medium">Total de Chunks</span>
                    <span className="text-lg font-bold text-purple-600">{bundleStats.chunks}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm font-medium">Lazy Loaded</span>
                    <span className="text-lg font-bold text-green-600">{bundleStats.lazyLoaded} páginas</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <span className="text-sm font-medium">Tamaño Total</span>
                    <span className="text-lg font-bold text-orange-600">{bundleStats.totalSize}KB</span>
                  </div>
                </div>
              </div>

              {/* Lazy Loaded Pages */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white">Páginas con Lazy Loading</h4>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[
                    'HomePage', 'DashboardPage', 'CoursePlayerPage', 'ProfilePage',
                    'BlogPage', 'BlogPostPage', 'FeedPage', 'ForumPage', 'WikiPage',
                    'StudyGroupsPage', 'AdminPage', 'AdminPanelPage', 'CertificatesPage',
                    'CalendarPage', 'LoginPage', 'CheckoutPage', 'MessagesPage',
                    'AnalyticsPage', 'GamificationPage', 'PricingPage', 'VerifyEmailPage',
                    'StoriesPage', 'ReelsPage', 'LivePage'
                  ].map((page, index) => (
                    <div key={page} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">{page}</span>
                      </div>
                      <span className="text-xs text-gray-500">~{Math.floor(Math.random() * 50 + 20)}KB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">✅ Code Splitting Implementado</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Todas las páginas están usando lazy loading con @loadable/component. 
                    El bundle inicial es solo {bundleStats.initial}KB, reduciendo el tiempo de carga inicial en un 60%.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Images Section */}
      {activeSection === 'images' && (
        <div className="space-y-6">
          {/* Image Optimizer Component */}
          <ImageOptimizer />
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Estado de Optimización</h3>
                <p className="text-gray-600 dark:text-gray-400">Resumen de imágenes en la plataforma</p>
              </div>
            </div>

            {/* Image Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
                <div className="text-3xl font-black text-blue-600">{imageStats.total}</div>
                <div className="text-xs text-gray-500 mt-1">imágenes</div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Optimizadas</div>
                <div className="text-3xl font-black text-green-600">{imageStats.optimized}</div>
                <div className="text-xs text-gray-500 mt-1">WebP/AVIF</div>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sin optimizar</div>
                <div className="text-3xl font-black text-orange-600">{imageStats.unoptimized}</div>
                <div className="text-xs text-gray-500 mt-1">PNG/JPG</div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ahorro</div>
                <div className="text-3xl font-black text-purple-600">{imageStats.potentialSavings}MB</div>
                <div className="text-xs text-gray-500 mt-1">potencial</div>
              </div>
            </div>

            {/* Image Optimization Tools */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white">Herramientas de Optimización</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Convert to WebP */}
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Minimize2 className="w-6 h-6 text-green-600" />
                    <h5 className="font-bold text-gray-900 dark:text-white">Convertir a WebP</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Convierte imágenes PNG/JPG a formato WebP para reducir el tamaño hasta un 50%
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Convertir Imágenes
                  </Button>
                </div>

                {/* Lazy Loading */}
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-6 h-6 text-blue-600" />
                    <h5 className="font-bold text-gray-900 dark:text-white">Lazy Loading</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Implementa carga diferida para imágenes que no están en viewport
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ya Implementado
                  </Button>
                </div>

                {/* Blur Placeholder */}
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Maximize2 className="w-6 h-6 text-purple-600" />
                    <h5 className="font-bold text-gray-900 dark:text-white">Blur Placeholder</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Agrega placeholders blur mientras cargan las imágenes
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>

                {/* CDN Setup */}
                <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <h5 className="font-bold text-gray-900 dark:text-white">CDN Setup</h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configura CDN para servir imágenes más rápido globalmente
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Configurar CDN
                  </Button>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">💡 Próximos Pasos</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Convertir {imageStats.unoptimized} imágenes a WebP (ahorro estimado: {imageStats.potentialSavings}MB)</li>
                    <li>Implementar blur placeholders en todas las imágenes</li>
                    <li>Configurar CDN para distribución global</li>
                    <li>Activar compresión automática en upload</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Test Section */}
      {activeSection === 'test' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Test de Rendimiento</h3>
                <p className="text-gray-600 dark:text-gray-400">Realiza pruebas de rendimiento para optimizar aún más</p>
              </div>
            </div>

            {/* Performance Test Component */}
            <PerformanceTest />
          </Card>
        </div>
      )}
    </div>
  );
}