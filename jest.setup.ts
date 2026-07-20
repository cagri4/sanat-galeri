// Jest setup file — add global test configuration here as needed

/**
 * Supabase istemcisi modül seviyesinde kuruluyor (`src/lib/db/supabase.ts`) ve
 * anahtar yoksa `createClient` fırlatıyor. Bu yüzden onu içeri alan her test
 * suite'i, testin kendisi ağa çıkmasa bile IMPORT sırasında düşüyordu.
 *
 * Buradaki değerler SAHTE ve yalnızca istemcinin kurulmasını sağlar; gerçek
 * ağ çağrısı yapan test yok (sorgular testlerde mock'lanıyor). Gerçek anahtar
 * .env.local'de durur, repoya girmez.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key'
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test'
