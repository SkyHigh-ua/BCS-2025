INSERT INTO public.users (first_name, last_name, password, email, role)
VALUES 
    ('Test', 'User', '$2b$10$Z9G3GjRy4sTqmrEI0ANHn.Nc8KUzQ0DiPnPROhz9.li3zbRWKeFXq', 'admin@example.com', 0)
ON CONFLICT DO NOTHING;
