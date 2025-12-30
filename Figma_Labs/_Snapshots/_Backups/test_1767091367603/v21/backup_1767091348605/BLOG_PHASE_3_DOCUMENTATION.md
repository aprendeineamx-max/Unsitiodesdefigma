# 📊 FASE BLOG 3: BÚSQUEDA Y DESCUBRIMIENTO

## 🎯 Descripción General

La **Fase 3** del Blog implementa un sistema completo de búsqueda avanzada y descubrimiento de contenido, similar a los mejores blogs del mundo (Medium, Dev.to, Hashnode). Esta fase transforma el blog en una plataforma de descubrimiento inteligente con algoritmos de recomendación, búsqueda avanzada y trending topics.

---

## ✨ Características Implementadas

### 1. **SearchBar** (`/src/app/components/blog/SearchBar.tsx`)

Barra de búsqueda avanzada con autocompletado y sugerencias en tiempo real.

**Características:**
- ✅ Búsqueda en tiempo real con debouncing
- ✅ Autocompletado inteligente
- ✅ Sugerencias categorizadas (Posts, Tags, Autores, Categorías)
- ✅ Historial de búsquedas trending
- ✅ Navegación con teclado (↑↓ Enter Esc)
- ✅ Highlight de términos de búsqueda
- ✅ Indicadores visuales de relevancia
- ✅ Quick tips para mejorar búsquedas
- ✅ Dark mode compatible

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  showTrending?: boolean;
  autoFocus?: boolean;
}
```

---

### 2. **AdvancedFilters** (`/src/app/components/blog/AdvancedFilters.tsx`)

Panel de filtros avanzados con múltiples opciones de filtrado.

**Características:**
- ✅ Filtrado por categorías (multiple selection)
- ✅ Filtrado por tags (multiple selection)
- ✅ Filtrado por autores (multiple selection)
- ✅ Filtrado por rango de fechas (Today, Week, Month, Year)
- ✅ Filtrado por tiempo de lectura (Short <5min, Medium 5-15min, Long >15min)
- ✅ Ordenamiento múltiple (Latest, Popular, Trending, Most Viewed, Most Liked)
- ✅ Pills de filtros activos con opción de eliminar
- ✅ Contador de filtros activos
- ✅ Reset de todos los filtros
- ✅ Panel modal con scroll
- ✅ Diseño responsive

**Props:**
```typescript
interface AdvancedFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableCategories: Array<{ id: string; name: string; count?: number }>;
  availableTags: Array<{ id: string; name: string; count?: number }>;
  availableAuthors: Array<{ id: string; name: string; avatar?: string }>;
  onReset?: () => void;
}
```

**Filter Options:**
```typescript
interface FilterOptions {
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'latest' | 'popular' | 'trending' | 'mostViewed' | 'mostLiked';
  readTime: 'all' | 'short' | 'medium' | 'long';
}
```

---

### 3. **TrendingPosts** (`/src/app/components/blog/TrendingPosts.tsx`)

Componente para mostrar posts trending con algoritmo de popularidad.

**Características:**
- ✅ Algoritmo de trending basado en engagement
- ✅ Ranking visual (1°, 2°, 3° con colores especiales)
- ✅ Badges de trending con porcentaje de crecimiento
- ✅ 3 variantes de visualización (sidebar, grid, list)
- ✅ Métricas de engagement (views, likes, comments)
- ✅ Actualización horaria indicada
- ✅ Iconos de trending fire/flame

**Variantes:**
- **Sidebar**: Compact vertical list ideal para sidebars
- **Grid**: Card grid layout para páginas principales
- **List**: Full-width list con imágenes

**Trending Algorithm:**
```
trending_score = views * 0.5 + likes * 2 + comments * 3 + shares * 1.5 + recency_boost * 5
```

---

### 4. **RecommendedPosts** (`/src/app/components/blog/RecommendedPosts.tsx`)

Sistema de recomendaciones personalizadas basado en historial del usuario.

**Características:**
- ✅ Algoritmo de recomendación basado en intereses
- ✅ Match score (porcentaje de coincidencia)
- ✅ Razones de recomendación (Similar category, Authors you follow, etc.)
- ✅ Barra de progreso de match visual
- ✅ Categorización por relevancia (Muy Relevante, Relevante, Puede Interesarte)
- ✅ 3 variantes de visualización
- ✅ Fallback a trending para usuarios no autenticados

**Recommendation Algorithm:**
```
match_score = category_match(30) + tag_matches(15 each) + 
              popularity_boost + recency_boost
