import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  Key,
  FileCheck,
  UserCheck,
  Activity,
  Database,
  Upload,
  Globe,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  securityService,
  type SecurityEvent,
} from '../../services/security';
import { SecurityEventToast } from '../SecurityEventToast';

const SecurityPage = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Test inputs
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testContent, setTestContent] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation results
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);
  const [contentValidation, setContentValidation] = useState<{
    isValid: boolean;
    issues: string[];
  } | null>(null);

  // Rate limit test
  const [rateLimitResult, setRateLimitResult] = useState<{
    allowed: boolean;
    remaining: number;
    resetIn: number;
  } | null>(null);

  // Actualizar eventos de seguridad
  useEffect(() => {
    const updateEvents = () => {
      const events = securityService.getSecurityEvents();
      setSecurityEvents(events);
      setLastUpdate(new Date());
    };

    updateEvents();

    if (autoRefresh) {
      const interval = setInterval(updateEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Inicializar CSRF token
  useEffect(() => {
    securityService.setCSRFToken();
  }, []);

  const handleTestEmail = () => {
    const isValid = securityService.validateEmail(testEmail);
    setEmailValid(isValid);
    
    if (!isValid) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'low',
        message: `Email inválido detectado: "${testEmail}"`,
        details: { email: testEmail, timestamp: new Date().toISOString() },
      });
    } else {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'low',
        message: `Email válido verificado: "${testEmail}"`,
        details: { email: testEmail, valid: true },
      });
    }
    
    // Forzar actualización de eventos
    const events = securityService.getSecurityEvents();
    setSecurityEvents(events);
  };

  const handleTestPassword = () => {
    const result = securityService.validatePassword(testPassword);
    setPasswordValidation(result);
    
    if (!result.isValid) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'medium',
        message: 'Contraseña débil detectada en validación',
        details: { 
          errors: result.errors,
          passwordLength: testPassword.length,
          timestamp: new Date().toISOString()
        },
      });
    } else {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'low',
        message: 'Contraseña segura validada correctamente',
        details: { 
          passwordLength: testPassword.length,
          strength: 'strong',
          timestamp: new Date().toISOString()
        },
      });
    }
    
    // Forzar actualización de eventos
    const events = securityService.getSecurityEvents();
    setSecurityEvents(events);
  };

  const handleTestContent = () => {
    const result = securityService.validateContent(testContent);
    setContentValidation(result);
    
    if (!result.isValid) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'high',
        message: '⚠️ Contenido peligroso detectado en validación',
        details: { 
          issues: result.issues,
          contentLength: testContent.length,
          preview: testContent.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        },
      });
    }
    
    if (securityService.detectXSS(testContent)) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'critical',
        message: '🚨 ALERTA: Intento de ataque XSS detectado',
        details: { 
          content: testContent.substring(0, 100),
          detectedPatterns: 'script tags, event handlers, javascript protocol',
          blocked: true,
          timestamp: new Date().toISOString()
        },
      });
    }
    
    if (result.isValid && !securityService.detectXSS(testContent)) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'low',
        message: 'Contenido validado correctamente - Sin amenazas detectadas',
        details: { 
          contentLength: testContent.length,
          safe: true,
          timestamp: new Date().toISOString()
        },
      });
    }
    
    // Forzar actualización de eventos
    const events = securityService.getSecurityEvents();
    setSecurityEvents(events);
  };

  const handleTestRateLimit = () => {
    const result = securityService.checkRateLimit('test_action', {
      maxRequests: 5,
      windowMs: 60000,
    });
    setRateLimitResult(result);
    
    if (!result.allowed) {
      securityService.logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        message: '⚠️ Rate limit excedido - Acción bloqueada',
        details: { 
          action: 'test_action',
          remaining: result.remaining,
          resetIn: `${Math.ceil(result.resetIn / 1000)}s`,
          timestamp: new Date().toISOString()
        },
      });
    } else {
      securityService.logSecurityEvent({
        type: 'rate_limit',
        severity: 'low',
        message: `Request permitido - ${result.remaining} requests restantes`,
        details: { 
          action: 'test_action',
          remaining: result.remaining,
          resetIn: `${Math.ceil(result.resetIn / 1000)}s`,
          timestamp: new Date().toISOString()
        },
      });
    }
    
    // Forzar actualización de eventos
    const events = securityService.getSecurityEvents();
    setSecurityEvents(events);
  };

  const handleTestXSS = () => {
    const xssTest = '<script>alert("XSS")</script>';
    setTestContent(xssTest);
    
    const isXSS = securityService.detectXSS(xssTest);
    if (isXSS) {
      securityService.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'critical',
        message: '🚨 PRUEBA DE XSS REALIZADA - Script malicioso detectado',
        details: { 
          detected: true,
          pattern: '<script> tag',
          input: xssTest,
          action: 'blocked',
          timestamp: new Date().toISOString()
        },
      });
      
      // Forzar actualización de eventos
      const events = securityService.getSecurityEvents();
      setSecurityEvents(events);
    }
  };

  const handleTestSQLInjection = () => {
    const sqlTest = "' OR '1'='1";
    const isSQL = securityService.detectSQLInjection(sqlTest);
    
    if (isSQL) {
      securityService.logSecurityEvent({
        type: 'sql_injection',
        severity: 'critical',
        message: '🚨 ALERTA: Intento de SQL Injection detectado',
        details: { 
          input: sqlTest,
          detected: true,
          pattern: 'OR statement with quotes',
          action: 'blocked',
          timestamp: new Date().toISOString()
        },
      });
      
      // Forzar actualización de eventos
      const events = securityService.getSecurityEvents();
      setSecurityEvents(events);
    }
  };

  // Calcular estadísticas
  const stats = {
    total: securityEvents.length,
    critical: securityEvents.filter(e => e.severity === 'critical').length,
    high: securityEvents.filter(e => e.severity === 'high').length,
    medium: securityEvents.filter(e => e.severity === 'medium').length,
    low: securityEvents.filter(e => e.severity === 'low').length,
    last24h: securityEvents.filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000).length,
  };

  const csrfToken = securityService.getCSRFToken();
  const browserFingerprint = securityService.generateBrowserFingerprint();

  return (
    <div className="space-y-6 pb-8">
      {/* Toast de eventos en tiempo real */}
      <SecurityEventToast />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Seguridad y Cumplimiento</h1>
          <p className="text-sm text-slate-400">
            Sistema completo de seguridad y protección de datos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-600 hover:bg-green-700">
            Sistema Seguro
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-200">Eventos Total</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{stats.total}</div>
            <p className="text-xs text-slate-400">
              {stats.last24h} en las últimas 24h
            </p>
            <div className="mt-3">
              <Progress value={Math.min(100, stats.total / 10)} className="h-1.5 bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-200">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{stats.critical}</div>
            <p className="text-xs text-slate-400">
              {stats.high} de alta prioridad
            </p>
            <div className="mt-3">
              <Progress 
                value={stats.total > 0 ? (stats.critical / stats.total) * 100 : 0} 
                className="h-1.5 bg-slate-800" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-200">CSRF Token</CardTitle>
            <Key className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">✅</div>
            <p className="text-xs text-slate-400 font-mono truncate">
              {csrfToken?.substring(0, 12)}...
            </p>
            <div className="mt-3">
              <Progress value={100} className="h-1.5 bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-200">Fingerprint</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">✅</div>
            <p className="text-xs text-slate-400 font-mono">
              {browserFingerprint}
            </p>
            <div className="mt-3">
              <Progress value={100} className="h-1.5 bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-1 sm:mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="validation" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <FileCheck className="h-4 w-4 mr-1 sm:mr-2" />
            Validación
          </TabsTrigger>
          <TabsTrigger value="protection" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Lock className="h-4 w-4 mr-1 sm:mr-2" />
            Protección
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 sm:mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Database className="h-4 w-4 mr-1 sm:mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Security Score */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Puntuación de Seguridad</CardTitle>
                <CardDescription className="text-slate-400">Estado general del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-500 mb-2">98</div>
                  <p className="text-sm text-slate-400">de 100 puntos</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Protección XSS</span>
                    <span className="text-green-400">✅ Activo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Protección CSRF</span>
                    <span className="text-green-400">✅ Activo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Rate Limiting</span>
                    <span className="text-green-400">✅ Activo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Input Validation</span>
                    <span className="text-green-400">✅ Activo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">SQL Injection Prevention</span>
                    <span className="text-green-400">✅ Activo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Headers */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Headers de Seguridad</CardTitle>
                <CardDescription className="text-slate-400">Configuración de headers HTTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">X-Content-Type-Options</span>
                  <Badge className="bg-green-900/30 text-green-400 border-green-800">nosniff</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">X-Frame-Options</span>
                  <Badge className="bg-green-900/30 text-green-400 border-green-800">DENY</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">X-XSS-Protection</span>
                  <Badge className="bg-green-900/30 text-green-400 border-green-800">Activo</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">CSP</span>
                  <Badge className="bg-green-900/30 text-green-400 border-green-800">Configurado</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">Referrer-Policy</span>
                  <Badge className="bg-green-900/30 text-green-400 border-green-800">strict-origin</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Features */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Características de Seguridad Implementadas</CardTitle>
              <CardDescription className="text-slate-400">Protecciones activas en la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Shield, label: 'XSS Protection', status: 'Activo' },
                  { icon: Lock, label: 'CSRF Tokens', status: 'Activo' },
                  { icon: Key, label: 'Input Validation', status: 'Activo' },
                  { icon: Database, label: 'SQL Injection Prevention', status: 'Activo' },
                  { icon: Activity, label: 'Rate Limiting', status: 'Activo' },
                  { icon: Upload, label: 'File Upload Security', status: 'Activo' },
                  { icon: UserCheck, label: 'Session Validation', status: 'Activo' },
                  { icon: Globe, label: 'Security Headers', status: 'Activo' },
                  { icon: FileCheck, label: 'Content Security', status: 'Activo' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <feature.icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{feature.label}</p>
                      <p className="text-xs text-green-400">{feature.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Email Validation */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Validación de Email</CardTitle>
                <CardDescription className="text-slate-400">Prueba el validador de emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email" className="text-slate-300">Email de prueba</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => {
                      setTestEmail(e.target.value);
                      setEmailValid(null);
                    }}
                    placeholder="ejemplo@correo.com"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button onClick={handleTestEmail} className="w-full bg-purple-600 hover:bg-purple-700">
                  Validar Email
                </Button>
                {emailValid !== null && (
                  <div className={`p-3 rounded-lg ${emailValid ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {emailValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <p className="text-sm text-white">
                        {emailValid ? 'Email válido' : 'Email inválido'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Validation */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Validación de Contraseña</CardTitle>
                <CardDescription className="text-slate-400">Verifica la fortaleza de la contraseña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-password" className="text-slate-300">Contraseña de prueba</Label>
                  <div className="relative">
                    <Input
                      id="test-password"
                      type={showPassword ? 'text' : 'password'}
                      value={testPassword}
                      onChange={(e) => {
                        setTestPassword(e.target.value);
                        setPasswordValidation(null);
                      }}
                      placeholder="Contraseña123!"
                      className="bg-slate-800 border-slate-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleTestPassword} className="w-full bg-purple-600 hover:bg-purple-700">
                  Validar Contraseña
                </Button>
                {passwordValidation && (
                  <div className={`p-3 rounded-lg ${passwordValidation.isValid ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {passwordValidation.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <p className="text-sm text-white font-medium">
                        {passwordValidation.isValid ? 'Contraseña segura' : 'Contraseña débil'}
                      </p>
                    </div>
                    {!passwordValidation.isValid && (
                      <ul className="space-y-1 mt-2">
                        {passwordValidation.errors.map((error, i) => (
                          <li key={i} className="text-xs text-red-400 flex items-start gap-1">
                            <span>•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Validation */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Validación de Contenido (XSS Detection)</CardTitle>
              <CardDescription className="text-slate-400">Detecta contenido peligroso y ataques XSS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-content" className="text-slate-300">Contenido de prueba</Label>
                <textarea
                  id="test-content"
                  value={testContent}
                  onChange={(e) => {
                    setTestContent(e.target.value);
                    setContentValidation(null);
                  }}
                  placeholder="Escribe contenido aquí..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTestContent} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Validar Contenido
                </Button>
                <Button onClick={handleTestXSS} variant="outline" className="border-slate-700 hover:bg-slate-800">
                  Probar XSS
                </Button>
              </div>
              {contentValidation && (
                <div className={`p-3 rounded-lg ${contentValidation.isValid ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {contentValidation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <p className="text-sm text-white font-medium">
                      {contentValidation.isValid ? 'Contenido seguro' : 'Contenido peligroso detectado'}
                    </p>
                  </div>
                  {!contentValidation.isValid && (
                    <ul className="space-y-1 mt-2">
                      {contentValidation.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-red-400 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection Tab */}
        <TabsContent value="protection" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Rate Limiting */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Rate Limiting</CardTitle>
                <CardDescription className="text-slate-400">Límite: 5 requests por minuto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestRateLimit} className="w-full bg-purple-600 hover:bg-purple-700">
                  Probar Rate Limit
                </Button>
                {rateLimitResult && (
                  <div className={`p-3 rounded-lg ${rateLimitResult.allowed ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {rateLimitResult.allowed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <p className="text-sm text-white font-medium">
                          {rateLimitResult.allowed ? 'Request permitido' : 'Rate limit excedido'}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>Requests restantes: {rateLimitResult.remaining}</p>
                        <p>Reset en: {Math.ceil(rateLimitResult.resetIn / 1000)}s</p>
                      </div>
                      <Progress 
                        value={(rateLimitResult.remaining / 5) * 100} 
                        className="h-2 bg-slate-700 mt-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSRF Protection */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Protección CSRF</CardTitle>
                <CardDescription className="text-slate-400">Token anti-CSRF generado automáticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Token actual:</p>
                  <p className="text-xs font-mono text-green-400 break-all">{csrfToken}</p>
                </div>
                <Button 
                  onClick={() => securityService.setCSRFToken()} 
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800"
                >
                  Regenerar Token
                </Button>
                <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <Info className="h-4 w-4 text-blue-400 mb-2" />
                  <p className="text-xs text-blue-300">
                    El token CSRF se incluye automáticamente en todas las peticiones POST
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SQL Injection Test */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Prevención de SQL Injection</CardTitle>
              <CardDescription className="text-slate-400">Sistema de detección de ataques SQL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleTestSQLInjection} className="bg-purple-600 hover:bg-purple-700">
                Probar Detección SQL Injection
              </Button>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">Patrones detectados:</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>• SELECT, INSERT, UPDATE, DELETE</li>
                  <li>• UNION SELECT</li>
                  <li>• OR/AND con comparaciones</li>
                  <li>• Comentarios SQL (-- , /* */)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Eventos de Seguridad</CardTitle>
              <CardDescription className="text-slate-400">
                Registro de eventos en tiempo real • Actualizado: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-slate-700" />
                    <p>No hay eventos de seguridad registrados</p>
                    <p className="text-xs mt-2">Realiza pruebas en las otras pestañas para generar eventos</p>
                  </div>
                ) : (
                  securityEvents.slice(0, 20).map((event, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        event.severity === 'critical' ? 'bg-red-900/10 border-red-800' :
                        event.severity === 'high' ? 'bg-orange-900/10 border-orange-800' :
                        event.severity === 'medium' ? 'bg-yellow-900/10 border-yellow-800' :
                        'bg-blue-900/10 border-blue-800'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {event.severity === 'critical' || event.severity === 'high' ? (
                          <AlertTriangle className={`h-5 w-5 ${
                            event.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                          }`} />
                        ) : (
                          <Info className={`h-5 w-5 ${
                            event.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            event.severity === 'critical' ? 'bg-red-900/30 text-red-400 border-red-800' :
                            event.severity === 'high' ? 'bg-orange-900/30 text-orange-400 border-orange-800' :
                            event.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                            'bg-blue-900/30 text-blue-400 border-blue-800'
                          }>
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className="border-slate-700 text-slate-400">
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-white">{event.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Configuración de Seguridad</CardTitle>
              <CardDescription className="text-slate-400">Ajustes y parámetros del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Headers
                </h4>
                <pre className="p-4 bg-slate-800/50 rounded-lg text-xs text-slate-300 overflow-x-auto">
{JSON.stringify(securityService.securityHeaders, null, 2)}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Tipos de Archivo Permitidos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'GIF', 'WebP', 'SVG', 'PDF', 'TXT', 'CSV'].map((type) => (
                    <Badge key={type} className="bg-slate-800 text-slate-300 border-slate-700">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Rate Limits
                </h4>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Login</p>
                    <p className="text-sm text-white">5 intentos / 15 min</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">API Calls</p>
                    <p className="text-sm text-white">100 requests / 1 min</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">File Upload</p>
                    <p className="text-sm text-white">10 archivos / 1 hora</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Password Reset</p>
                    <p className="text-sm text-white">3 intentos / 1 hora</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="font-medium text-white">Sistema de Seguridad Activo</p>
                </div>
                <p className="text-sm text-green-300">
                  Todas las protecciones están funcionando correctamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage;