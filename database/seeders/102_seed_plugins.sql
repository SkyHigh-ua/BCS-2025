INSERT INTO public.plugins (name, description, requirements, repo_link, tags)
VALUES 
    ('SSH Plugin', '', '{}', 'https://github.com/SkyHigh-ua/BCS-2025/tree/dev/misc/plugins/ssh', ARRAY['ssh', 'default']),
    ('Wordpress Plugin', '', '{}', 'https://github.com/SkyHigh-ua/BCS-2025/tree/dev/misc/plugins/wordpress', ARRAY['wordpress', 'default'])
ON CONFLICT DO NOTHING;