```

**Match Reasons:**
- Similar category
- Authors you follow
- Topics you like
- Related content
- Popular in your network

---

### 5. **RelatedPosts** (`/src/app/components/blog/RelatedPosts.tsx`)

Posts relacionados con el artículo actual basados en tags y categorías.

**Características:**
- ✅ Similarity score basado en tags comunes
- ✅ Badges de tags en común
- ✅ Indicador visual de similitud (>70% destacado)
- ✅ 3 variantes (cards, list, minimal)
- ✅ Filtrado automático del post actual
- ✅ Arrow navigation para fácil acceso

**Similarity Algorithm:**
```
similarity_score = same_category(40) + common_tags(20 each) + same_author(15)
```

---

### 6. **TagCloud** (`/src/app/components/blog/TagCloud.tsx`)

Nube de tags interactiva con estadísticas y filtrado.

**Características:**
- ✅ Tamaño de tag basado en popularidad
- ✅ 3 color schemes (default, category, gradient)
- ✅ 3 variantes (cloud, list, compact)
- ✅ Tags seleccionables múltiples
- ✅ Trending tags destacados
- ✅ Estadísticas de tags (Total, Trending, Most Popular)
- ✅ Contador de posts por tag
- ✅ Animación hover con scale

**Color Schemes:**
- **Default**: Gray scale with hover
- **Category**: Color-coded by category
- **Gradient**: Beautiful gradients

---

### 7. **SearchResults** (`/src/app/components/blog/SearchResults.tsx`)

Página de resultados de búsqueda con paginación y destacado de términos.

**Características:**
- ✅ Highlighting de términos de búsqueda
- ✅ Paginación completa
- ✅ Vista Grid/List toggle
- ✅ Match score badges (relevancia)
- ✅ Snippets de texto con contexto
- ✅ Estado de carga (skeleton)
- ✅ Estado vacío con sugerencias
- ✅ Categorización por tipo (Post, Autor, Tag)
- ✅ Navegación de páginas numeradas

**View Modes:**
- **List**: Detailed view with images
- **Grid**: Compact card grid

---

## 🧠 BlogContext - Nuevas Funciones

### Advanced Search & Discovery Functions

```typescript
// Búsqueda avanzada con filtros múltiples
advancedSearch(query: string, filters: SearchFilters): SearchResult[]

// Sugerencias de búsqueda en tiempo real
getSearchSuggestions(query: string): SearchSuggestion[]

// Posts trending con algoritmo de popularidad
getTrendingPosts(limit?: number): BlogPost[]

// Recomendaciones personalizadas
getRecommendedPosts(limit?: number): BlogPost[]

// Posts relacionados por similitud
getRelatedPosts(postId: string, limit?: number): BlogPost[]

// Tags más populares
getPopularTags(limit?: number): BlogTag[]

// Búsquedas trending (analytics)
getTrendingSearches(): string[]
```

### Algoritmos Implementados

#### 1. Advanced Search Algorithm
```typescript
// Filtrado multi-criterio
- Categories (multiple)
- Tags (multiple)
- Authors (multiple)
- Date range (today, week, month, year)
- Read time (<5min, 5-15min, >15min)

// Sorting options
- Latest (by date)
- Popular (likes + comments + shares)
- Trending (weighted algorithm)
- Most Viewed
- Most Liked

// Scoring
match_score = base(50) + title_match(30) + excerpt_match(15) + 
              tag_match(10) + trending_boost(10) + featured_boost(5)
```

#### 2. Trending Algorithm
```typescript
trending_score = 
  views * 0.5 +
  likes * 2 +
  comments * 3 +
  shares * 1.5 +
  recency_boost * 5

recency_boost = max(0, 10 - age_in_days)
```

#### 3. Recommendation Algorithm
```typescript
if (!user) return trending_posts

recommendation_score = 
  category_match(30) +
  tag_matches * 15 +
  log(views + 1) * 2 +
  likes * 1.5 +
  recency_boost

// Based on user's:
- Bookmarked posts
- Liked posts
- Reading history
- Followed authors
```

#### 4. Related Posts Algorithm
```typescript
similarity_score = 
  same_category(40) +
  common_tags_count * 20 +
  same_author(15)

