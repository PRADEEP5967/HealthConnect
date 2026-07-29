# Health Hub Lite

# Healthcare & Health Monitoring System

## Bolt.new Development Specification (LocalStorage Only + Admin Dashboard)

# 1. Project Overview

Build a complete healthcare and personal health monitoring web application with two main panels:

1. **User/Patient Application**

2  **And Add user Dashboard and add Required Feactures

2. **Admin Management Dashboard**

The application must work without any external database.

All data must be stored using:

* Browser LocalStorage

* JSON-based storage structure

* Local data management system

The platform should support offline usage and be built as a Progressive Web App (PWA).

---

# 2. Technology Stack

## Frontend

* React + TypeScript

* Tailwind CSS

* Modern dashboard UI

* Responsive design

* Dark/light theme

* Charts and analytics

## Storage

No database.

Use LocalStorage:

```

localStorage:

users

admin_profile

health_records

medications

appointments

medical_documents

health_metrics

activity_logs

notifications

system_settings

reports

```

---

# 3. User Roles

## Role 1: Patient/User

Capabilities:

* Manage personal health profile

* Track health information

* Monitor wellness

* Manage medicines

* Manage appointments

* Upload medical records

* Receive reminders

* View health analytics

## Role 2: Admin

Capabilities:

* Manage users

* Monitor activities

* Manage system settings

* View analytics

* Manage reports

* Control platform data

* Review health activities

---

# 4. Authentication System

Create role-based authentication.

Login fields:

* Email

* Password

* Role selection

Roles:

```

ADMIN

USER

```

Store locally:

```

{

 id,

 name,

 email,

 passwordHash,

 role,

 status,

 createdDate

}

```

Features:

* Login

* Logout

* Registration

* Session handling

* Protected routes

* Role-based access control

---

# 5. Admin Dashboard

Create a professional admin dashboard.

## Admin Home Dashboard

Display:

### System Overview Cards

* Total Users

* Active Users

* Total Health Records

* Total Appointments

* Total Medicines Added

* System Activities

* Reports Generated

### Analytics Charts

Include:

* User registration trends

* Daily activities

* Health tracking usage

* Appointment statistics

* Medicine reminder statistics

Charts:

* Line chart

* Bar chart

* Pie chart

* Area chart

---

# 6. User Management Module

Admin can manage all users.

Features:

## View Users

Display:

* User ID

* Name

* Email

* Age

* Gender

* Registration date

* Account status

Actions:

* View profile

* Edit user

* Activate/deactivate user

* Delete user

* Reset password

Search:

* Name search

* Email search

* Filter by status

---

# 7. Patient Health Monitoring Management

Admin can monitor user health activities.

View:

* Health records

* Vital measurements

* BMI history

* Blood pressure records

* Blood sugar records

* Fitness activity

* Sleep records

Admin actions:

* View health timeline

* Add health notes

* Add recommendations

* Export health report

---

# 8. Activity Monitoring System

Create an activity log system.

Track:

User activities:

```

LOGIN

LOGOUT

PROFILE_UPDATE

HEALTH_RECORD_ADDED

MEDICINE_CREATED

APPOINTMENT_CREATED

REPORT_GENERATED

```

Admin can:

* View activity history

* Filter activities

* Search logs

* Clear old logs

Activity log example:

```

{

 userId,

 activity,

 timestamp,

 description

}

```

---

# 9. Appointment Management Admin Panel

Admin can manage all appointments.

Features:

View:

* All appointments

* Upcoming appointments

* Completed appointments

* Cancelled appointments

Actions:

* Edit appointment

* Delete appointment

* Approve appointment

* Change status

Status:

```

Pending

Approved

Completed

Cancelled

```

---

# 10. Medicine Management Admin Panel

Admin can monitor medicine activities.

View:

* Medicines created

* User medication schedules

* Reminder status

Actions:

* View medicine details

