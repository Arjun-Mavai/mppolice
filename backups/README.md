# 📦 Database Backups Directory

This directory is automatically managed by the `db-backup.sh` script (or the `mppolice db` alias).

## What happens here?
1. **Safety Backups:** Before a production database is synced to your local environment, your existing `mppolice_local_dev.db` is copied here as a safety measure. It is prefixed with `local_before_sync_*.db`.
2. **Production Backups:** The script downloads the actual remote Turso SQLite database file into this directory (prefixed with `remote_prod_backup_*.db`).
3. **Overwrite:** The script then securely copies the newly downloaded production database to the project root, overwriting `mppolice_local_dev.db`.

## Cleanup
You can safely delete old `.db` files in this folder to save disk space. They are just point-in-time snapshots.
