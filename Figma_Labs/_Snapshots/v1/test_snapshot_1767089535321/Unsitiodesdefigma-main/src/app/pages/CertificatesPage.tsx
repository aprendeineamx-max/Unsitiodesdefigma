import { Award, Download, Share2, Calendar, CheckCircle } from 'lucide-react';

export function CertificatesPage() {
  const certificates = [
    {
      id: '1',
      courseName: 'Desarrollo Web Full Stack',
      completedDate: '2024-12-15',
      instructor: 'Carlos Fernández',
      hours: 45,
      score: 95,
      certificateNumber: 'PLTZ-2024-001234'
    },
    {
      id: '2',
      courseName: 'Data Science con Python',
      completedDate: '2024-11-28',
      instructor: 'Roberto González',
      hours: 38,
      score: 92,
      certificateNumber: 'PLTZ-2024-001156'
    },
    {
      id: '3',
      courseName: 'Diseño UX/UI Profesional',
      completedDate: '2024-10-10',
      instructor: 'Ana Martínez',
      hours: 32,
      score: 98,
      certificateNumber: 'PLTZ-2024-000987'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Mis Certificados</h1>
          <p className="text-gray-600">Descarga y comparte tus logros académicos</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl mb-1">{certificates.length}</p>
            <p className="text-sm text-gray-600">Certificados obtenidos</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-3xl mb-1">
              {certificates.reduce((sum, cert) => sum + cert.hours, 0)}
            </p>
            <p className="text-sm text-gray-600">Horas certificadas</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <Award className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <p className="text-3xl mb-1">
              {Math.round(certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length)}%
            </p>
            <p className="text-sm text-gray-600">Promedio de calificación</p>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Certificate Preview */}
                <div className="md:col-span-1 bg-gradient-to-br from-[#121f3d] to-[#1a2d5a] p-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Award className="w-16 h-16 mx-auto mb-4 text-[#98ca3f]" />
                    <h3 className="text-xl mb-2">Certificado de Finalización</h3>
                    <p className="text-sm opacity-80">Platzi Education</p>
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <p className="text-2xl font-serif mb-1">María González</p>
                      <p className="text-sm opacity-80">{cert.courseName}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="md:col-span-2 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl mb-2">{cert.courseName}</h2>
                      <p className="text-gray-600">Instructor: {cert.instructor}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Completado
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de completación</p>
                        <p className="font-medium">
                          {new Date(cert.completedDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Calificación</p>
                        <p className="font-medium">{cert.score}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Duración del curso</p>
                        <p className="font-medium">{cert.hours} horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">N° de certificado</p>
                        <p className="font-medium text-sm">{cert.certificateNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#98ca3f] text-[#121f3d] px-6 py-3 rounded-lg hover:bg-[#87b935] transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </button>
                    <button className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Compartir en LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {certificates.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Award className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl mb-2">Aún no tienes certificados</h3>
            <p className="text-gray-600 mb-6">
              Completa tus primeros cursos para obtener certificados que validen tus habilidades
            </p>
            <button className="bg-[#98ca3f] text-[#121f3d] px-8 py-3 rounded-lg hover:bg-[#87b935] transition-colors">
              Explorar cursos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
