CREATE TRIGGER prevent_last_admin_demotion
BEFORE UPDATE OF role, status ON users
WHEN OLD.role = 'admin' AND (NEW.role <> 'admin' OR NEW.status <> 'active')
  AND (SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active') <= 1
BEGIN
  SELECT RAISE(ABORT, 'cannot remove the last active administrator');
END;
