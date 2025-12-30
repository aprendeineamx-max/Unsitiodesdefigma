import { useState } from 'react';
import { AdminLayout, AdminPage } from '../../components/admin/AdminLayout';
import { AdminDashboardPage } from './AdminDashboardPage';
import { PerformanceOptimization } from '../../components/admin/PerformanceOptimization';
import { CourseManager } from '../../components/admin/CourseManager';
import { DevToolsIntegration } from '../../components/admin/DevToolsIntegration';
import { RealtimeSync } from '../../components/admin/RealtimeSync';
import MonitoringPage from '../../components/admin/MonitoringPage';
import SecurityPage from '../../components/admin/SecurityPage';
import { DocumentationViewer } from '../../components/DocumentationViewer';
import { DocumentManager } from '../../components/admin/DocumentManager';

interface AdminPanelPageProps {
  onExitAdmin: () => void;
}

export function AdminPanelPage({ onExitAdmin }: AdminPanelPageProps) {
  const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>('dashboard');

  const renderAdminPage = () => {
    switch (currentAdminPage) {
      case 'dashboard':
        return <AdminDashboardPage />;
      case 'courses':
        return <CourseManager />;
      case 'documentation':
        return <DocumentationViewer />;
      case 'users':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Gestión de Usuarios</h2>
            <p className="text-muted-foreground">Panel de gestión de usuarios en construcción...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Analytics Avanzado</h2>
            <p className="text-muted-foreground">Panel de analytics en construcción...</p>
          </div>
        );
      case 'media':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Biblioteca de Medios</h2>
            <p className="text-muted-foreground">Biblioteca de medios en construcción...</p>
          </div>
        );
      case 'blog':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Gestión de Blog</h2>
            <p className="text-muted-foreground">Panel de blog en construcción...</p>
          </div>
        );
      case 'performance':
        return <PerformanceOptimization />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Configuración del Sitio</h2>
            <p className="text-muted-foreground">Panel de configuración en construcción...</p>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Gestión de Órdenes</h2>
            <p className="text-muted-foreground">Panel de órdenes en construcción...</p>
          </div>
        );
      case 'reviews':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Gestión de Reseñas</h2>
            <p className="text-muted-foreground">Panel de reseñas en construcción...</p>
          </div>
        );
      case 'gamification':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl mb-4">Configuración de Gamificación</h2>
            <p className="text-muted-foreground">Panel de gamificación en construcción...</p>
          </div>
        );
      case 'devtools':
        return <DevToolsIntegration />;
      case 'sync':
        return <RealtimeSync />;
      case 'security':
        return <SecurityPage />;
      case 'documents':
        return <DocumentManager />;
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentAdminPage}
      onNavigate={setCurrentAdminPage}
      onExitAdmin={onExitAdmin}
    >
      {renderAdminPage()}
    </AdminLayout>
  );
}