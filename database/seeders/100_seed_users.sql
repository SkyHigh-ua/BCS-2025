INSERT INTO public.users (first_name, last_name, password, email, role)
VALUES 
    ('Admin', 'User', 'hashed_password', 'admin@example.com', 0),
    ('John', 'Doe', 'hashed_password', 'john.doe@example.com', 1)
ON CONFLICT DO NOTHING;
