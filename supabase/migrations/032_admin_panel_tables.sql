-- ============================================
-- MIGRACIÓN 032: PANEL ADMINISTRATIVO COMPLETO
-- ============================================
-- Fecha: 2025-11-29
-- Descripción: Sistema completo de administración con webhooks, tickets y notificaciones
-- IMPORTANTE: Esta migración crea primero todas las tablas, luego las políticas RLS
-- ============================================

-- ============================================
-- PARTE 1: CREAR TODAS LAS TABLAS PRIMERO
-- ============================================

-- ============================================
-- 1. TABLA DE USUARIOS ADMINISTRADORES (CREAR PRIMERO)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Permisos
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'support')),
  permissions JSONB DEFAULT '{}'::jsonb, -- Permisos específicos
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

-- Trigger para updated_at
CREATE TRIGGER trigger_update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.admin_users IS 'Usuarios con permisos de administrador';
COMMENT ON COLUMN public.admin_users.role IS 'Rol del admin: admin, super_admin, support';

-- ============================================
-- 2. TABLA UNIVERSAL DE WEBHOOKS
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificación del webhook
  source TEXT NOT NULL, -- 'mercadopago', 'stripe', 'openai', 'system', 'paypal', etc.
  event_type TEXT NOT NULL, -- 'payment.created', 'payment.updated', 'subscription.cancelled', etc.
  
  -- Payload completo
  payload JSONB NOT NULL,
  
  -- Estado del procesamiento
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'error', 'pending')),
  
  -- Metadatos de recepción
  ip_address TEXT,
  user_agent TEXT,
  signature TEXT, -- Firma del webhook para verificación
  headers JSONB, -- Headers completos del request
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Manejo de errores
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Relaciones opcionales
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_system_webhooks_source ON public.system_webhooks(source);
CREATE INDEX IF NOT EXISTS idx_system_webhooks_event_type ON public.system_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_system_webhooks_status ON public.system_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_system_webhooks_created_at ON public.system_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_webhooks_user_id ON public.system_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_system_webhooks_payment_id ON public.system_webhooks(payment_id);

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_system_webhooks_source_status_date 
ON public.system_webhooks(source, status, created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER trigger_update_system_webhooks_updated_at
  BEFORE UPDATE ON public.system_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.system_webhooks IS 'Registro universal de todos los webhooks recibidos del sistema';
COMMENT ON COLUMN public.system_webhooks.source IS 'Fuente del webhook: mercadopago, stripe, openai, system, etc.';
COMMENT ON COLUMN public.system_webhooks.event_type IS 'Tipo de evento: payment.created, subscription.cancelled, etc.';
COMMENT ON COLUMN public.system_webhooks.payload IS 'Payload completo del webhook en formato JSONB';

-- ============================================
-- 3. TABLA DE TICKETS DE SOPORTE
-- ============================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuario que crea el ticket
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del ticket
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Estado y prioridad
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Respuesta del admin
  response TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb, -- Screenshots, logs, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.support_tickets IS 'Sistema de tickets de soporte para usuarios';
COMMENT ON COLUMN public.support_tickets.metadata IS 'Metadata adicional: screenshots, logs, archivos adjuntos, etc.';

-- ============================================
-- 4. TABLA DE NOTIFICACIONES INTERNAS (ADMIN)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contenido de la notificación
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Clasificación
  type TEXT NOT NULL, -- 'payment_success', 'payment_error', 'webhook_error', 'ticket_created', 'subscription_active', etc.
  source TEXT, -- 'mercadopago', 'system', 'user', etc.
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales del evento
  
  -- Relaciones opcionales
  webhook_id UUID REFERENCES public.system_webhooks(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_source ON public.admin_notifications(source);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_severity ON public.admin_notifications(severity);

-- Índice compuesto para notificaciones no leídas
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread 
ON public.admin_notifications(is_read, created_at DESC) 
WHERE is_read = false;

-- Comentarios
COMMENT ON TABLE public.admin_notifications IS 'Notificaciones internas para administradores del sistema';
COMMENT ON COLUMN public.admin_notifications.severity IS 'Nivel de severidad: info, warning, error, success';

-- ============================================
-- PARTE 2: CREAR FUNCIONES AUXILIARES
-- ============================================

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = user_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación admin automáticamente
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_source TEXT DEFAULT 'system',
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (
    title,
    message,
    type,
    source,
    severity,
    metadata
  ) VALUES (
    p_title,
    p_message,
    p_type,
    p_source,
    p_severity,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTE 3: HABILITAR RLS Y CREAR POLÍTICAS
-- ============================================

-- ============================================
-- RLS PARA system_webhooks
-- ============================================

ALTER TABLE public.system_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all webhooks"
  ON public.system_webhooks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- ============================================
-- RLS PARA support_tickets
-- ============================================

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Users can create tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- ============================================
-- RLS PARA admin_notifications
-- ============================================

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- ============================================
-- RLS PARA admin_users
-- ============================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- ============================================
-- FIN MIGRACIÓN 032
-- ============================================
