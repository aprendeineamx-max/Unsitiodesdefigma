-- ============================================
-- 🚀 INSERTAR TODOS LOS CURSOS EN SUPABASE
-- ============================================
-- Este script inserta los 33 cursos existentes
-- con imágenes reales de Unsplash
-- ============================================

-- Limpiar cursos de prueba anteriores (opcional)
DELETE FROM courses WHERE id LIKE '1000%';

-- ============================================
-- DESARROLLO WEB (5 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000001', 'Curso Profesional de Desarrollo Web Full Stack', 'desarrollo-web-full-stack', 'Domina el desarrollo web moderno desde cero hasta nivel profesional. Aprende HTML5, CSS3, JavaScript, React, Node.js y MongoDB.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Desarrollo Web', 'intermediate', 2700, 299, 4.9, 15420, 135, 'published'),
('10000002', 'React Avanzado: Hooks, Context y Performance', 'react-avanzado-hooks-performance', 'Optimiza tus aplicaciones React con técnicas avanzadas. Domina Hooks, Context API, optimización y patrones profesionales.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Desarrollo Web', 'advanced', 1920, 249, 4.8, 12340, 98, 'published'),
('10000003', 'Node.js: Arquitectura de Microservicios', 'nodejs-arquitectura-microservicios', 'Construye arquitecturas escalables con microservicios. Aprende Docker, Kubernetes, API Gateway y Message Queues.', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Backend', 'advanced', 2400, 349, 4.9, 9850, 120, 'published'),
('10000004', 'Vue.js 3 Composition API Masterclass', 'vuejs-3-composition-api', 'Domina Vue 3 y su nueva Composition API. Aprende a crear aplicaciones reactivas con Pinia y Vite.', 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Desarrollo Web', 'intermediate', 1680, 199, 4.7, 7890, 85, 'published'),
('10000005', 'TypeScript: De Cero a Experto', 'typescript-cero-experto', 'Aprende TypeScript desde fundamentos hasta patrones avanzados. Generics, Decorators y Advanced Patterns.', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Programación', 'beginner', 2100, 229, 4.9, 14200, 105, 'published');

-- ============================================
-- DISEÑO UX/UI (2 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000006', 'UI/UX Design: Design Systems Profesionales', 'uiux-design-systems', 'Crea sistemas de diseño escalables y consistentes. Aprende Figma, Design Tokens y Component Libraries.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño', 'intermediate', 1800, 279, 4.8, 10500, 90, 'published'),
('10000007', 'Figma Avanzado: Prototipado Interactivo', 'figma-avanzado-prototipado', 'Prototipos interactivos de alta fidelidad con Figma. Auto Layout, Variants y Smart Animate.', 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño', 'advanced', 1500, 199, 4.7, 8900, 75, 'published');

-- ============================================
-- DATA SCIENCE (2 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000008', 'Python para Data Science y Machine Learning', 'python-data-science-ml', 'De Python básico a Machine Learning avanzado. NumPy, Pandas, Scikit-learn, TensorFlow y más.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Data Science', 'beginner', 3000, 329, 4.9, 18900, 150, 'published'),
('10000009', 'SQL Avanzado: Data Analytics', 'sql-avanzado-analytics', 'Consultas complejas y optimización de bases de datos. PostgreSQL, MySQL y Query Optimization.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Data Science', 'intermediate', 1680, 249, 4.8, 11200, 84, 'published');

-- ============================================
-- MOBILE (3 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000010', 'React Native: Apps iOS y Android', 'react-native-ios-android', 'Desarrolla apps nativas con React Native. Expo, Navigation, State Management y Native Modules.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Mobile', 'intermediate', 2520, 299, 4.7, 13400, 126, 'published'),
('10000011', 'Flutter & Dart: Desarrollo Multiplataforma', 'flutter-dart-multiplataforma', 'Apps hermosas con Flutter. Widgets, State Management y Firebase integration.', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Mobile', 'beginner', 2280, 279, 4.8, 10800, 114, 'published'),
('10000020', 'Swift y SwiftUI: Apps iOS Nativas', 'swift-swiftui-ios', 'Desarrollo iOS moderno con SwiftUI. Swift, Combine, Core Data y más.', 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Mobile', 'beginner', 2400, 289, 4.9, 10400, 120, 'published');

-- ============================================
-- DEVOPS & CLOUD (2 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000012', 'DevOps: Docker, Kubernetes y CI/CD', 'devops-docker-kubernetes', 'Automatización y despliegue continuo. Docker, Kubernetes, Jenkins, GitLab CI y AWS.', 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'DevOps', 'advanced', 2700, 349, 4.9, 15600, 135, 'published'),
('10000013', 'AWS Solutions Architect', 'aws-solutions-architect', 'Prepárate para la certificación AWS. EC2, S3, RDS, Lambda, VPC y más.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Cloud', 'intermediate', 3120, 379, 4.8, 12900, 156, 'published');

-- ============================================
-- SEGURIDAD (1 curso)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000014', 'Ethical Hacking y Seguridad Web', 'ethical-hacking-seguridad', 'Aprende a proteger aplicaciones web. OWASP Top 10, Pentesting y Bug Bounty.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Seguridad', 'advanced', 2400, 329, 4.9, 9500, 120, 'published');

-- ============================================
-- BLOCKCHAIN (1 curso)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000015', 'Blockchain y Smart Contracts con Solidity', 'blockchain-smart-contracts', 'Desarrolla DApps en Ethereum. Solidity, Web3.js, Truffle, IPFS y NFTs.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Blockchain', 'intermediate', 2160, 299, 4.7, 7800, 108, 'published');

-- ============================================
-- MÁS DESARROLLO WEB (3 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000016', 'Angular 17: Aplicaciones Enterprise', 'angular-17-enterprise', 'Aplicaciones empresariales con Angular. Signals, Standalone Components, RxJS y NgRx.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Desarrollo Web', 'intermediate', 2640, 289, 4.8, 11300, 132, 'published'),
('10000017', 'GraphQL: API Modernas', 'graphql-api-modernas', 'APIs escalables con GraphQL. Apollo Server, Schema Design, Resolvers y Subscriptions.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Backend', 'intermediate', 1560, 229, 4.7, 8200, 78, 'published'),
('10000018', 'Go (Golang): Backend de Alto Rendimiento', 'golang-backend-alto-rendimiento', 'Servicios de alto rendimiento con Go. Concurrency, Goroutines, Channels y Microservices.', 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Backend', 'intermediate', 2280, 279, 4.9, 9700, 114, 'published');

-- ============================================
-- PROGRAMACIÓN (1 curso)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000019', 'Rust: Programación de Sistemas', 'rust-programacion-sistemas', 'Programación segura y eficiente con Rust. Ownership, Borrowing, Lifetimes y Async.', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Programación', 'advanced', 2520, 299, 4.8, 6800, 126, 'published');

-- ============================================
-- MOBILE ADICIONALES (1 curso)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000021', 'Kotlin: Desarrollo Android Moderno', 'kotlin-android-moderno', 'Apps Android con Jetpack Compose. Kotlin, Room, Coroutines y Architecture Components.', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Mobile', 'intermediate', 2280, 279, 4.7, 9200, 114, 'published');

-- ============================================
-- GAME DEV (2 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000022', 'Unity: Desarrollo de Videojuegos 3D', 'unity-videojuegos-3d', 'Crea videojuegos profesionales con Unity. C#, 3D Graphics, Physics, AI y Multiplayer.', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Game Dev', 'beginner', 3000, 329, 4.8, 14500, 150, 'published'),
('10000023', 'Unreal Engine 5: Juegos AAA', 'unreal-engine-5-juegos-aaa', 'Gráficos de última generación con UE5. Blueprints, C++, Nanite, Lumen y Metahuman.', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Game Dev', 'advanced', 3300, 379, 4.9, 11200, 165, 'published');

-- ============================================
-- DISEÑO 3D Y MOTION (3 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000024', 'Blender: Modelado 3D y Animación', 'blender-modelado-3d', 'Modelado, texturizado y animación 3D profesional con Blender.', 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño 3D', 'beginner', 2700, 249, 4.8, 13700, 135, 'published'),
('10000025', 'Adobe After Effects: Motion Graphics Pro', 'after-effects-motion-graphics', 'Animaciones profesionales y motion graphics. Animation, Compositing, VFX y Typography.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño', 'intermediate', 1920, 269, 4.7, 9800, 96, 'published'),
('10000026', 'Illustrator: Ilustración Digital Profesional', 'illustrator-ilustracion-digital', 'Ilustración vectorial desde cero. Vector Art, Logo Design y Character Design.', 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño', 'beginner', 1680, 199, 4.8, 11900, 84, 'published');

-- ============================================
-- DISEÑO ADICIONAL (1 curso)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000027', 'Photoshop: Retoque y Composición Digital', 'photoshop-retoque-composicion', 'Retoque fotográfico profesional. Photo Editing, Compositing y Color Grading.', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Diseño', 'intermediate', 1800, 229, 4.9, 15800, 90, 'published');

-- ============================================
-- MARKETING (3 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000028', 'Marketing Digital: Growth Hacking', 'marketing-digital-growth-hacking', 'Estrategias de crecimiento exponencial. SEO, SEM, Social Media, Analytics y Conversion.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Marketing', 'intermediate', 2100, 279, 4.7, 13400, 105, 'published'),
('10000029', 'SEO Avanzado: Posicionamiento Web', 'seo-avanzado-posicionamiento', 'Domina el SEO técnico y on-page. Technical SEO, Link Building y Content Strategy.', 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Marketing', 'advanced', 1440, 249, 4.8, 10200, 72, 'published'),
('10000030', 'Google Ads: Publicidad Digital ROI', 'google-ads-publicidad-roi', 'Campañas rentables en Google Ads. Search Ads, Display, Shopping y Analytics.', 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'Marketing', 'intermediate', 1560, 229, 4.7, 9500, 78, 'published');

-- ============================================
-- AI/ML (3 cursos)
-- ============================================

INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status) VALUES
('10000031', 'Inteligencia Artificial: Deep Learning', 'ia-deep-learning', 'Redes neuronales y deep learning. TensorFlow, PyTorch, CNNs, RNNs y GANs.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'AI/ML', 'advanced', 2880, 349, 4.9, 16700, 144, 'published'),
('10000032', 'Machine Learning en Producción', 'ml-produccion', 'MLOps y deploy de modelos en producción. Docker, Kubernetes, CI/CD para ML.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'AI/ML', 'advanced', 2400, 329, 4.8, 8900, 120, 'published'),
('10000033', 'Procesamiento de Lenguaje Natural (NLP)', 'nlp-procesamiento-lenguaje', 'NLP con transformers y modelos pre-entrenados. BERT, GPT, sentiment analysis.', 'https://images.unsplash.com/photo-1655720406100-3f1eda0a4519?w=800&h=600&fit=crop', '7c127825-7000-4711-ad61-9dfb99336b51', 'AI/ML', 'advanced', 2160, 299, 4.7, 7500, 108, 'published');

-- ============================================
-- RESUMEN DE LA INSERCIÓN
-- ============================================
-- Total de cursos insertados: 33
-- Categorías:
--   - Desarrollo Web: 6
--   - Backend: 4
--   - Diseño: 7
--   - Data Science: 2
--   - Mobile: 5
--   - DevOps: 1
--   - Cloud: 1
--   - Seguridad: 1
--   - Blockchain: 1
--   - Programación: 2
--   - Game Dev: 2
--   - Diseño 3D: 1
--   - Marketing: 3
--   - AI/ML: 3
-- ============================================

-- Verificar la inserción
SELECT category, COUNT(*) as total
FROM courses
WHERE id LIKE '1000%'
GROUP BY category
ORDER BY total DESC;

-- Ver todos los cursos insertados
SELECT id, title, category, difficulty, price, students_count
FROM courses
WHERE id LIKE '1000%'
ORDER BY category, id;
