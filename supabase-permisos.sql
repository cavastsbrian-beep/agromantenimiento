-- Corré esto en el SQL Editor de Supabase DESPUÉS de las tablas que ya creaste.
-- Esto habilita que la aplicación pueda agregar, editar y eliminar datos
-- (hasta ahora las tablas solo permitían lectura).

create policy "public insert maquinas" on maquinas for insert with check (true);
create policy "public update maquinas" on maquinas for update using (true);
create policy "public delete maquinas" on maquinas for delete using (true);

create policy "public insert mantenimientos" on mantenimientos for insert with check (true);
create policy "public update mantenimientos" on mantenimientos for update using (true);
create policy "public delete mantenimientos" on mantenimientos for delete using (true);

-- Permite que la app suba archivos a los dos buckets de almacenamiento.
create policy "insert fotos" on storage.objects for insert to anon with check (bucket_id = 'fotos-maquinaria');
create policy "insert planillas" on storage.objects for insert to anon with check (bucket_id = 'planillas-excel');
