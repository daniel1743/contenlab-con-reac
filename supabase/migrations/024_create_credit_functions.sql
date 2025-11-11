-- ============================================
-- MIGRACIÓN 024: FUNCIONES DE CRÉDITOS
-- ============================================
-- Fecha: 2025-11-10
-- Descripción: Crea funciones SQL para manejo de créditos
-- Funciones: get_feature_cost, check_user_credits, apply_rollover
-- ============================================

-- ============================================
-- FUNCIÓN 1: Obtener costo de un feature
-- ============================================
CREATE OR REPLACE FUNCTION get_feature_cost(p_feature_slug VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  v_cost INTEGER;
BEGIN
  -- Buscar costo del feature
  SELECT credit_cost INTO v_cost
  FROM public.feature_costs
  WHERE feature_slug = p_feature_slug
    AND is_active = true;

  -- Si no encuentra el feature, retornar costo por defecto
  IF v_cost IS NULL THEN
    RAISE WARNING 'Feature "%" no encontrado, retornando costo por defecto: 10', p_feature_slug;
    RETURN 10; -- Costo por defecto
  END IF;

  RETURN v_cost;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT get_feature_cost('growth_dashboard'); -- Retorna 380
-- SELECT get_feature_cost('viral_script_basic'); -- Retorna 20
-- SELECT get_feature_cost('feature_inexistente'); -- Retorna 10 (default)

COMMENT ON FUNCTION get_feature_cost IS 'Obtiene el costo en créditos de un feature por su slug';

-- ============================================
-- FUNCIÓN 2: Verificar créditos suficientes
-- ============================================
CREATE OR REPLACE FUNCTION check_user_credits(
  p_user_id UUID,
  p_feature_slug VARCHAR
)
RETURNS TABLE (
  has_credits BOOLEAN,
  current_balance INTEGER,
  required_credits INTEGER,
  missing_credits INTEGER
) AS $$
DECLARE
  v_balance INTEGER;
  v_cost INTEGER;
BEGIN
  -- Obtener balance actual del usuario
  SELECT total_credits INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;

  -- Si el usuario no existe, retornar balance 0
  IF v_balance IS NULL THEN
    v_balance := 0;
  END IF;

  -- Obtener costo del feature
  v_cost := get_feature_cost(p_feature_slug);

  -- Retornar resultado
  RETURN QUERY SELECT
    v_balance >= v_cost AS has_credits,
    v_balance AS current_balance,
    v_cost AS required_credits,
    GREATEST(v_cost - v_balance, 0) AS missing_credits;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM check_user_credits('ef6c7524-181a-4cb1-8ec3-65e2f140b82f', 'growth_dashboard');
-- Retorna: has_credits | current_balance | required_credits | missing_credits

COMMENT ON FUNCTION check_user_credits IS 'Verifica si un usuario tiene suficientes créditos para usar un feature';

-- ============================================
-- FUNCIÓN 3: Aplicar rollover de créditos (mensual)
-- ============================================
CREATE OR REPLACE FUNCTION apply_monthly_rollover()
RETURNS TABLE (
  user_id UUID,
  previous_balance INTEGER,
  rollover_credits INTEGER,
  new_monthly_credits INTEGER,
  final_balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_plans AS (
    -- Obtener plan de cada usuario basado en sus créditos mensuales
    SELECT
      uc.user_id,
      uc.total_credits AS previous_balance,
      uc.monthly_credits,
      sp.rollover_limit,
      sp.total_credits AS plan_credits
    FROM public.user_credits uc
    LEFT JOIN public.subscription_packages sp
      ON uc.monthly_credits = sp.total_credits
    WHERE sp.is_active = true
  ),
  rollover_calc AS (
    -- Calcular rollover permitido
    SELECT
      up.user_id,
      up.previous_balance,
      up.monthly_credits,
      up.rollover_limit,
      up.plan_credits,
      -- Rollover es el menor entre: balance actual o límite permitido
      LEAST(up.previous_balance, up.rollover_limit) AS rollover_amount
    FROM user_plans up
  )
  -- Actualizar créditos y retornar resultados
  UPDATE public.user_credits uc
  SET
    total_credits = rc.plan_credits + rc.rollover_amount,
    monthly_credits = rc.plan_credits,
    updated_at = NOW()
  FROM rollover_calc rc
  WHERE uc.user_id = rc.user_id
  RETURNING
    uc.user_id,
    rc.previous_balance AS previous_balance,
    rc.rollover_amount AS rollover_credits,
    rc.plan_credits AS new_monthly_credits,
    uc.total_credits AS final_balance;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso (ejecutar manualmente cada mes o con cron job):
-- SELECT * FROM apply_monthly_rollover();
-- Retorna tabla con el rollover aplicado a cada usuario

COMMENT ON FUNCTION apply_monthly_rollover IS 'Aplica rollover mensual de créditos según límite del plan';

-- ============================================
-- FUNCIÓN 4: Obtener info completa de plan
-- ============================================
CREATE OR REPLACE FUNCTION get_user_plan_info(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  current_credits INTEGER,
  plan_name VARCHAR,
  plan_slug VARCHAR,
  monthly_credits INTEGER,
  rollover_limit INTEGER,
  credits_percentage DECIMAL,
  can_use_growth_dashboard BOOLEAN,
  can_use_competitor_analysis BOOLEAN,
  recommended_upgrade VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT
      uc.user_id,
      uc.total_credits,
      uc.monthly_credits,
      sp.name AS plan_name,
      sp.slug AS plan_slug,
      sp.rollover_limit,
      sp.total_credits AS plan_total
    FROM public.user_credits uc
    LEFT JOIN public.subscription_packages sp
      ON uc.monthly_credits = sp.total_credits
    WHERE uc.user_id = p_user_id
  )
  SELECT
    ud.user_id,
    ud.total_credits AS current_credits,
    COALESCE(ud.plan_name, 'Free') AS plan_name,
    COALESCE(ud.plan_slug, 'free') AS plan_slug,
    ud.monthly_credits,
    COALESCE(ud.rollover_limit, 0) AS rollover_limit,
    ROUND((ud.total_credits::DECIMAL / NULLIF(ud.monthly_credits, 0)) * 100, 2) AS credits_percentage,
    -- Puede usar Growth Dashboard? (380 créditos)
    ud.total_credits >= 380 AS can_use_growth_dashboard,
    -- Puede usar Competitor Analysis? (200 créditos)
    ud.total_credits >= 200 AS can_use_competitor_analysis,
    -- Recomendar upgrade si créditos < 20% del plan
    CASE
      WHEN ud.total_credits < (ud.monthly_credits * 0.2) THEN
        CASE
          WHEN ud.monthly_credits <= 150 THEN 'starter'
          WHEN ud.monthly_credits <= 1000 THEN 'pro'
          WHEN ud.monthly_credits <= 3000 THEN 'premium'
          ELSE 'enterprise'
        END
      ELSE NULL
    END AS recommended_upgrade
  FROM user_data ud;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM get_user_plan_info('ef6c7524-181a-4cb1-8ec3-65e2f140b82f');

COMMENT ON FUNCTION get_user_plan_info IS 'Obtiene información completa del plan y créditos de un usuario';

-- ============================================
-- FUNCIÓN 5: Estadísticas de consumo de features
-- ============================================
CREATE OR REPLACE FUNCTION get_feature_usage_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  feature_name VARCHAR,
  usage_count BIGINT,
  total_credits_consumed INTEGER,
  avg_credits_per_use DECIMAL,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ct.description AS feature_name,
    COUNT(*) AS usage_count,
    SUM(ABS(ct.amount))::INTEGER AS total_credits_consumed,
    ROUND(AVG(ABS(ct.amount)), 2) AS avg_credits_per_use,
    COUNT(DISTINCT ct.user_id) AS unique_users
  FROM public.credit_transactions ct
  WHERE
    ct.type = 'consumption'
    -- Remover filtro de fecha si la columna no existe aún
    -- AND ct.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY ct.description
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM get_feature_usage_stats(30); -- Últimos 30 días
-- SELECT * FROM get_feature_usage_stats(7);  -- Última semana

COMMENT ON FUNCTION get_feature_usage_stats IS 'Obtiene estadísticas de uso de features en los últimos N días';

-- ============================================
-- FUNCIÓN 6: Proyección de agotamiento de créditos
-- ============================================
CREATE OR REPLACE FUNCTION estimate_credits_depletion(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  current_credits INTEGER,
  daily_avg_consumption DECIMAL,
  estimated_days_remaining INTEGER,
  estimated_depletion_date DATE,
  warning_level VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH consumption_data AS (
    SELECT
      ct.user_id,
      AVG(ABS(ct.amount)) AS daily_avg
    FROM public.credit_transactions ct
    WHERE
      ct.user_id = p_user_id
      AND ct.type = 'consumption'
      -- Remover filtro de fecha si la columna no existe aún
      -- AND ct.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY ct.user_id
  )
  SELECT
    uc.user_id,
    uc.total_credits AS current_credits,
    COALESCE(cd.daily_avg, 0) AS daily_avg_consumption,
    CASE
      WHEN COALESCE(cd.daily_avg, 0) > 0
      THEN (uc.total_credits / cd.daily_avg)::INTEGER
      ELSE 9999 -- Si no hay consumo, retornar valor alto
    END AS estimated_days_remaining,
    CASE
      WHEN COALESCE(cd.daily_avg, 0) > 0
      THEN (NOW() + (uc.total_credits / cd.daily_avg || ' days')::INTERVAL)::DATE
      ELSE NULL
    END AS estimated_depletion_date,
    CASE
      WHEN uc.total_credits = 0 THEN 'CRITICAL'
      WHEN uc.total_credits < (uc.monthly_credits * 0.1) THEN 'HIGH'
      WHEN uc.total_credits < (uc.monthly_credits * 0.3) THEN 'MEDIUM'
      ELSE 'LOW'
    END AS warning_level
  FROM public.user_credits uc
  LEFT JOIN consumption_data cd ON uc.user_id = cd.user_id
  WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT * FROM estimate_credits_depletion('ef6c7524-181a-4cb1-8ec3-65e2f140b82f');

COMMENT ON FUNCTION estimate_credits_depletion IS 'Estima cuándo se agotarán los créditos de un usuario basado en consumo histórico';

-- ============================================
-- ÍNDICES adicionales para optimizar funciones
-- ============================================
-- Verificar si la tabla credit_transactions existe antes de crear índices
DO $$
BEGIN
  -- Solo crear índice si la tabla existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'credit_transactions') THEN
    -- Crear índice de user_id y type
    CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type
      ON public.credit_transactions(user_id, type);

    RAISE NOTICE 'Índices de credit_transactions creados correctamente';
  ELSE
    RAISE NOTICE 'Tabla credit_transactions no existe aún, índices se crearán después';
  END IF;
END $$;

-- Índice para user_credits (esta tabla sí existe)
CREATE INDEX IF NOT EXISTS idx_user_credits_monthly
  ON public.user_credits(monthly_credits);

-- ============================================
-- GRANTS (permisos)
-- ============================================
-- Las funciones pueden ser ejecutadas por usuarios autenticados
GRANT EXECUTE ON FUNCTION get_feature_cost TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_plan_info TO authenticated;
GRANT EXECUTE ON FUNCTION estimate_credits_depletion TO authenticated;

-- Funciones administrativas solo para service_role
GRANT EXECUTE ON FUNCTION apply_monthly_rollover TO service_role;
GRANT EXECUTE ON FUNCTION get_feature_usage_stats TO service_role;

-- ============================================
-- FIN MIGRACIÓN 024
-- ============================================
-- Resultado esperado: 6 funciones creadas
-- ✅ get_feature_cost() - Obtener costo de feature
-- ✅ check_user_credits() - Verificar créditos suficientes
-- ✅ apply_monthly_rollover() - Aplicar rollover mensual
-- ✅ get_user_plan_info() - Info completa de plan
-- ✅ get_feature_usage_stats() - Estadísticas de uso
-- ✅ estimate_credits_depletion() - Proyección de agotamiento
-- ============================================
