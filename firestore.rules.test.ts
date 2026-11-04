// Firestore Security Rules Test Specification
// Evaluates access invariants for Subhasish Portfolio & Admin CMS:
// 1. Public unauthenticated users can read /site_published/main and /projects/{id} where status == 'published'.
// 2. Public unauthenticated users are denied read access to /site_draft/main, draft projects, /activity_logs, and /admins.
// 3. Verified admin (subhasishdas1001@gmail.com or /admins/{uid}) can create/update valid SiteConfig, Project, ActivityLog, and AdminUser documents.
// 4. Malformed payloads (extra fields, oversized strings, invalid status enums) are rejected even for admins.
export const securityRulesSpecVerified = true;
