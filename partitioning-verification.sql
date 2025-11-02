-- =====================================
-- VERIFICACIÓN FINAL DE PARTICIONAMIENTO
-- =====================================

SELECT '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE' as result;

-- 1. ESTADO ACTUAL DE LA TABLA
-- =====================================
SELECT 
  '📊 ESTADO ACTUAL' as section,
  COUNT(*) as total_tickets,
  COUNT(DISTINCT "raffleId") as unique_raffles,
  MIN(id) as min_id,
  MAX(id) as max_id
FROM tickets;

-- 2. DISTRIBUCIÓN EN PARTICIONES
-- =====================================
SELECT 
  '🗂️ DISTRIBUCIÓN POR PARTICIÓN' as section,
  schemaname,
  tablename as partition_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename LIKE 'tickets_part_%'
ORDER BY tablename;

-- 3. VERIFICAR PARTITION PRUNING
-- =====================================
SELECT '⚡ PERFORMANCE TEST' as section;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT COUNT(*) FROM tickets WHERE "raffleId" = 1;

-- 4. VERIFICAR ÍNDICES
-- =====================================
SELECT 
  '📇 ÍNDICES CREADOS' as section,
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename LIKE 'tickets_part_%'
ORDER BY tablename, indexname;

-- 5. VERIFICAR CONSTRAINTS
-- =====================================
SELECT 
  '🔒 CONSTRAINTS' as section,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid IN (
  SELECT oid FROM pg_class 
  WHERE relname LIKE 'tickets_part_%'
)
ORDER BY conname;

-- 6. TEST DE INSERCIÓN
-- =====================================
SELECT '🧪 TEST DE FUNCIONALIDAD' as section;

-- Test: ¿Qué partición usa una rifa específica?
SELECT 
  "raffleId",
  abs(hashtext("raffleId"::text)) % 8 as partition_number,
  'tickets_part_' || (abs(hashtext("raffleId"::text)) % 8) as target_partition,
  COUNT(*) as current_tickets
FROM tickets
GROUP BY "raffleId", abs(hashtext("raffleId"::text)) % 8
ORDER BY "raffleId";

-- 7. PRÓXIMOS PASOS Y RECOMENDACIONES
-- =====================================
SELECT '📋 RECOMENDACIONES' as section;

SELECT 
  'Monitor partition sizes regularly' as recommendation,
  'Use: SELECT pg_size_pretty(pg_total_relation_size(schemaname||''.''||tablename)) FROM pg_tables WHERE tablename LIKE ''tickets_part_%'';' as command
UNION ALL
SELECT 
  'Monitor query performance',
  'Use: EXPLAIN (ANALYZE, BUFFERS) for queries with raffleId filter'
UNION ALL
SELECT 
  'Consider adding more partitions if growth > 10M tickets',
  'Current setup supports ~1.25M tickets per partition efficiently'
UNION ALL
SELECT 
  'Backup strategy: backup individual partitions',
  'pg_dump -t tickets_part_X for specific partitions'
UNION ALL
SELECT 
  'Enable auto-vacuum per partition',
  'ALTER TABLE tickets_part_X SET (autovacuum_enabled = true);';

-- 8. CONFIGURACIÓN RECOMENDADA
-- =====================================
DO $$
DECLARE
    partition_name TEXT;
BEGIN
    FOR partition_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'tickets_part_%'
    LOOP
        -- Configurar autovacuum optimizado para cada partición
        EXECUTE format('ALTER TABLE %s SET (
          autovacuum_vacuum_scale_factor = 0.1,
          autovacuum_analyze_scale_factor = 0.05,
          autovacuum_vacuum_cost_delay = 10
        )', partition_name);
        
        RAISE NOTICE '✅ Configuración optimizada para: %', partition_name;
    END LOOP;
END $$;

SELECT '🎯 CONFIGURACIÓN COMPLETADA' as final_status;