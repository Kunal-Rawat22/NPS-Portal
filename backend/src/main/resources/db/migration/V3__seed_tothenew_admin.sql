-- Seed initial ADMIN for Google SSO (@tothenew.com workspace accounts only)
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'rishabh.mehrotra@tothenew.com',
    'Rishabh',
    'Mehrotra',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;
