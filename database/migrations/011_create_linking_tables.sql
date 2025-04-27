-- Users of the group
CREATE TABLE public.user_groups (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Roles of the user
CREATE TABLE public.user_roles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    group_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
    FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Sites that group covers
CREATE TABLE public.group_sites (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    site_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE
);

-- Plugins of the site
CREATE TABLE public.site_plugins (
    id SERIAL PRIMARY KEY,
    site_id INT NOT NULL,
    plugin_id INT NOT NULL,
    UNIQUE (site_id, plugin_id),
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE,
    FOREIGN KEY (plugin_id) REFERENCES public.plugins(id) ON DELETE CASCADE
);

-- Modules of the site
CREATE TABLE public.site_modules (
    id SERIAL PRIMARY KEY,
    site_id INT NOT NULL,
    module_id INT NOT NULL,
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- Relationship table for module hierarchy
CREATE TABLE public.module_parents (
    module_id INT NOT NULL,
    parent_module_id INT NOT NULL,
    PRIMARY KEY (module_id, parent_module_id),
    FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_module_id) REFERENCES public.modules(id) ON DELETE CASCADE
);