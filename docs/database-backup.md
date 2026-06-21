# Database Backup Strategy

To ensure data integrity and prevent permanent loss, follow these backup strategies tailored for Ocean Developers Invoice Suite.

## 1. Automated Scheduled Backups (Cron Jobs)
If your server supports cron jobs, implement a `mysqldump` routine.

### Daily Backup
Create a shell script `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
mysqldump -u root -p[YOUR_PASSWORD] ocean_invoice_suite > /backups/db-backup-$DATE.sql
```
Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```
*(Runs daily at 2:00 AM)*

## 2. Shared Hosting / CPanel Backup
If hosting via CPanel without SSH access:
1. Navigate to **phpMyAdmin**.
2. Select `ocean_invoice_suite` database.
3. Click the **Export** tab.
4. Keep the format as **SQL** and click **Go**.
5. Save the resulting `.sql` file securely.
*Recommendation: Perform this manually at least once a week.*

## 3. Disaster Recovery
If you need to restore the database:
1. Ensure the MySQL server is running.
2. Run the following command via terminal:
```bash
mysql -u root -p[YOUR_PASSWORD] ocean_invoice_suite < /path/to/your/backup.sql
```
Or via **phpMyAdmin** > **Import** tab.
