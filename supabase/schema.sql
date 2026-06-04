-- Supabase Schema for task.coop MVP

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE task_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected');

-- USERS (Extends Supabase Auth users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'customer',
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  stripe_account_id TEXT,
  location_point JSONB,
  subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  budget NUMERIC(10, 2),
  status task_status NOT NULL DEFAULT 'open',
  location_point JSONB,
  zip_code TEXT,
  preferred_time TEXT,
  -- Nextdoor / external sourcing
  source TEXT NOT NULL DEFAULT 'direct',
  external_id TEXT,
  external_url TEXT,
  claim_token UUID DEFAULT gen_random_uuid(),
  sourced_by_worker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASK IMAGES
CREATE TABLE public.task_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OFFERS
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  message TEXT,
  status offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Users
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- Tasks
CREATE POLICY "Tasks are viewable by everyone." ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Customers can create tasks." ON public.tasks FOR INSERT WITH CHECK (
  (
    auth.uid() = customer_id
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'customer')
  )
  OR
  (
    customer_id IS NULL
    AND source = 'nextdoor'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'worker')
  )
);
CREATE POLICY "Customers can update own tasks." ON public.tasks FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Users can claim unclaimed sourced tasks." ON public.tasks FOR UPDATE
  USING (customer_id IS NULL AND source = 'nextdoor')
  WITH CHECK (auth.uid() = customer_id);

-- Task Images
CREATE POLICY "Task images are viewable by everyone." ON public.task_images FOR SELECT USING (true);
CREATE POLICY "Customers can insert images for their tasks." ON public.task_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND customer_id = auth.uid()));

-- Offers
CREATE POLICY "Offers are viewable by task owner and offer creator." ON public.offers FOR SELECT USING (auth.uid() = worker_id OR EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND customer_id = auth.uid()));
CREATE POLICY "Offers on unclaimed sourced tasks are publicly readable." ON public.offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND customer_id IS NULL AND source = 'nextdoor')
);
CREATE POLICY "Workers can create offers." ON public.offers FOR INSERT WITH CHECK (auth.uid() = worker_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'worker'));
CREATE POLICY "Workers can update own pending offers." ON public.offers FOR UPDATE USING (auth.uid() = worker_id AND status = 'pending');
CREATE POLICY "Customers can update offer status." ON public.offers FOR UPDATE USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND customer_id = auth.uid()));

-- Messages
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages if they are sender." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Handyman', 'handyman', 'General home repairs and maintenance'),
('Furniture Assembly', 'furniture-assembly', 'Putting together flat-pack furniture'),
('Junk Removal', 'junk-removal', 'Hauling away unwanted items'),
('Moving Help', 'moving-help', 'Assistance with loading, unloading, and moving'),
('Yard Work', 'yard-work', 'Lawn care, gardening, and outdoor maintenance'),
('Cleaning', 'cleaning', 'Home and office cleaning services');
