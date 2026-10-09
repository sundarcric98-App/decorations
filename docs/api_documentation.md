# REST API Reference — Sathuragiri Decoration

Base Versioned URL: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Login with email & password, sets JWT cookie | None |
| `POST` | `/api/v1/auth/logout` | Clears auth cookie | Yes |
| `POST` | `/api/v1/auth/forgot-password` | Generate reset token | None |
| `POST` | `/api/v1/auth/reset-password` | Reset password using valid token | None |
| `GET` | `/api/v1/auth/me` | Fetch active user session | Yes |

---

## 2. Public Catalogues
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/services` | List published services & categories | None |
| `GET` | `/api/v1/services/:idOrSlug`| Service detail by slug | None |
| `GET` | `/api/v1/packages` | List active packages | None |
| `GET` | `/api/v1/packages/:idOrSlug`| Package detail | None |
| `GET` | `/api/v1/portfolio` | List published portfolio projects | None |
| `GET` | `/api/v1/portfolio/:idOrSlug`| Portfolio project detail | None |

---

## 3. Enquiries Pipeline (`/api/v1/enquiries`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/enquiries` | Submit public event enquiry | None (Rate Limited) |
| `GET` | `/api/v1/enquiries` | List & filter enquiries with pagination | Yes |
| `GET` | `/api/v1/enquiries/:id` | Full enquiry dossier with notes & history | Yes |
| `PATCH`| `/api/v1/enquiries/:id` | Update enquiry status / details | Yes |
| `POST` | `/api/v1/enquiries/:id/notes` | Add follow-up note & schedule | Yes |
| `POST` | `/api/v1/enquiries/:id/convert` | Atomic conversion to confirmed Booking | OWNER / MANAGER |

---

## 4. Bookings & Operations (`/api/v1/bookings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/bookings` | List bookings with date/status filters | Yes |
| `GET` | `/api/v1/bookings/:id` | Booking details, assignments, financials | Yes |
| `POST` | `/api/v1/bookings` | Create new booking with conflict check | Yes |
| `PUT` | `/api/v1/bookings/:id` | Update booking & services | Yes |
| `PATCH`| `/api/v1/bookings/:id/status` | Update booking status | Yes |
| `POST` | `/api/v1/bookings/:id/assign` | Assign crew member or vendor | Yes |
| `DELETE`| `/api/v1/bookings/:id/assign/:assignmentId` | Remove crew assignment | Yes |

---

## 5. Quotation Builder (`/api/v1/quotations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/quotations` | List quotations with customer/booking filters | Yes |
| `GET` | `/api/v1/quotations/:id` | Get quotation details with line items | Yes |
| `POST` | `/api/v1/quotations` | Create quotation (server-calculated totals) | Yes |
| `PUT` | `/api/v1/quotations/:id` | Update quotation / create new version | Yes |
| `GET` | `/api/v1/quotations/:id/pdf` | Download formatted Quotation PDF | Yes |

---

## 6. Payments & Invoicing (`/api/v1/payments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/payments` | List payments with search & filters | Yes |
| `GET` | `/api/v1/payments/:id` | Get payment details | Yes |
| `POST` | `/api/v1/payments` | Record advance/partial payment | Yes |
| `GET` | `/api/v1/payments/:id/receipt` | Download Payment Receipt PDF | Yes |

---

## 7. Operational Expenses & Reports
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/expenses` | List expense records with category filters | Yes |
| `POST` | `/api/v1/expenses` | Record new expense entry | Yes |
| `PUT` | `/api/v1/expenses/:id` | Update expense entry | Yes |
| `DELETE`| `/api/v1/expenses/:id` | Delete expense entry | Yes |
| `GET` | `/api/v1/reports/summary` | Executive metrics, monthly trend, funnels | Yes |
| `GET` | `/api/v1/reports/export-csv` | Export sanitized CSV for Bookings/Payments/Expenses | Yes |
