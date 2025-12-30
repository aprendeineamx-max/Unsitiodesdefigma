import { ResourceMonitor } from './ResourceMonitor';
import { Settings as SettingsIcon, Activity } from 'lucide-react';

interface SettingsViewProps {
    stats: any;
    selectedVersion: string | null;
}

export function SettingsView({ stats, selectedVersion }: SettingsViewProps) {
    return (
        <div className="h-full overflow-y-auto p-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <SettingsIcon className="w-6 h-6 text-gray-500" />
                    Settings
                </h2>
            </div>

            {/* System Pulse - moved from Dashboard */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    System Pulse
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Real-time monitoring of active ZIP processes and system resources
                </p>
                <ResourceMonitor stats={stats} selectedVersion={selectedVersion} />
            </div>

            {/* Other Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h3>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400">
                        Additional settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
}
