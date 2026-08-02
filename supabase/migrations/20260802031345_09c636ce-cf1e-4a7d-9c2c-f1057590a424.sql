-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  age integer,
  gender text,
  blood_group text,
  status text NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Activity logs
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  activity text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies: user_roles
CREATE POLICY "Users can view roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies: activity logs
CREATE POLICY "Users can view own activity"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own activity"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete activity"
  ON public.activity_logs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Signup trigger: create profile + role (first ever account becomes admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    _role := 'user';
  ELSE
    _role := 'admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Demo seed data
INSERT INTO public.profiles (id, name, email, phone, age, gender, blood_group, status, is_demo, created_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Aarav Sharma', 'aarav@example.com', '+91 98200 11111', 34, 'Male', 'O+', 'active', true, now() - interval '40 days'),
  ('22222222-2222-4222-8222-222222222222', 'Priya Nair', 'priya@example.com', '+91 98200 22222', 29, 'Female', 'A+', 'active', true, now() - interval '25 days'),
  ('33333333-3333-4333-8333-333333333333', 'Rahul Verma', 'rahul@example.com', '+91 98200 33333', 46, 'Male', 'B+', 'inactive', true, now() - interval '12 days'),
  ('44444444-4444-4444-8444-444444444444', 'Meera Iyer', 'meera@example.com', '+91 98200 44444', 52, 'Female', 'AB+', 'active', true, now() - interval '5 days');

INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-4111-8111-111111111111', 'user'),
  ('22222222-2222-4222-8222-222222222222', 'user'),
  ('33333333-3333-4333-8333-333333333333', 'user'),
  ('44444444-4444-4444-8444-444444444444', 'user');

INSERT INTO public.activity_logs (user_id, user_name, activity, description, created_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Aarav Sharma', 'REGISTER', 'Created account', now() - interval '40 days'),
  ('11111111-1111-4111-8111-111111111111', 'Aarav Sharma', 'HEALTH_LOGGED', 'Logged blood pressure 128/82', now() - interval '3 days'),
  ('22222222-2222-4222-8222-222222222222', 'Priya Nair', 'APPOINTMENT_CREATED', 'Booked Dr. Kapoor on Monday', now() - interval '2 days'),
  ('33333333-3333-4333-8333-333333333333', 'Rahul Verma', 'MEDICINE_CREATED', 'Added Metformin 500mg', now() - interval '1 day'),
  ('44444444-4444-4444-8444-444444444444', 'Meera Iyer', 'LOGIN', 'Signed into account', now() - interval '4 hours');