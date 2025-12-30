import { useState } from 'react';
import { 
  Upload, 
  Download, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  FileImage,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';

interface OptimizationResult {
  filename: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  format: string;
  status: 'success' | 'error' | 'processing';
}

export function ImageOptimizer() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setResults([]);
  };

  const simulateOptimization = async (file: File): Promise<OptimizationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const originalSize = file.size;
        const savingsPercent = Math.random() * 0.4 + 0.3; // 30-70% savings
        const optimizedSize = originalSize * (1 - savingsPercent);
        
        resolve({
          filename: file.name,
          originalSize,
          optimizedSize,
          savings: savingsPercent * 100,
          format: 'WebP',
          status: 'success'
        });
      }, 1000);
    });
  };

  const handleOptimize = async () => {
    if (selectedFiles.length === 0) return;

    setIsOptimizing(true);
    setResults([]);
    setProgress(0);

    const newResults: OptimizationResult[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const result = await simulateOptimization(file);
      newResults.push(result);
      setResults([...newResults]);
      setProgress(((i + 1) / selectedFiles.length) * 100);
    }

    setIsOptimizing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const totalSavings = results.reduce((acc, r) => acc + (r.originalSize - r.optimizedSize), 0);
  const averageSavings = results.length > 0 
    ? results.reduce((acc, r) => acc + r.savings, 0) / results.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black">Image Optimizer</h3>
            <p className="text-green-100">Convierte y optimiza tus imágenes a WebP/AVIF</p>
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      <Card className="p-8">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-green-500 dark:hover:border-green-500 transition-colors">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Arrastra imágenes aquí o haz click para seleccionar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Soporta JPG, PNG, GIF (máx. 10MB por imagen)
            </p>
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <FileImage className="w-5 h-5" />
                <span className="font-semibold">{selectedFiles.length} imágenes seleccionadas</span>
              </div>
            )}
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Optimizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Optimizar {selectedFiles.length} imágenes
                </>
              )}
            </Button>
            {!isOptimizing && results.length === 0 && (
              <Button
                onClick={() => {
                  setSelectedFiles([]);
                  setResults([]);
                }}
                variant="outline"
                className="h-14"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}

        {isOptimizing && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="font-bold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Imágenes Optimizadas</div>
              <div className="text-3xl font-black text-green-600">{results.length}</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ahorro Total</div>
              <div className="text-3xl font-black text-blue-600">{formatBytes(totalSavings)}</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-2 border-purple-200 dark:border-purple-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reducción Promedio</div>
              <div className="text-3xl font-black text-purple-600">{Math.round(averageSavings)}%</div>
            </Card>
          </div>

          {/* Results List */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resultados de Optimización</h3>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : result.status === 'error' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{result.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>Original: {formatBytes(result.originalSize)}</span>
                        <span>→</span>
                        <span className="text-green-600 font-semibold">
                          {result.format}: {formatBytes(result.optimizedSize)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-green-600">
                        -{Math.round(result.savings)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatBytes(result.originalSize - result.optimizedSize)} ahorrados
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Descargar Todas ({results.length})
              </Button>
              <Button
                onClick={() => {
                  setSelectedFiles([]);
                  setResults([]);
                  setProgress(0);
                }}
                variant="outline"
              >
                Optimizar Más
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💡 Tips de Optimización</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>WebP</strong> reduce el tamaño 30-50% comparado con JPG/PNG</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Lazy Loading</strong> carga imágenes solo cuando son visibles</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>Blur Placeholder</strong> mejora la experiencia durante la carga</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>CDN</strong> sirve imágenes más rápido desde servidores cercanos</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
