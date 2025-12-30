import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Github,
  Mail,
  Send,
  MapPin,
  Phone,
  Globe,
  Heart,
  Shield,
  Award,
  Zap,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  const footerLinks = {
    platform: [
      { label: 'Explorar Cursos', href: '#' },
      { label: 'Rutas de Aprendizaje', href: '#' },
      { label: 'Certificaciones', href: '#' },
      { label: 'Empresas', href: '#' },
      { label: 'Precios', href: '#' }
    ],
    community: [
      { label: 'Blog', href: '#' },
      { label: 'Foro', href: '#' },
      { label: 'Grupos de Estudio', href: '#' },
      { label: 'Eventos', href: '#' },
      { label: 'Podcast', href: '#' }
    ],
    support: [
      { label: 'Centro de Ayuda', href: '#' },
      { label: 'Contacto', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Estado del Sistema', href: '#' },
      { label: 'Reportar un Problema', href: '#' }
    ],
    company: [
      { label: 'Sobre Nosotros', href: '#' },
      { label: 'Carreras', href: '#' },
      { label: 'Prensa', href: '#' },
      { label: 'Inversores', href: '#' },
      { label: 'Términos', href: '#' },
      { label: 'Privacidad', href: '#' }
    ]
  };

  const stats = [
    { icon: Users, value: '50K+', label: 'Estudiantes Activos' },
    { icon: BookOpen, value: '500+', label: 'Cursos Disponibles' },
    { icon: Award, value: '95%', label: 'Tasa de Satisfacción' },
    { icon: TrendingUp, value: '2M+', label: 'Horas de Aprendizaje' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-600' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' }
  ];

  const trustBadges = [
    { icon: Shield, text: 'Pagos Seguros SSL' },
    { icon: Award, text: 'Certificados Verificados' },
    { icon: Zap, text: 'Acceso Inmediato' },
    { icon: Heart, text: '30 días garantía' }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-200 dark:border-gray-700">{stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#98ca3f]/20 to-[#87b935]/20 rounded-xl mb-3">
                  <Icon className="w-6 h-6 text-[#98ca3f]" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#98ca3f] to-[#7ab32f] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#121f3d] to-[#98ca3f] bg-clip-text text-transparent">
                Platzi
              </span>
            </div>
            <p className="text-sm text-secondary mb-6 max-w-sm">
              La plataforma líder de educación en línea. Aprende las habilidades del futuro con los mejores instructores del mundo.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand" />
                Suscríbete al Newsletter
              </h4>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-tertiary border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand text-primary"
                    disabled={subscribed}
                  />
                  <button
                    type="submit"
                    disabled={subscribed}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      subscribed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-brand text-[#121f3d] hover:bg-[#87b935]'
                    }`}
                  >
                    {subscribed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ¡Gracias por suscribirte!
                  </p>
                )}
                <p className="text-xs text-tertiary">
                  Recibe tips, recursos y ofertas especiales cada semana
                </p>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-primary mb-3 text-sm">Síguenos</h4>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center transition-all hover:scale-110 ${social.color} text-secondary`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Plataforma</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-secondary hover:text-brand transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Comunidad</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-secondary hover:text-brand transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-secondary hover:text-brand transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-secondary hover:text-brand transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-b border-primary py-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <span className="text-sm text-secondary">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-primary">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-secondary">
            <p>&copy; 2025 Platzi. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-brand transition-colors">Términos</a>
              <span>•</span>
              <a href="#" className="hover:text-brand transition-colors">Privacidad</a>
              <span>•</span>
              <a href="#" className="hover:text-brand transition-colors">Cookies</a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
            <a href="#" className="flex items-center gap-1 hover:text-brand transition-colors">
              <Mail className="w-4 h-4" />
              contacto@platzi.com
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-brand transition-colors">
              <Phone className="w-4 h-4" />
              +1 (555) 123-4567
            </a>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-tertiary rounded-lg text-sm text-secondary hover:text-primary transition-colors">
            <Globe className="w-4 h-4" />
            <span>Español</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Made with love */}
        <div className="mt-8 text-center">
          <p className="text-sm text-tertiary flex items-center justify-center gap-2">
            Hecho con <Heart className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" /> para estudiantes de todo el mundo
          </p>
        </div>
      </div>
    </footer>
  );
}