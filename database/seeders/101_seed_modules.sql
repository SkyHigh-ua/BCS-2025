INSERT INTO public.modules (name, description, repo_link, inputs, outputs, tags)
VALUES 
    ('Contact Form', 'A module for adding contact forms', 'https://github.com/example', '{"fields": ["name", "email", "message"]}', '{"response": "success"}', ARRAY['form', 'default']),
    ('Gallery', 'A module for image galleries', 'https://github.com/example', '{"images": ["url"]}', '{"display": "grid"}', ARRAY['default', 'images'])
ON CONFLICT DO NOTHING;
