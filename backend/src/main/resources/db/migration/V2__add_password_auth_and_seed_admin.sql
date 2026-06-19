-- Add nullable password_hash column for email/BCrypt login (Google SSO users will have NULL here)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Seed: dummy ADMIN user
-- Email:    admin@yourcompany.com
-- Password: Admin@123
-- BCrypt hash is computed using pgcrypto (compatible with Spring BCryptPasswordEncoder)
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@yourcompany.com',
    crypt('Admin@123', gen_salt('bf', 10)),
    'Admin',
    'User',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
