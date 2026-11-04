# Security Specification

## 1. One-Time Admin Setup & Immutable Lock (`/system_lock/admin_setup`)
- `/system_lock/admin_setup` is an immutable singleton document (`allow update, delete: if false;`).
- It can only be created ONCE when `!exists(/databases/$(database)/documents/system_lock/admin_setup)`.
- Once created, public admin registration is permanently disabled at the database rule level.
- No email addresses or passwords are stored in `/system_lock/admin_setup`—only `{ initialized: true, adminUid: request.auth.uid, createdAt }`.

## 2. Administrator Authorization (`isAdmin()`)
- A user is authorized as an administrator ONLY if they are authenticated via Firebase Authentication AND either:
  1. Their UID matches the locked `adminUid` in `/system_lock/admin_setup` and `/admins/$(request.auth.uid)` has `role == 'admin'`, OR
  2. Their verified Firebase token matches the owner account (`subhasishdas1001@gmail.com` with `email_verified == true`).
- Other users cannot create `/admins/{uid}` documents once `/system_lock/admin_setup` exists.

## 3. Public vs. Admin Data Access
- Public visitors can only read `/site_published/main`, `/projects/{id}` where `status == 'published'`, and `get` `/system_lock/admin_setup`.
- All writes and all draft/activity reads require `isAdmin()` and strict schema/size validation.
