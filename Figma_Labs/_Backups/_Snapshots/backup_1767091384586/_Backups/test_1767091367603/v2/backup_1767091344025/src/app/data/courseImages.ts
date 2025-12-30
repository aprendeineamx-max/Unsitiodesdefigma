// Mapeo de categorías de cursos a imágenes de Unsplash
// Esto asegura que cada curso tenga una imagen relevante y profesional

export const COURSE_IMAGES_BY_CATEGORY: Record<string, string> = {
  // Programación & Desarrollo
  'Programación': 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBsYXB0b3B8ZW58MXx8fHwxNzY2NTU0MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Desarrollo Web': 'https://images.unsplash.com/photo-1637937459053-c788742455be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGRlc2lnbnxlbnwxfHx8fDE3NjY1NTQ0MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Desarrollo Móvil': 'https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NjY1Mjg2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Mobile': 'https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NjY1Mjg2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Backend': 'https://images.unsplash.com/photo-1489436969537-cf0c1dc69cba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrZW5kJTIwc2VydmVyJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2NjU1ODg0NXww&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Data & AI
  'Data Science': 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjY0NTI3OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Inteligencia Artificial': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbWFjaGluZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NjU1ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Machine Learning': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbWFjaGluZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NjU1ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'AI/ML': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbWFjaGluZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NjU1ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Cloud & Infrastructure
  'Cloud Computing': 'https://images.unsplash.com/photo-1667984390553-7f439e6ae401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzY2NTU4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Cloud': 'https://images.unsplash.com/photo-1667984390553-7f439e6ae401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzY2NTU4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'DevOps': 'https://images.unsplash.com/photo-1763568258244-9d5aa9c3ce45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZvcHMlMjBhdXRvbWF0aW9uJTIwY29kZXxlbnwxfHx8fDE3NjY1NTg4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Security & Blockchain
  'Ciberseguridad': 'https://images.unsplash.com/photo-1761497039673-83fea602ae8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwaGFja2luZyUyMG5ldHdvcmt8ZW58MXx8fHwxNzY2NTU4MzczfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Seguridad': 'https://images.unsplash.com/photo-1696013910376-c56f76dd8178?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGxvY2slMjBzaGllbGR8ZW58MXx8fHwxNzY2NTU4ODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Blockchain': 'https://images.unsplash.com/photo-1590285836796-f772deafabfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwY3J5cHRvY3VycmVuY3klMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2NjU1ODM3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Marketing & Business
  'Marketing': 'https://images.unsplash.com/photo-1707301280408-8a9158f7613d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzY2NTA0NDU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Marketing Digital': 'https://images.unsplash.com/photo-1707301280408-8a9158f7613d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzY2NTA0NDU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Negocios': 'https://images.unsplash.com/photo-1646295404846-658322e343e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbmFnZW1lbnQlMjBvZmZpY2V8ZW58MXx8fHwxNzY2NDQ1OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Finanzas': 'https://images.unsplash.com/photo-1766218337264-f41883f217e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwaW52ZXN0bWVudCUyMHN0b2NrfGVufDF8fHx8MTc2NjU1ODM3NHww&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Design & Creative
  'Diseño': 'https://images.unsplash.com/photo-1760784016748-79421d6f8e74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzY2NTMwMjcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Diseño Gráfico': 'https://images.unsplash.com/photo-1760784016748-79421d6f8e74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzY2NTMwMjcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Diseño 3D': 'https://images.unsplash.com/photo-1645353482753-f062923499af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMG1vZGVsaW5nJTIwcmVuZGVyfGVufDF8fHx8MTc2NjU1ODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  'Video': 'https://images.unsplash.com/photo-1744686912094-5a25e7c329b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjBlZGl0aW5nfGVufDF8fHx8MTc2NjU1ODM2OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'Fotografía': 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjY1NTgzNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Gaming
  'Game Dev': 'https://images.unsplash.com/photo-1759701546763-3473c6fcc803?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGV2ZWxvcG1lbnQlMjBnYW1pbmd8ZW58MXx8fHwxNzY2NTU4ODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Languages
  'Idiomas': 'https://images.unsplash.com/photo-1567206163313-9e34c830557a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwbGFuZ3VhZ2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjY1NTgzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'Inglés': 'https://images.unsplash.com/photo-1567206163313-9e34c830557a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwbGFuZ3VhZ2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjY1NTgzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

// Fallback por defecto si no se encuentra la categoría
export const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBsYXB0b3B8ZW58MXx8fHwxNzY2NTU0MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080';

/**
 * Obtiene la imagen apropiada para un curso basado en su categoría
 * @param category - Categoría del curso
 * @returns URL de la imagen de Unsplash
 */
export function getCourseImage(category: string): string {
  return COURSE_IMAGES_BY_CATEGORY[category] || DEFAULT_COURSE_IMAGE;
}

/**
 * Obtiene múltiples imágenes variadas para evitar duplicados
 * Útil cuando necesitas asignar imágenes a múltiples cursos de la misma categoría
 */
export function getCourseImageVariant(category: string, variant: number = 0): string {
  const baseImage = getCourseImage(category);
  
  // Si hay variante, podemos agregar parámetros para obtener diferentes crops
  if (variant > 0) {
    const url = new URL(baseImage);
    url.searchParams.set('seed', variant.toString());
    return url.toString();
  }
  
  return baseImage;
}
