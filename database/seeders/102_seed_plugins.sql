INSERT INTO public.plugins (name, description, requirements, repo_link, tags)
VALUES 
    ('SEO Plugin', 'A plugin for SEO optimization', '{"min_version": "1.0.0"}', 'https://github.com/example', ARRAY['seo', 'default']),
    ('Analytics Plugin', 'A plugin for site analytics', '{"min_version": "1.0.0"}', 'https://github.com/example', ARRAY['analytics', 'default'])
ON CONFLICT DO NOTHING;
