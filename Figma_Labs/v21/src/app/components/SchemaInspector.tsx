import { useState } from 'react';
import { Database, Eye, Copy, CheckCircle } from 'lucide-react';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

// SCHEMAS HARDCODEADOS BASADOS EN EL SQL REAL DE SUPABASE
const HARDCODED_SCHEMAS: Record<string, ColumnInfo[]> = {
  posts: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'content', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'image_url', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'video_url', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'type', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'likes_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'comments_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'shares_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'views_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
  ],
  comments: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'post_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'blog_post_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'parent_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'content', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'likes_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
  ],
  blog_posts: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'author_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'slug', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'excerpt', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'content', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'cover_image_url', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'category', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'tags', data_type: 'ARRAY', is_nullable: 'YES' },
    { column_name: 'status', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'views_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'likes_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'comments_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'reading_time', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'published_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
  ],
  users: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'email', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'username', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'full_name', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'avatar', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'bio', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'updated_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'level', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'xp', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'coins', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'streak', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'longest_streak', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'courses_completed', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'lessons_completed', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'total_study_time', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'subscription_plan', data_type: 'text', is_nullable: 'YES' },
  ],
  courses: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'slug', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'thumbnail_url', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'instructor_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'instructor', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'category', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'difficulty', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'duration', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'price', data_type: 'numeric', is_nullable: 'YES' },
    { column_name: 'rating', data_type: 'numeric', is_nullable: 'YES' },
    { column_name: 'students_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'lessons_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'status', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
  ],
  modules: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'duration', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'order_index', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  lessons: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'module_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'duration', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'type', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'video_url', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'content', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'order_index', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'is_free', data_type: 'boolean', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  badges: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'name', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'icon', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'rarity', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'category', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'requirement', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  challenges: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'type', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'reward_xp', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'reward_coins', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'reward_badge', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'goal', data_type: 'integer', is_nullable: 'NO' },
    { column_name: 'expires_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  study_groups: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'name', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'image', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'category', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'members_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'max_members', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'is_private', data_type: 'boolean', is_nullable: 'YES' },
    { column_name: 'created_by', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'updated_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  forum_posts: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'content', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'category', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'tags', data_type: 'ARRAY', is_nullable: 'YES' },
    { column_name: 'views', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'likes', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'replies_count', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'is_solved', data_type: 'boolean', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'updated_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
  enrollments: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'progress', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'completed_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
    { column_name: 'last_accessed_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
  ],
  user_progress: [
    { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'course_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'lesson_id', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'completed', data_type: 'boolean', is_nullable: 'YES' },
    { column_name: 'progress', data_type: 'numeric', is_nullable: 'YES' },
    { column_name: 'time_spent', data_type: 'integer', is_nullable: 'YES' },
    { column_name: 'last_accessed', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
    { column_name: 'updated_at', data_type: 'timestamp without time zone', is_nullable: 'YES' },
  ],
};

export function SchemaInspector() {
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const tables = Object.keys(HARDCODED_SCHEMAS);

  const inspectTable = (tableName: string) => {
    setLoading(true);
    
    setTimeout(() => {
      const columns = HARDCODED_SCHEMAS[tableName] || [];
      
      setSchemas(prev => {
        const filtered = prev.filter(s => s.tableName !== tableName);
        return [...filtered, { tableName, columns }];
      });
      
      setLoading(false);
    }, 100);
  };

  const inspectAllTables = () => {
    setLoading(true);
    setSchemas([]);
    
    setTimeout(() => {
      const allSchemas = Object.entries(HARDCODED_SCHEMAS).map(([tableName, columns]) => ({
        tableName,
        columns,
      }));
      
      setSchemas(allSchemas);
      setLoading(false);
    }, 300);
  };

  const copyToClipboard = (tableName: string, columns: ColumnInfo[]) => {
    const json = JSON.stringify(columns, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(tableName);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Schema Inspector</h2>
              <p className="text-sm text-slate-300">Inspecciona la estructura de las tablas</p>
            </div>
          </div>
          <button
            onClick={inspectAllTables}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Eye className="w-5 h-5" />
            {loading ? 'Inspeccionando...' : 'Inspeccionar Todas'}
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {tables.map((table) => (
            <button
              key={table}
              onClick={() => inspectTable(table)}
              disabled={loading}
              className="p-3 bg-slate-700 border-2 border-slate-600 rounded-lg hover:border-purple-500 transition-colors disabled:opacity-50 text-left"
            >
              <p className="text-sm font-bold text-white">{table}</p>
              <p className="text-xs text-slate-400">{HARDCODED_SCHEMAS[table].length} columnas</p>
            </button>
          ))}
        </div>

        {/* Results */}
        {schemas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg">Resultados ({schemas.length} tablas)</h3>
            {schemas.map((schema) => (
              <div key={schema.tableName} className="bg-slate-700 border-2 border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-purple-300 text-lg">{schema.tableName}</h4>
                  <button
                    onClick={() => copyToClipboard(schema.tableName, schema.columns)}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-600 text-slate-200 rounded hover:bg-slate-500 transition-colors text-sm"
                  >
                    {copied === schema.tableName ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar JSON
                      </>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-600">
                        <th className="text-left py-2 px-3 text-slate-300 font-semibold">Columna</th>
                        <th className="text-left py-2 px-3 text-slate-300 font-semibold">Tipo</th>
                        <th className="text-left py-2 px-3 text-slate-300 font-semibold">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.columns.map((col, idx) => (
                        <tr key={idx} className="border-b border-slate-600 hover:bg-slate-600/50 transition-colors">
                          <td className="py-2 px-3 font-mono text-purple-300">{col.column_name}</td>
                          <td className="py-2 px-3 font-mono text-blue-300">{col.data_type}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              col.is_nullable === 'YES' 
                                ? 'bg-yellow-900/30 text-yellow-300' 
                                : 'bg-green-900/30 text-green-300'
                            }`}>
                              {col.is_nullable}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {schemas.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Selecciona una tabla o haz clic en "Inspeccionar Todas"</p>
          </div>
        )}
      </div>
    </div>
  );
}