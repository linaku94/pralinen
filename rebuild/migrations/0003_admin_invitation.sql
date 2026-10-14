-- Explicitly authorized initial admin. Other Google accounts cannot register as admins.
INSERT INTO admin_invites (email)
VALUES ('linaku94@gmail.com')
ON CONFLICT(email) DO NOTHING;
