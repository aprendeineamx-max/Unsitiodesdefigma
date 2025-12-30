import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Zap, HardDrive } from 'lucide-react';

interface ResourceStats {
    cpu: number;
    memory: number;
    elapsed: number;
    timestamp: number;
}

interface ProcessStats {
    [versionId: string]: ResourceStats;
}

interface ResourceMonitorProps {
    stats: ProcessStats;
    selectedVersion: string | null;
}

export function ResourceMonitor({ stats, selectedVersion }: ResourceMonitorProps) {
    // If no version selected, show overall or first available
    const activeIds = Object.keys(stats);
    const targetId = selectedVersion && stats[selectedVersion] ? selectedVersion : activeIds[0];
    const currentStats = targetId ? stats[targetId] : null;

    if (!currentStats) return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <p>No active processes to monitor</p>
        </div>
    );

    // Mock history data would be handled in parent state, here we visualize current snapshot
    // For a real chart, we need an array of history. 
    // We'll trust the parent passed a single point? No, Recharts needs array.
    // Visualization: Just gauges/cards for now + a mini realtime sparkline if we had history.

    // Let's create a visual Card display instead of a complex chart for this iteration

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in slide-in-from-top-4 duration-500">

            {/* CPU Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cpu className="w-16 h-16 text-indigo-500" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">CPU Usage</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-end gap-2">
                    {currentStats.cpu.toFixed(1)}%
                    <span className="text-xs text-gray-400 dark:text-slate-500 mb-1 font-normal">Core Load</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(currentStats.cpu, 100)}%` }}
                    />
                </div>
            </div>

            {/* Memory Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HardDrive className="w-16 h-16 text-purple-500" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Memory</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-end gap-2">
                    {(currentStats.memory / 1024 / 1024).toFixed(0)} <span className="text-lg">MB</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min((currentStats.memory / 1024 / 1024 / 512) * 100, 100)}%` }} // Assume 512MB max for bar scaling
                    />
                </div>
            </div>

            {/* Time Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Uptime</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-end gap-2">
                    {(currentStats.elapsed / 1000 / 60).toFixed(0)} <span className="text-lg">min</span>
                </div>
            </div>

            {/* Monitor Target */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-700 flex flex-col justify-center">
                <span className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">MONITORING</span>
                <span className="text-xl font-bold text-indigo-500 truncate">{targetId}</span>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live Stream</span>
                </div>
            </div>

        </div>
    );
}
