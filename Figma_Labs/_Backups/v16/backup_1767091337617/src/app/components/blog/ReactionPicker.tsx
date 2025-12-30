import { useState } from 'react';
import { Heart, ThumbsUp, Zap, Flame, Rocket, Brain, Smile } from 'lucide-react';
import { BlogReaction } from '../../types/blog.types';
import { useBlog } from '../../context/BlogContext';

interface ReactionPickerProps {
  postId: string;
  position?: 'top' | 'bottom';
}

const reactionTypes: Array<{
  type: BlogReaction['type'];
  icon: React.FC<{ className?: string }>;
  label: string;
  emoji: string;
  color: string;
}> = [
  { type: 'like', icon: ThumbsUp, label: 'Me gusta', emoji: '👍', color: 'bg-blue-500' },
  { type: 'love', icon: Heart, label: 'Me encanta', emoji: '❤️', color: 'bg-red-500' },
  { type: 'clap', icon: Zap, label: 'Aplauso', emoji: '👏', color: 'bg-yellow-500' },
  { type: 'fire', icon: Flame, label: 'Increíble', emoji: '🔥', color: 'bg-orange-500' },
  { type: 'rocket', icon: Rocket, label: 'Genial', emoji: '🚀', color: 'bg-purple-500' },
  { type: 'brain', icon: Brain, label: 'Inspirador', emoji: '🧠', color: 'bg-pink-500' }
];

export function ReactionPicker({ postId, position = 'bottom' }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { getPostReactions, addReaction, removeReaction } = useBlog();
  const reactions = getPostReactions(postId);

  // Group reactions by type and count
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<BlogReaction['type'], number>);

  // Get most popular reactions
  const topReactions = Object.entries(reactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const totalReactions = reactions.length;

  const handleReaction = async (type: BlogReaction['type']) => {
    const existingReaction = reactions.find(r => r.type === type);
    
    if (existingReaction) {
      await removeReaction(postId, type);
    } else {
      await addReaction(postId, type);
    }
    
    setShowPicker(false);
  };

  return (
    <div className="relative">
      {/* Reaction Summary */}
      <div className="flex items-center gap-3">
        {topReactions.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            {topReactions.map(([type]) => {
              const reaction = reactionTypes.find(r => r.type === type);
              return (
                <span key={type} className="text-lg">
                  {reaction?.emoji}
                </span>
              );
            })}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              {totalReactions}
            </span>
          </div>
        )}

        {/* Add Reaction Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
        >
          <Smile className="w-5 h-5" />
          <span>Reaccionar</span>
        </button>
      </div>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker */}
          <div
            className={`absolute ${
              position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } left-0 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-3 animate-scale-in`}
          >
            <div className="flex items-center gap-2">
              {reactionTypes.map(({ type, icon: Icon, label, emoji, color }) => {
                const count = reactionCounts[type] || 0;
                const hasReacted = reactions.some(r => r.type === type);
                
                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className={`group relative flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 ${
                      hasReacted ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    title={label}
                  >
                    <span className="text-3xl transform group-hover:scale-125 transition-transform">
                      {emoji}
                    </span>
                    {count > 0 && (
                      <span className={`absolute -top-1 -right-1 w-5 h-5 ${color} text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                        {count}
                      </span>
                    )}
                    
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Detailed Reactions Display (for showing who reacted)
interface ReactionsDisplayProps {
  postId: string;
}

export function ReactionsDisplay({ postId }: ReactionsDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { getPostReactions } = useBlog();
  const reactions = getPostReactions(postId);

  // Group reactions by type
  const reactionsByType = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.type]) acc[reaction.type] = [];
    acc[reaction.type].push(reaction);
    return acc;
  }, {} as Record<BlogReaction['type'], BlogReaction[]>);

  if (reactions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        Ver todas las reacciones ({reactions.length})
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          
          <div className="absolute top-full mt-2 left-0 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Reacciones
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {Object.entries(reactionsByType).map(([type, typeReactions]) => {
                const reaction = reactionTypes.find(r => r.type === type);
                if (!reaction) return null;
                
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{reaction.emoji}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {reaction.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {typeReactions.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
