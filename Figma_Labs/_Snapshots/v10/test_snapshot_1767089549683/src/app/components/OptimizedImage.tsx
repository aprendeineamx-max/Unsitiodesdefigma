import { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blurDataURL?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height,
  priority = false,
  blurDataURL,
  className = '',
  ...props 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || src);
  const [error, setError] = useState(false);

  // Convertir extensión a WebP si es posible
  const getWebPSrc = (originalSrc: string) => {
    // Si la imagen es de Unsplash, usar sus parámetros de optimización
    if (originalSrc.includes('unsplash.com')) {
      return `${originalSrc}&fm=webp&q=80`;
    }
    
    // Para imágenes locales, intentar versión WebP
    if (originalSrc.match(/\.(jpg|jpeg|png)$/i)) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  };

  const webpSrc = getWebPSrc(src);

  useEffect(() => {
    if (!priority) {
      // Lazy loading con Intersection Observer
      const img = new Image();
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = webpSrc;
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px' // Empezar a cargar 50px antes de que sea visible
        }
      );

      const element = document.querySelector(`[data-src="${src}"]`);
      if (element) {
        observer.observe(element);
      }

      img.onload = () => {
        setCurrentSrc(webpSrc);
        setIsLoading(false);
      };

      img.onerror = () => {
        // Fallback a imagen original si WebP falla
        img.src = src;
        img.onload = () => {
          setCurrentSrc(src);
          setIsLoading(false);
        };
        img.onerror = () => {
          setError(true);
          setIsLoading(false);
        };
      };

      return () => {
        observer.disconnect();
      };
    } else {
      // Cargar inmediatamente si es priority
      const img = new Image();
      img.src = webpSrc;
      
      img.onload = () => {
        setCurrentSrc(webpSrc);
        setIsLoading(false);
      };

      img.onerror = () => {
        setCurrentSrc(src);
        setIsLoading(false);
      };
    }
  }, [src, webpSrc, priority]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">Error al cargar imagen</span>
      </div>
    );
  }

  return (
    <picture data-src={src}>
      {/* Intenta cargar WebP primero */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Fallback a imagen original */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
        } ${className}`}
        {...props}
      />
    </picture>
  );
}