// Only include posts with score > 0
```

---

## 📊 Tipos TypeScript

### SearchFilters
```typescript
interface SearchFilters {
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'latest' | 'popular' | 'trending' | 'mostViewed' | 'mostLiked';
  readTime: 'all' | 'short' | 'medium' | 'long';
}
```

### SearchResult
```typescript
interface SearchResult {
  id: string;
  type: 'post' | 'author' | 'tag';
  title: string;
  excerpt?: string;
  author?: { name: string; avatar: string };
  image?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  views?: number;
  likes?: number;
  matchScore: number; // 0-100
  highlightedText?: string;
}
```

### SearchSuggestion
```typescript
interface SearchSuggestion {
  id: string;
  type: 'post' | 'tag' | 'author' | 'category';
  title: string;
  subtitle?: string;
  icon?: string;
  trending?: boolean;
}
```

---

## 🎨 Diseño y UX

### Paleta de Colores Platzi
- **Primary**: `#98CA3F` (Lime Green)
- **Secondary**: `#0A2540` to `#0F3554` (Dark Blue gradient)
- **Trending**: Orange to Red gradient
- **Recommended**: Purple to Pink gradient

### Características UX
- ✅ Responsive design (mobile-first)
- ✅ Dark mode compatible
- ✅ Smooth animations and transitions
- ✅ Loading states (skeletons)
- ✅ Empty states with helpful messages
- ✅ Keyboard navigation support
- ✅ Accessibility (ARIA labels, semantic HTML)
- ✅ Visual feedback (hover, active, focus states)

---

## 🚀 Cómo Usar

### Ejemplo 1: SearchBar con Sugerencias

```typescript
import { SearchBar } from './components/blog/SearchBar';
import { useBlog } from './context/BlogContext';

function BlogHeader() {
  const [query, setQuery] = useState('');
  const { getSearchSuggestions } = useBlog();
  
  const suggestions = getSearchSuggestions(query);
  
  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      onSearch={(q) => console.log('Searching:', q)}
      suggestions={suggestions}
      showTrending={true}
    />
  );
}
```

### Ejemplo 2: Advanced Filters

```typescript
import { AdvancedFilters } from './components/blog/AdvancedFilters';

function BlogPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    authors: [],
    dateRange: 'all',
    sortBy: 'latest',
    readTime: 'all'
  });
  
  return (
    <AdvancedFilters
      filters={filters}
      onChange={setFilters}
      availableCategories={categories}
      availableTags={tags}
      availableAuthors={authors}
      onReset={() => setFilters(defaultFilters)}
    />
  );
}
```

### Ejemplo 3: Trending Posts

```typescript
import { TrendingPosts } from './components/blog/TrendingPosts';
import { useBlog } from './context/BlogContext';

function Sidebar() {
  const { getTrendingPosts } = useBlog();
  const trending = getTrendingPosts(10);
  
  return (
    <TrendingPosts
      posts={trending}
      variant="sidebar"
      onPostClick={(id) => navigate(`/blog/${id}`)}
      showMetrics={true}
    />
  );
}
```

### Ejemplo 4: Recommended Posts

```typescript
import { RecommendedPosts } from './components/blog/RecommendedPosts';
import { useBlog } from './context/BlogContext';

function HomePage() {
  const { getRecommendedPosts } = useBlog();
  const recommended = getRecommendedPosts(9);
  
  return (
    <RecommendedPosts
      posts={recommended}
      variant="grid"
      showMatchScore={true}
      title="Recomendado para ti"
    />
  );
}
```

---

## 🔄 Integración con Supabase

Todas las funciones están preparadas para Supabase con comentarios `// TODO:`:

### Queries Sugeridas

