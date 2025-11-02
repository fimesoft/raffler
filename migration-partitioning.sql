-- =====================================
-- MIGRACIÓN A TABLA PARTICIONADA
-- Tickets Table - Hash Partitioning by raffleId
-- =====================================

-- 1. BACKUP Y VERIFICACIÓN INICIAL
-- =====================================

-- Verificar datos actuales
SELECT 
  'BEFORE MIGRATION' as status,
  COUNT(*) as total_tickets,
  COUNT(DISTINCT "raffleId") as unique_raffles,
  MIN("raffleId") as min_raffle_id,
  MAX("raffleId") as max_raffle_id
FROM tickets;

-- Verificar distribución por raffleId
SELECT 
  "raffleId",
  COUNT(*) as ticket_count
FROM tickets 
GROUP BY "raffleId" 
ORDER BY ticket_count DESC;

-- 2. CREAR TABLA PARTICIONADA
-- =====================================

-- Crear la nueva tabla particionada
CREATE TABLE tickets_partitioned (
  id                SERIAL,
  number            INT NOT NULL,
  "raffleId"        INT NOT NULL,
  "buyerId"         INT NOT NULL,
  status            TEXT DEFAULT 'SOLD',
  "buyerDocument"   VARCHAR(50) NOT NULL,
  "buyerPhone"      VARCHAR(20),
  "purchaseDate"    TIMESTAMP DEFAULT NOW(),
  "updatedAt"       TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (number > 0),
  CHECK ("raffleId" > 0),
  CHECK ("buyerId" > 0)
) PARTITION BY HASH ("raffleId");

-- 3. CREAR PARTICIONES (8 particiones para empezar)
-- =====================================

CREATE TABLE tickets_part_0 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 0);

CREATE TABLE tickets_part_1 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 1);

CREATE TABLE tickets_part_2 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 2);

CREATE TABLE tickets_part_3 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 3);

CREATE TABLE tickets_part_4 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 4);

CREATE TABLE tickets_part_5 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 5);

CREATE TABLE tickets_part_6 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 6);

CREATE TABLE tickets_part_7 PARTITION OF tickets_partitioned
  FOR VALUES WITH (MODULUS 8, REMAINDER 7);

-- 4. CREAR ÍNDICES EN CADA PARTICIÓN
-- =====================================

-- Función para crear índices en todas las particiones
DO $$
DECLARE
    partition_name TEXT;
BEGIN
    FOR partition_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'tickets_part_%'
    LOOP
        -- Índice para búsquedas por comprador
        EXECUTE format('CREATE INDEX idx_%s_buyer_id ON %s ("buyerId")', 
                      partition_name, partition_name);
        
        -- Índice para búsquedas por fecha
        EXECUTE format('CREATE INDEX idx_%s_purchase_date ON %s ("purchaseDate")', 
                      partition_name, partition_name);
        
        -- Índice para búsquedas por estado
        EXECUTE format('CREATE INDEX idx_%s_status ON %s (status)', 
                      partition_name, partition_name);
        
        -- Índice único compuesto (raffleId, number) en cada partición
        EXECUTE format('CREATE UNIQUE INDEX idx_%s_raffle_number ON %s ("raffleId", number)', 
                      partition_name, partition_name);
        
        RAISE NOTICE 'Índices creados para partición: %', partition_name;
    END LOOP;
END $$;

-- 5. MIGRAR DATOS EXISTENTES
-- =====================================

-- Verificar que no hay conflictos antes de migrar
DO $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM (
        SELECT "raffleId", number, COUNT(*)
        FROM tickets
        GROUP BY "raffleId", number
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'CONFLICTO: Existen % pares (raffleId, number) duplicados. Resolver antes de continuar.', conflict_count;
    END IF;
    
    RAISE NOTICE 'Verificación OK: No hay conflictos de unique constraint';
END $$;

-- Migrar todos los datos
INSERT INTO tickets_partitioned 
  (id, number, "raffleId", "buyerId", status, "buyerDocument", "buyerPhone", "purchaseDate", "updatedAt")
SELECT 
  id, number, "raffleId", "buyerId", status, "buyerDocument", "buyerPhone", "purchaseDate", "updatedAt"
FROM tickets;

-- 6. VERIFICAR MIGRACIÓN
-- =====================================

-- Comparar conteos
SELECT 
  'ORIGINAL' as table_name,
  COUNT(*) as total_records
FROM tickets
UNION ALL
SELECT 
  'PARTITIONED' as table_name,
  COUNT(*) as total_records
FROM tickets_partitioned;

-- Verificar distribución en particiones
SELECT 
  schemaname,
  tablename as partition_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT COUNT(*) FROM tickets_partitioned WHERE abs(hashtext("raffleId"::text)) % 8 = 
    CAST(substring(tablename from 'tickets_part_(.*)') AS INTEGER)) as estimated_rows
FROM pg_tables 
WHERE tablename LIKE 'tickets_part_%'
ORDER BY tablename;

-- Verificar que los datos son exactamente iguales
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT id FROM tickets 
      EXCEPT 
      SELECT id FROM tickets_partitioned
    ) THEN 'DIFERENCIAS ENCONTRADAS EN ORIGINAL'
    WHEN EXISTS (
      SELECT id FROM tickets_partitioned 
      EXCEPT 
      SELECT id FROM tickets
    ) THEN 'DIFERENCIAS ENCONTRADAS EN PARTICIONADA'
    ELSE 'DATOS IDÉNTICOS ✓'
  END as verification_result;

-- 7. PERFORMANCE TEST
-- =====================================

-- Test de performance - query típica
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM tickets WHERE "raffleId" = 1;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM tickets_partitioned WHERE "raffleId" = 1;

-- Test de conteo
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM tickets WHERE "raffleId" = 1;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM tickets_partitioned WHERE "raffleId" = 1;

-- 8. INFORMACIÓN DE PARTICIONES
-- =====================================

-- Ver qué partición corresponde a cada raffleId
SELECT 
  "raffleId",
  abs(hashtext("raffleId"::text)) % 8 as partition_number,
  'tickets_part_' || (abs(hashtext("raffleId"::text)) % 8) as partition_name,
  COUNT(*) as ticket_count
FROM tickets_partitioned
GROUP BY "raffleId", abs(hashtext("raffleId"::text)) % 8
ORDER BY "raffleId";

-- Estadísticas finales
SELECT 
  'MIGRACIÓN COMPLETADA' as status,
  NOW() as completed_at,
  COUNT(*) as total_tickets_migrated,
  COUNT(DISTINCT "raffleId") as raffles_distributed
FROM tickets_partitioned;

-- =====================================
-- COMANDOS PARA APLICAR LA MIGRACIÓN
-- =====================================

/*
PASO 1: Hacer backup
pg_dump -h localhost -p 5432 -U diegoquintero -d raffler -t tickets > tickets_backup.sql

PASO 2: Ejecutar este script
psql -h localhost -p 5432 -U diegoquintero -d raffler -f migration-partitioning.sql

PASO 3: Si todo está OK, reemplazar tabla:
BEGIN;
ALTER TABLE tickets RENAME TO tickets_old;
ALTER TABLE tickets_partitioned RENAME TO tickets;
COMMIT;

PASO 4: Actualizar secuencia (si es necesario):
SELECT setval('tickets_id_seq', (SELECT MAX(id) FROM tickets));

PASO 5: Drop tabla anterior (cuando estés seguro):
DROP TABLE tickets_old;
*/