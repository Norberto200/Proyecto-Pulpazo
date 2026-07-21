UPDATE auth.users
SET raw_user_meta_data = '{"role": "mesero", "full_name": "Mesero", "email_verified": true}'::jsonb
WHERE email = 'mesero@elpulpazo.com';

SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'mesero@elpulpazo.com';