* Remove inappropriate entries

* Manage medicine categories

---

# 11. Medical Records Management

Admin can manage uploaded records.

View:

* Reports

* Prescriptions

* Documents

* Medical history

Features:

* Preview documents

* Download files

* Delete records

* Add notes

---

# 12. Notification Management

Admin can control notifications.

Features:

Create:

* System announcements

* Health tips

* Maintenance messages

Send:

* All users

* Selected users

Manage:

* Notification history

* Notification templates

---

# 13. Content Management System

Admin can manage:

## Health Articles

Create:

* Health tips

* Exercise guides

* Nutrition information

* Wellness articles

Actions:

* Add

* Edit

* Delete

* Publish/unpublish

---

# 14. System Settings Management

Admin settings:

Manage:

* Application name

* Logo

* Theme

* Default notifications

* Health categories

* User permissions

Stored:

```

system_settings

```

---

# 15. Reports & Analytics

Admin reporting system:

Generate:

## User Reports

* Registration report

* Activity report

## Health Reports

* Health tracking statistics

* Most tracked metrics

## System Reports

* Usage report

* Storage usage

* Application performance

Export:

* JSON

* CSV

* PDF

---

# 16. Admin Security Features

Implement:

* Admin-only routes

* Password protection

* Session timeout

* Activity tracking

* Permission checks

Admin actions should create logs.

Example:

```

Admin deleted user record

Date:

Action:

Admin ID:

```

---

# 17. Admin Emergency Management

Admin can view:

Emergency profiles:

* Blood group

* Allergies

* Emergency contacts

* Medical conditions

Actions:

* Verify information

* Update emergency details

---

# 18. Admin Backup Management

Since no database exists:

Admin can:

## Export Full System Backup

Includes:

* Users

* Health records

* Appointments

* Settings

* Logs

## Restore Backup

Upload JSON backup file.

---

# 19. Advanced Admin Features

## AI Analytics Dashboard

Future support:

* Health trend analysis

* User behavior insights

* Risk pattern detection

## Audit System

Track:

* Admin actions

* User actions

* System changes

## Multi Admin Support

Future:

Roles:

```

Super Admin

Health Manager

Support Admin

Content Manager

```

---

# 20. Admin Dashboard Pages

Create:

```

/admin

/admin/login

/admin/dashboard

/admin/users

/admin/health-monitoring

/admin/appointments

/admin/medications

/admin/medical-records

/admin/notifications

/admin/content

/admin/reports

/admin/settings

/admin/activity-logs

/admin/backup

```

---

# 21. Admin Components

Create reusable components:

```

AdminSidebar

AdminNavbar

StatsCard

UserTable

ActivityTable

HealthChart

ReportCard

NotificationManager

SettingsForm

BackupManager

```

---

# 22. Complete Application Structure

Final routes:

## User

```

/

login

register

dashboard

health

medicine

appointments

records

fitness

nutrition

sleep

emergency

profile

settings

```

## Admin

```

admin/login

admin/dashboard

admin/users

admin/activity

admin/reports

admin/settings

```

---

# 23. Future External Service Integrations

Possible services:

Health Devices:

* Apple HealthKit

* Google Fit

* Fitbit API

* Garmin API

AI:

* OpenAI API

* Google Gemini API

Communication:

* Firebase Notifications

* Twilio SMS

* Email APIs

Healthcare:

* Telemedicine APIs

* Pharmacy APIs

* Laboratory APIs

---

# 24. Final Bolt.new Instructions

Build a complete healthcare monitoring platform with:

* React + TypeScript

* Tailwind CSS

* LocalStorage only

* No database

* User panel

* Admin dashboard

* Role-based authentication

* Analytics dashboards

* Health monitoring features

* Offline PWA support

* Secure local data management

The final application should look like a professional healthcare SaaS platform with patient management and administrator control.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c863784a-59ac-4070-9502-8e6f415169e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
