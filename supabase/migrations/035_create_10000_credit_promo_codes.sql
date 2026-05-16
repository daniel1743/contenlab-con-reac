insert into public.promo_codes (code, credit_amount, max_uses, expires_at, is_active, description)
values
  ('CREO-10000-HADES-01', 10000, 1, null, true, 'Codigo promocional personal de 10000 creditos para pruebas CreoVision'),
  ('CREO-10000-HADES-02', 10000, 1, null, true, 'Codigo promocional personal de 10000 creditos para pruebas CreoVision')
on conflict (code) do update
set
  credit_amount = excluded.credit_amount,
  max_uses = excluded.max_uses,
  expires_at = excluded.expires_at,
  is_active = excluded.is_active,
  description = excluded.description;
