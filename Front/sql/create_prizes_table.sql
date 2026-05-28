-- SQL script to initialize prizes table
CREATE TABLE IF NOT EXISTS public.prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Anyone can read prizes." ON public.prizes;
CREATE POLICY "Anyone can read prizes." ON public.prizes FOR SELECT USING (true);

-- Update/All policy
DROP POLICY IF EXISTS "Admins can update prizes." ON public.prizes;
CREATE POLICY "Admins can update prizes." ON public.prizes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin')
  )
);

-- Insert initial values
INSERT INTO public.prizes (position, title, description, image_url)
VALUES 
  (1, 'Remera de Argentina', 'La camiseta oficial de la selección campeona del mundo, talle a elección.', '/remera_argentina.png'),
  (2, 'Cafetera Nespresso', 'Para empezar tus mañanas de desarrollo con un café premium en cápsulas.', '/cafetera_nespresso.png'),
  (3, 'Pava eléctrica', 'Tu compañera ideal de acero inoxidable para cebar unos buenos mates en la oficina.', '/pava_electrica.png'),
  (4, 'Juego de mate', 'Kit premium: Mate de calabaza forrado en cuero, bombilla de alpaca y termo de acero.', '/juego_mate.png'),
  (5, 'Gin Tonic', 'Un kit de Gin nacional artesanal y 4 latas de tónica para festejar el podio.', '/gin_tonic.png')
ON CONFLICT (position) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;
