DELETE FROM public.activity_logs WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@example.com' AND is_demo = false);
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@example.com' AND is_demo = false);
DELETE FROM auth.users WHERE email LIKE '%@example.com';
DELETE FROM public.profiles WHERE email LIKE '%@example.com' AND is_demo = false;