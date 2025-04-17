CREATE TABLE public.user_groups (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

CREATE TABLE public.group_sites (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    site_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE
);

CREATE TABLE public.group_roles (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

CREATE TABLE public.user_roles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.site_plugins (
    id SERIAL PRIMARY KEY,
    site_id INT NOT NULL,
    plugin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE,
    FOREIGN KEY (plugin_id) REFERENCES public.plugins(id) ON DELETE CASCADE
);

CREATE TABLE public.site_modules (
    id SERIAL PRIMARY KEY,
    site_id INT NOT NULL,
    module_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE
);