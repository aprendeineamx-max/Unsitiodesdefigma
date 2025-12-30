import { useState } from 'react';
import { Share2, Twitter, Linkedin, Facebook, Mail, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface ShareButtonProps {
  postId: string;
  variant?: 'icon' | 'button' | 'floating';
  className?: string;
}

export function ShareButton({ postId, variant = 'button', className = '' }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const { sharePost, getPostById } = useBlog();
  const post = getPostById(postId);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy') => {
    await sharePost(postId, platform);
    
    if (platform === 'copy') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    setShowMenu(false);
  };

  const shareOptions = [
    {
      platform: 'twitter' as const,
      icon: Twitter,
      label: 'Twitter',
      color: 'hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'linkedin' as const,
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'facebook' as const,
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20'
    },
    {
      platform: 'whatsapp' as const,
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
    },
    {
      platform: 'email' as const,
      icon: Mail,
      label: 'Email',
      color: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700'
    },
    {
      platform: 'copy' as const,
      icon: copied ? Check : LinkIcon,
      label: copied ? '¡Copiado!' : 'Copiar link',
      color: copied
        ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
        : 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700'
    }
  ];

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors ${className}`}
          title="Compartir"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <ShareMenu options={shareOptions} onShare={handleShare} />
          </>
        )}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
        {shareOptions.map(({ platform, icon: Icon, label, color }) => (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`group relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 transition-all ${color}`}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-semibold ${className}`}
      >
        <Share2 className="w-5 h-5" />
        <span>Compartir</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <ShareMenu options={shareOptions} onShare={handleShare} />
        </>
      )}
    </div>
  );
}

interface ShareMenuProps {
  options: Array<{
    platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy';
    icon: React.FC<{ className?: string }>;
    label: string;
    color: string;
  }>;
  onShare: (platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy') => void;
}

function ShareMenu({ options, onShare }: ShareMenuProps) {
  return (
    <div className="absolute top-full mt-2 right-0 z-50 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 py-2 animate-scale-in">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Compartir artículo
        </p>
      </div>
      
      <div className="py-2">
        {options.map(({ platform, icon: Icon, label, color }) => (
          <button
            key={platform}
            onClick={() => onShare(platform)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 transition-colors ${color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact Share Bar (for article bottom)
interface ShareBarProps {
  postId: string;
}

export function ShareBar({ postId }: ShareBarProps) {
  const { sharePost } = useBlog();
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy') => {
    await sharePost(postId, platform);
    
    if (platform === 'copy') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
      <p className="font-semibold text-gray-900 dark:text-white">
        ¿Te gustó este artículo? ¡Compártelo!
      </p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2.5 bg-white dark:bg-gray-800 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors shadow-md"
          title="Compartir en Twitter"
        >
          <Twitter className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="p-2.5 bg-white dark:bg-gray-800 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors shadow-md"
          title="Compartir en LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="p-2.5 bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors shadow-md"
          title="Compartir en Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2.5 bg-white dark:bg-gray-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors shadow-md"
          title="Compartir en WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => handleShare('copy')}
          className={`p-2.5 rounded-xl transition-all shadow-md ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={copied ? '¡Copiado!' : 'Copiar link'}
        >
          {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