```sql
-- Advanced Search with Full Text Search
CREATE INDEX idx_posts_search ON blog_posts USING GIN(to_tsvector('spanish', title || ' ' || excerpt || ' ' || content));

-- Trending Posts Query
SELECT * FROM blog_posts
WHERE published_at > NOW() - INTERVAL '7 days'
ORDER BY (
  views_count * 0.5 +
  likes_count * 2 +
  comments_count * 3 +
  shares_count * 1.5
) DESC
LIMIT 10;

-- Recommended Posts (based on user preferences)
WITH user_prefs AS (
  SELECT category_id, array_agg(tag_id) as tags
  FROM blog_posts p
  JOIN blog_bookmarks b ON p.id = b.post_id
  WHERE b.user_id = $user_id
)
SELECT * FROM blog_posts
WHERE category_id IN (SELECT category_id FROM user_prefs)
ORDER BY similarity_score DESC;

-- Related Posts
SELECT p2.*,
  COUNT(DISTINCT pt2.tag_id) as common_tags
FROM blog_posts p1
JOIN blog_post_tags pt1 ON p1.id = pt1.post_id
JOIN blog_post_tags pt2 ON pt1.tag_id = pt2.tag_id
JOIN blog_posts p2 ON pt2.post_id = p2.id
WHERE p1.id = $post_id AND p2.id != $post_id
GROUP BY p2.id
ORDER BY common_tags DESC, p2.views_count DESC
LIMIT 3;
```

---

## 📈 Métricas y Analytics

### Datos a Trackear
- ✅ Búsquedas realizadas
- ✅ Términos de búsqueda populares
- ✅ Click-through rate en sugerencias
- ✅ Filtros más utilizados
- ✅ Posts más recomendados
- ✅ Engagement en trending posts
- ✅ Tags más clickeados

### Tabla de Analytics Sugerida
```sql
CREATE TABLE blog_search_analytics (
  id UUID PRIMARY KEY,
  user_id UUID,
  query TEXT,
  filters JSONB,
  results_count INTEGER,
  clicked_result_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_analytics_query ON blog_search_analytics(query);
CREATE INDEX idx_search_analytics_date ON blog_search_analytics(created_at);
```

---

## ✅ Checklist de Implementación

### Componentes
- ✅ SearchBar con autocompletado
- ✅ AdvancedFilters con múltiples opciones
- ✅ TrendingPosts con algoritmo
- ✅ RecommendedPosts con personalización
- ✅ RelatedPosts con similitud
- ✅ TagCloud interactivo
- ✅ SearchResults con paginación

### Context Functions
- ✅ advancedSearch()
- ✅ getSearchSuggestions()
- ✅ getTrendingPosts()
- ✅ getRecommendedPosts()
- ✅ getRelatedPosts()
- ✅ getPopularTags()
- ✅ getTrendingSearches()

### TypeScript Types
- ✅ SearchFilters interface
- ✅ SearchResult interface
- ✅ SearchSuggestion interface

### Features
- ✅ Keyboard navigation
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Accessibility

---

## 🎯 Próximas Fases

### Fase 4: EXPERIENCIA DE LECTURA
- Reading progress bar
- Table of contents auto-generado
- Estimated reading time
- Bookmarks/Favoritos
- Reading history
- Adjustable font size
- Reader mode

### Fase 5: EDITOR DE CONTENIDO
- Rich text editor (tipo Medium)
- Code syntax highlighting
- Embeds (YouTube, Twitter, CodePen)
- Image gallery/carousel
- Drafts system
- Scheduled posts
- Preview

### Fase 6: ANALYTICS Y MÉTRICAS
- View counter en tiempo real
- Reading time tracking
- Popular posts analytics
- Engagement metrics
- Author dashboard con stats

---

## 📝 Notas

- Todos los componentes son completamente tipados con TypeScript
- Los algoritmos están optimizados pero pueden ser mejorados con datos reales
- La integración con Supabase está preparada con TODOs claros
- El diseño sigue la paleta de colores de Platzi
- Compatible con dark mode
- Mobile-first y responsive
- Accesible y con soporte de teclado

---

## 🤝 Contribuciones

Para agregar nuevas características de búsqueda:

1. Agregar tipos en `/src/app/types/blog.types.ts`
2. Implementar función en `/src/app/context/BlogContext.tsx`
3. Crear componente en `/src/app/components/blog/`
4. Documentar en este archivo
5. Agregar tests (próximamente)

---

## 📚 Referencias

Inspirado en las mejores prácticas de:
- Medium.com (search & discovery)
- Dev.to (trending algorithm)
- Hashnode (recommendations)
- Stack Overflow (advanced filters)
- Reddit (sorting algorithms)

---

**Versión**: 1.0.0  
**Fecha**: Diciembre 2024  
**Autor**: Platzi Blog Team  
**Licencia**: MIT  
