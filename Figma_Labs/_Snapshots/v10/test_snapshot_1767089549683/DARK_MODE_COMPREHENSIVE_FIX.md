# 🌙 CORRECCIÓN COMPLETA DARK MODE - TODAS LAS PÁGINAS

## ✅ **PÁGINAS YA COMPLETADAS**

1. ✅ GamificationPage (Logros) - COMPLETADO

## 📋 **PÁGINAS PENDIENTES DE ACTUALIZAR**

### **2. FeedPage (Comunidad)**
- ❌ Fondo: `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- ❌ Cards: `bg-white` → `bg-white dark:bg-slate-800`
- ❌ Textos: Agregar `dark:text-white` y `dark:text-gray-400`
- ❌ Inputs: `bg-gray-100` → `bg-gray-100 dark:bg-gray-700`
- ❌ Bordes: `border-gray-100` → `border-gray-100 dark:border-gray-700`

### **3. GroupsPage (Grupos)**
- ❌ Similar estructura a FeedPage
- ❌ Cards de grupos con dark mode
- ❌ Miembros y actividad con contraste

### **4. NotificationsSidebar (Panel Notificaciones)**
- ❌ Sidebar: `bg-white` → `bg-white dark:bg-slate-900`
- ❌ Items: `hover:bg-gray-50` → `hover:bg-gray-50 dark:hover:bg-slate-800`
- ❌ Separadores

### **5. CartSidebar (Mi carrito)**
- ❌ Similar a notificaciones
- ❌ Items de productos
- ❌ Totales y botones

### **6. ProfilePage/ProfileSidebar (Mi perfil)**
- ❌ Modal/sidebar de perfil
- ❌ Stats y logros
- ❌ Configuración

## 🎯 **ESTRATEGIA**

Actualizar en orden:
1. FeedPage
2. GroupsPage  
3. Sidebars (Notificaciones, Carrito, Perfil)
4. Verificar errores en consola
5. Test completo

## 📝 **TEMPLATE DARK MODE**

```tsx
// Container principal
<div className="bg-gray-50 dark:bg-gray-900">
  
  // Card
  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
    
    // Título
    <h1 className="text-gray-900 dark:text-white">
    
    // Subtexto
    <p className="text-gray-600 dark:text-gray-400">
    
    // Input
    <input className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
    
    // Button secundario
    <button className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
    
    // Hover states
    <div className="hover:bg-gray-50 dark:hover:bg-slate-700">
    
  </div>
</div>
```

## 🔧 **PATRONES ESPECÍFICOS**

### **Cards Interactivos (Posts, Grupos):**
```tsx
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-[#98ca3f] transition-colors">
```

### **Avatares:**
```tsx
<img className="border-2 border-white dark:border-gray-700">
```

### **Badges:**
```tsx
<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
```

### **Separadores:**
```tsx
<div className="border-t border-gray-200 dark:border-gray-700">
```

### **Progress bars:**
```tsx
<div className="bg-gray-200 dark:bg-gray-700">
  <div className="bg-[#98ca3f]">
</div>
```

## 🚨 **ERRORES COMUNES A EVITAR**

1. ❌ Olvidar `dark:` en hover states
2. ❌ Usar solo `text-gray-600` sin `dark:text-gray-400`
3. ❌ Bordes sin dark variant
4. ❌ Backgrounds sin contraste
5. ❌ Placeholders sin dark mode

## ✅ **CHECKLIST POR COMPONENTE**

- [ ] Fondo principal
- [ ] Cards/Containers
- [ ] Títulos (h1, h2, h3)
- [ ] Textos secundarios
- [ ] Inputs
- [ ] Botones
- [ ] Hover states
- [ ] Bordes
- [ ] Separadores
- [ ] Badges/Tags
- [ ] Avatares
- [ ] Progress bars
- [ ] Iconos
- [ ] Links

**SIGUIENTE:** Actualizar FeedPage
