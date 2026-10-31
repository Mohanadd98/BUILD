# Competitor notes

Based on App Store screenshots, descriptions and reviews seen on 31 October 2026. These are product observations, not code analysis; items marked "likely" are inferences to verify.

## Instapro (Werkspot BV)

**What it is:** a home services lead marketplace (Italian edition). Customers post a job through a guided form; professionals reply; the customer picks whom to share contact details with.

**Business model (likely):** free for customers; professionals pay to unlock job requests.

**Weaknesses seen in reviews:**
1. Poor lead quality: a professional paid to unlock a request and the customer never answered.
2. No refund or guarantee for unanswered leads.
3. Professionals cannot sign up in the customer app.
4. Support only by email.
5. Small, stale presence: 6 ratings, last update 10 months earlier.

**Applied in BUILD:** the quote request. A project's bill of quantities can be sent to contractors as a PDF with empty price columns, through WhatsApp or email.

**Kept for Phase 2 (needs accounts and a server):** contractor profiles, ratings, matching, paid leads. If leads are ever sold, verify customer phone numbers and credit unanswered leads from day one.

## Giant Finishing (Mahmoud El Anany)

**What it is:** an Arabic management system for Egyptian finishing companies, covering projects, BOQ (المقايسات), finance, HR and payroll, tasks, roles and notifications. Version 1.0.32, frequent updates.

**Business model of its users (likely):** cost plus supervision fee. The sample project shows a supervision fee of 13,650 EGP on 157,540 EGP of expenses, which is 8.7%, matching the profit badge.

**Weaknesses seen in screenshots:**
1. Growth badges show "9999%+" and "2054%-", a division by a near-zero previous value.
2. Similar labels for different totals (company transfers vs project collections).
3. A vague "system health 88%" metric.
4. Very broad scope (HR, payroll, finance, CRM) for one developer.
5. The BOQ stores quantities but does not calculate them from dimensions.

**Applied in BUILD:**
1. Construction phases on saved calculations.
2. Material unit prices and a priced bill of quantities per project, by phase.
3. BOQ export as PDF and as CSV for Excel.

**Not copied:** name, logo, screens and wording. BUILD stays an estimating tool (dimensions to quantities to BOQ) and does not become an ERP.
