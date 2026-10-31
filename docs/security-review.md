# BinaaHub security review

Date: 31 October 2026. Scope: the whole repository, including its full git history, at Phase 1 (five calculators and saved projects).

## How the app is built, and why most web risks do not apply

BinaaHub Phase 1 runs entirely on the phone. It has no server, no login, no database server, no admin pages, no payments, no file uploads, no cookies, no API keys and no network calls (verified: the source contains no `fetch`, `XMLHttpRequest`, `axios` or `WebSocket`). Saved projects stay in the phone's local storage and leave it only when the user taps Share.

Most items on a typical web security checklist therefore have nothing to protect. Adding a login or server only to tick those items would create the attack surface they defend against. They become relevant in Phase 2 (accounts, marketplace, payments), and the plan at the end lists what that phase must include.

## Findings and fixes

| # | Check | Result | Action |
| - | ----- | ------ | ------ |
| 1 | Secrets in the full git history (AWS, OpenAI style, Stripe, GitHub, Slack, Google keys, private keys, hard coded passwords) | None found | None needed |
| 2 | Sensitive files tracked in git (`.env`, `.pem`, `.key`, keystores, Firebase config) | None found | `.gitignore` now also blocks `.env`, `.env.*` and `*.pem` so they cannot be committed later |
| 3 | Environment variables | None used | None needed |
| 4 | Debug code (`console.*`, `debugger`) | None in app code | None needed. Expo strips development tools from release builds |
| 5 | XSS, injection, `eval` | No HTML rendering, `innerHTML`, `eval` or `new Function`. React Native shows all text as plain text | None needed |
| 6 | Input validation | Number boxes accept digits and one decimal mark only (`parseNumber`, tested). Formulas reject zero, negative and out of range values (tested) | Project names are now limited to 80 characters |
| 7 | **Damaged saved data** | **Bug (data loss):** if saved projects were ever corrupted, the app replaced them with an empty list | **Fixed:** damaged data is copied to a backup key and never overwritten. Malformed entries are skipped. If storage cannot be read, saving stays off. Tested, including in a browser with deliberately corrupted data |
| 8 | **Damaged settings** | **Bug (crash):** an invalid stored language value crashed the app at start | **Fixed:** only known language and theme values are accepted. Tested |
| 9 | Vulnerable dependencies | 15 issues before (2 high, 12 moderate, 1 low) | **Both high issues fixed** (`zod`, `@expo/cli`) with non-breaking updates. 13 moderate remain in Expo's developer tools (`glob`, `minimatch`). They run on the developer's computer, are not shipped in the app, and npm's only fix is downgrading Expo from SDK 58 to SDK 51, which is not acceptable. Re-check with each Expo update |
| 10 | Unused packages | 6 starter template packages never imported | **Removed:** `@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-web-browser` |
| 11 | Deep links (`binaahub://`) | Links can open a screen but cannot change data. Deleting always asks for confirmation | None needed |
| 12 | Data at rest | Saved projects are stored unencrypted on the phone. They contain quantities, not personal or financial data | Accepted for Phase 1. Encrypt if personal data is ever stored |

## Checklist items that do not apply in Phase 1

| Item | Why not |
| ---- | ------- |
| Authentication, password hashing, password reset expiry | No accounts |
| Admin route lock down | No admin pages |
| Database security, parameterized queries | No database server; local storage only |
| HTTPS, CORS, security headers, CSRF, session cookies | No server and no network requests |
| Rate limiting | No server endpoints to flood |
| Server side form validation | No server; validation runs in the app and is tested |
| File upload limits | No uploads |
| Price and payment verification | No payments |
| Logging and monitoring suspicious activity | No server to log on; nothing leaves the phone |
| Revoking compromised keys | No keys exist (finding 1) |

## How this was tested

1. 96 unit tests pass, including new tests for damaged projects, damaged settings and rejected input.
2. Typecheck passes.
3. Browser test with deliberately corrupted storage: original data backed up, app opened normally, no errors.
4. End to end browser test, English and Arabic: save, add to project, reload, delete with confirmation.
5. Not run: `expo lint` and `expo-doctor`, which need Expo's servers. Those are blocked from the build environment.

## Required before Phase 2 (accounts, marketplace, payments)

1. Use a managed authentication provider rather than custom password code.
2. Keep every secret on the server. Mobile apps can be unpacked, so no secret key belongs in app code or `EXPO_PUBLIC_*` variables.
3. Verify prices and payment amounts on the server; never trust amounts sent by the app.
4. Use database access rules or parameterized queries, rate limiting, server side validation and request logging from day one.
5. Run a new security review before release.
