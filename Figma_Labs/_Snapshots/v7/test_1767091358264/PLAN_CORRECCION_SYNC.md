# 🔧 PLAN DE CORRECCIÓN - Master Data Sync

## Problemas Identificados

### 1. ✅ RESUELTO: extendedCourses en vez de allCourses
- **Ya corregido**: Cambié el import a `extendedCourses` (33 cursos)

### 2. ❌ PENDIENTE: POSTS - Mismatch de campos

**Schema SQL real de `posts`:**
```
Pendiente - ejecutar query SELECT column_name FROM information_schema.columns WHERE table_name = 'posts'
```

**Campos que el código intenta insertar:**
```javascript
{
  id: post.id,
  user_id: demoUser?.id || 'demo-user-001',
  type: post.type,
  content: post.content,
  image: post.image,                        // ❌ Debería ser image_url
  achievement_badge: post.achievement?.badge, // ❌ Esta columna NO existe
  achievement_title: post.achievement?.title, // ❌ Esta columna NO existe
  course_title: post.course?.title,          // ❌ Esta columna NO existe
  course_image: post.course?.image,          // ❌ Esta columna NO existe
  likes: post.likes,                         // ❌ Debería ser likes_count
  comments_count: post.comments,             // ✅ Correcto
  shares: post.shares,                       // ❌ Debería ser shares_count
  created_at: post.createdAt,                // ✅ Correcto
}
```

**Corrección necesaria:**
- Crear solo las columnas que existen en SQL
- Omitir achievement/course (o guardar en JSONB)
- Renombrar campos según schema real

### 3. ❌ PENDIENTE: COMMENTS - Mismatch de campos

**Schema SQL real de `comments`:**
```
Pendiente - ejecutar query SELECT column_name FROM information_schema.columns WHERE table_name = 'comments'
```

**Datos en código (initialComments):**
```typescript
{
  id: 'c1',
  postId: '1',                  // ❌ Debería ser post_id
  author: {name, avatar},       // ❌ Debe mapearse a user_id (FK)
  content: 'text',              // ✅ Correcto
  createdAt: '2024-...',        // ❌ Debería ser created_at
  likes: 12,                    // ❌ Debería ser likes_count
  isLiked: false,               // ❌ Esta columna NO existe
  replies: Comment[]            // ❌ Deben insertarse como parent_id
}
```

### 4. ❌ PENDIENTE: BLOG_POSTS - Mismatch de campos

**Schema SQL real de `blog_posts` (VERIFICADO):**
```
✅ id - text
✅ author_id - text (FK a users)
✅ title - text
✅ slug - text (NO NULLABLE)
✅ excerpt - text
✅ content - text
✅ cover_image_url - text (nullable)
✅ category - text
✅ tags - ARRAY
✅ status - text (default 'draft')
✅ views_count - integer
✅ likes_count - integer
✅ comments_count - integer
✅ reading_time - integer
✅ published_at - timestamp
✅ created_at - timestamp
✅ updated_at - timestamp
```

**Datos en código (blogPosts):**
```typescript
{
  id: '1',                          // ✅ Correcto
  title: 'title',                   // ✅ Correcto
  excerpt: 'excerpt',               // ✅ Correcto
  content: 'content',               // ✅ Correcto
  author: {name, avatar, role},     // ❌ Debe mapearse a author_id (FK)
  category: 'Desarrollo Web',       // ✅ Correcto
  image: 'url',                     // ❌ Debería ser cover_image_url
  publishedAt: '2024-12-15',        // ❌ Debería ser published_at
  readTime: 8,                      // ❌ Debería ser reading_time
  tags: ['Web', 'Trends'],          // ✅ Correcto
  likes: 342,                       // ❌ Debería ser likes_count
  comments: 28                      // ❌ Debería ser comments_count
}
```

**Corrección necesaria:**
```typescript
// Paso 1: Crear usuario autor
const { data: author } = await supabase
  .from('users')
  .upsert({
    id: `author-${blogPost.id}`,
    email: `${blogPost.author.name.toLowerCase().replace(' ', '.')}@platzi.com`,
    username: blogPost.author.name.toLowerCase().replace(' ', '_'),
    full_name: blogPost.author.name,
    avatar: blogPost.author.avatar,
  }, { onConflict: 'id' })
  .select()
  .single();

// Paso 2: Insertar blog_post con campos correctos
const blogData = {
  id: blogPost.id,
  author_id: author.id,
  title: blogPost.title,
  slug: generateSlug(blogPost.title),  // ✅ Generar slug
  excerpt: blogPost.excerpt,
  content: blogPost.content,
  cover_image_url: blogPost.image,     // ✅ Renombrar
  category: blogPost.category,
  tags: blogPost.tags,
  status: 'published',
  views_count: 0,
  likes_count: blogPost.likes,         // ✅ Renombrar
  comments_count: blogPost.comments,    // ✅ Renombrar
  reading_time: blogPost.readTime,     // ✅ Renombrar
  published_at: blogPost.publishedAt,  // ✅ Renombrar
};
```

## Próximos Pasos

1. ✅ Obtener schema real de `posts`
2. ✅ Obtener schema real de `comments`
3. ✅ Corregir MasterDataSync.tsx con mapeos correctos
4. ✅ Probar sincronización completa
5. ✅ Documentar resultado final

---

**Última actualización:** 2025-12-24
**Estado:** Esperando schemas de posts y comments
