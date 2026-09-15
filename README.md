# ChainGuard

A digital evidence integrity and chain-of-custody platform. ChainGuard registers digital
evidence, records a cryptographic fingerprint and a custody history, and verifies whether a
file still matches the evidence that was originally collected.

Built for ICSC 2026, Universities Category, Track H: "Proving Digital Evidence Has Not Been
Changed."

---

## 1. Problem

Digital evidence such as images, videos, documents, audio recordings, exported files,
screenshots, and other digital records is routinely copied, modified, re-encoded, transferred,
and otherwise changed. A file can be edited, compressed, converted, stripped of metadata, or
renamed without any visible sign of the change.

Simply possessing a file does not establish that it is the same file that was originally
collected. Two files can look identical to a human and still be completely different digital
artifacts. Without a way to bind a file to a recorded fingerprint and to document how the file
was handled, there is no reliable answer to the question: "Is this the same evidence, unchanged?"

Preserving integrity and documenting handling matters because the answer to that question can
affect an investigation, a legal proceeding, a newsroom decision, or an audit. The goal of this
project is to make that answer verifiable and explainable.

This project does not assume that every modified file is malicious, and it does not assume that
a file without metadata is fake. Changes can be accidental, routine, or legitimate.

## 2. Solution

ChainGuard implements the following lifecycle:

1. **Evidence intake.** An investigator uploads a file and identifies the actor who is
   registering it.
2. **Cryptographic hashing.** The system computes a SHA-256 hash of the file. The hash is a
   deterministic fingerprint of the file's bytes.
3. **Secure storage.** The file is stored in object storage (Cloudflare R2 on the backend).
4. **Custody recording.** The first custody entry (INTAKE) is recorded with the actor and the
   resulting hash.
5. **Verification.** The stored file can be re-downloaded, re-hashed, and compared against the
   recorded hash. Every verification attempt is itself recorded as a custody event.
6. **Metadata inspection.** EXIF and origin metadata are surfaced as observations, together
   with heuristic flags for suspicious absences.
7. **Integrity report.** A plain-language report explains the integrity state and custody
   history to nontechnical readers.

The possible outcomes of verification are:

- **Integrity Verified.** The current file matches the registered hash.
- **Integrity Check Failed.** The current file does not match the registered hash.
- **Metadata observation.** Metadata is missing or unusual, which does not by itself prove
  tampering.
- **Pending or unavailable.** The system does not yet have enough information to make an
  integrity comparison.

## 3. Important limitations

A cryptographic hash proves that two byte sequences match or do not match. It does not prove
that the underlying event depicted in the media actually happened. It does not prove that the
original evidence was truthful. It does not independently prove who created the evidence. It
does not independently establish legal admissibility. It does not automatically detect
deepfakes. It does not reconstruct an event. It does not replace qualified forensic
examination. A failed comparison reveals only that two files differ; it does not say what
changed, where it changed, or how. Determining the nature of a change requires a specialized
forensic examination of both files.

These limitations matter because integrity is only one property of evidence. An unchanged file
can still depict something that did not happen, and a changed file can still be an honest
record produced through legitimate processing. ChainGuard is honest about the difference
between "this file has not changed" and "this content is true."

## 4. Key features

- Evidence upload with actor identification
- SHA-256 fingerprinting at intake
- Evidence listing with custody context
- Evidence detail view
- Integrity verification with a recorded verification step
- Chain-of-custody timeline
- Metadata extraction and observation flags
- Plain-language evidence reports
- Cloud object storage for registered files
- Tamper detection through hash comparison
- Local "compare a suspect file" tool that hashes a file in the browser and compares it to the
  registered fingerprint without uploading it

## 5. How it works

```
User
  ↓
Frontend (SvelteKit)
  ↓
Evidence API (deployed backend)
  ↓
File Storage (Cloudflare R2)
  ↓
Hash Calculation (SHA-256)
  ↓
Evidence Record
  ↓
Custody Log
  ↓
Verification
  ↓
Integrity Report
```

- The frontend collects the file and the actor and submits them to the evidence API.
- The API stores the file, computes its SHA-256 hash, creates the genesis record, and records
  the first custody entry.
- The frontend displays the evidence identity, the fingerprint, and the custody record.
- A verification request makes the API re-hash the stored file and compare it with the
  recorded hash. The attempt is logged in the custody trail.
- Metadata and report endpoints return observations and a readable summary, which the frontend
  renders with appropriate caveats.

## 6. Cryptographic integrity

SHA-256 is a cryptographic hash function. It takes a file as input and produces a fixed-length
digest (64 hexadecimal characters). The function is deterministic: the same input always
produces the same digest. A tiny change to the input produces a completely different digest.

```
Original file:
SHA-256 = HASH_A

Modified file:
SHA-256 = HASH_B

HASH_A != HASH_B
```

Verification works by comparing the digest recorded when the evidence was registered against
the digest computed from the current file:

- Equal digests: the current file has the same bytes as the registered file.
- Different digests: the current file has different bytes.

A hash does not make evidence immutable. Integrity depends on securely preserving the
reference hash and on protecting the evidence lifecycle around it, which is why custody
recording and controlled storage matter.

## 7. Chain of custody

Chain of custody is the documented, chronological record of how evidence was handled. ChainGuard
records actions associated with each evidence item. Each custody entry can include:

- evidence ID
- actor
- action
- resulting hash where applicable
- timestamp
- notes
- an offline marker where supported

The current backend records an INTAKE entry at registration and a VERIFY entry for every
verification attempt. The remote `POST /custody/sync` endpoint for offline entries currently
has a backend issue (see `BACKEND_REQUESTS.md`), so offline sync is not usable in this
prototype.

Chronological documentation matters because it makes handling auditable. This prototype does
not claim to provide full legal chain-of-custody compliance.

## 8. Metadata

The metadata endpoint returns EXIF and origin metadata found in the file at intake. This can
include camera make and model, capture timestamp, GPS coordinates, software, and flags for
missing or unusual data.

Metadata is treated as an observation, not as a definitive authenticity verdict. Metadata can
be stripped, rewritten, lost during conversion, or absent for legitimate reasons. The interface
says so explicitly and never claims that missing metadata proves manipulation.

## 9. Reporting

The report endpoint returns a plain-language summary of an evidence item. It communicates:

- evidence identity
- integrity state
- recorded hash where applicable
- verification result where applicable
- custody history
- relevant metadata observations
- limitations

The report is intended to make technical results understandable to nontechnical stakeholders
such as investigators, legal reviewers, journalists, and decision makers.

## 10. API

The API is documented in OpenAPI form at the deployed backend:
`https://chainguard.up.railway.app/api-docs`. The following endpoints are used by this
frontend. Field names below were verified against the live deployment.

### POST /evidence

- Purpose: register new evidence.
- Request: `multipart/form-data` with `file` (binary) and `actor` (string).
- Response: an evidence record (including `_id`, `fileName`, `mimeType`, `sizeBytes`,
  `originalHash`, `createdAt`) and a metadata record.
- Errors: `400` when the file or actor is missing.

### GET /evidence

- Purpose: list registered evidence.
- Response: an object with an `evidence` array.

### GET /evidence/{id}

- Purpose: get one evidence item plus its current recorded hash.
- Response: `{ evidence: {...}, currentHash: string }`.
- Errors: the live backend returns `400` for an unknown id (the OpenAPI spec lists `404`; this
  discrepancy is noted in `BACKEND_REQUESTS.md`).

### POST /evidence/{id}/verify

- Purpose: re-hash the stored file and compare it with the recorded chain.
- Request: `{ "actor": "string" }`.
- Response: `{ "status": "UNALTERED", "recordedHash": string, "computedHash": string, "message": string }`.
- The attempt is recorded as a custody event.

### GET /evidence/{id}/custody

- Purpose: get the full custody trail.
- Response: an object with a `custodyTrail` array of custody entries.

### GET /evidence/{id}/metadata

- Purpose: get extracted EXIF/origin metadata and heuristic flags.
- Response: a metadata record with `make`, `cameraModel`, `software`, `dateTimeOriginal`,
  `gpsLatitude`, `gpsLongitude`, `c2paPresent`, and `flags`.

### GET /evidence/{id}/report

- Purpose: get a plain-language report.
- Response: `fileName`, `collectedAt`, `summary`, `lastVerifiedAt`, `metadataSummary`,
  `custodyEvents`.

### POST /custody/sync

- Purpose: sync offline custody entries.
- Request: `{ "entries": [ { "evidenceId", "actor", "action", "resultingHash", "occurredAt", "notes" } ] }`.
- Current status: returns `400` for an empty `entries` array and `502 Application failed to
respond` for any non-empty array. This is a backend bug; see `BACKEND_REQUESTS.md`.

## 11. Example workflow

An investigator receives a video that may later become relevant to an investigation.

1. The investigator registers the file and identifies themselves as the actor.
2. The system computes the SHA-256 hash and stores the file.
3. An INTAKE custody entry is created with the resulting hash.
4. Later, the investigator verifies the evidence.
5. The current hash matches the recorded hash. The system reports Integrity Verified.
6. A modified copy of the file produces a different hash.
7. Verifying against the registered evidence fails. The verification attempt is recorded.
8. The report reflects the failed verification.

In this example the system detected a change in the digital artifact. It did not prove
malicious manipulation, and it did not judge the truth of the content.

## 12. Testing

The project uses Vitest for unit tests and direct API probing for contract verification.

- Verified: SHA-256 helper produces the well-known digest for `"abc"` and a different digest
  for changed input.
- Verified: formatting helpers (bytes, hashes, action labels, integrity wording).
- Verified against the live API: intake, listing, detail, verify (UNALTERED), custody,
  metadata, and report responses.
- Verified error handling: missing actor returns 400, unknown id returns 400, empty custody
  sync returns 400.
- Known failing case: non-empty `POST /custody/sync` returns 502 (backend).

A full browser-based end-to-end suite is not yet automated. The recommended manual scenarios
(unchanged file, minimally modified file, renamed file, metadata stripped, screenshot or
re-encoded copy, corrupted file) are documented in `TEST_RESULTS.md`. The application currently
supports demonstrating renamed files, modified files, and re-encoded copies through the local
"Compare a suspect file" tool, because those checks run in the browser with real cryptography
and do not require backend changes.

## 13. Demonstration

Recommended live demonstration:

1. Register original evidence.
2. Show the SHA-256 fingerprint.
3. Show the custody entry.
4. Verify the original.
5. Show the successful verification.
6. Create a modified copy.
7. Compare the modified copy against the registered fingerprint.
8. Show the hash mismatch.
9. Show the failed comparison.
10. Show the custody history.
11. Show the generated report.

This demonstrates the core value: integrity is checked against a recorded fingerprint, and the
handling of the evidence is documented. A mismatch is reported as a changed digital artifact,
never as a claim that the content is fake.

## 14. Architecture

The frontend is a SvelteKit application that talks to a separate evidence API. There is no
local database layer; the remote API is the only source of evidence data.

```
+-------------------------------------------+
| Browser (SvelteKit + Tailwind)            |
|  Landing, Evidence list, Intake, Detail,  |
|  Verify, Custody timeline, Metadata,      |
|  Report, Compare-a-file tool              |
+-------------------+-----------------------+
                    |
                    | HTTPS (CORS enabled)
                    v
+-------------------------------------------+
| Evidence API (deployed, MongoDB backend)  |
|  /evidence, /verify, /custody, /metadata, |
|  /report, /custody/sync                   |
+-------------------------------------------+
                    |
                    v
+-------------------------------------------+
| Cloudflare R2 (stored evidence files)     |
+-------------------------------------------+
```

## 15. Technology stack

- Frontend framework: SvelteKit 2 with Svelte 5 (runes)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Build tool: Vite
- UI icons: HugeIcons (Svelte package, free Stroke Rounded set)
- Testing: Vitest
- Formatter: Prettier with Svelte and Tailwind plugins
- Backend: separate deployed Express-style API (MongoDB + Cloudflare R2), documented in OpenAPI

## 16. Deployment

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Local development

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Production build

```sh
npm run build
npm run preview
```

The project uses `@sveltejs/adapter-auto` with `@sveltejs/adapter-vercel` installed, so it
deploys to Vercel automatically. Local `npm run build` prints a "could not detect a supported
production environment" notice because no platform is detected locally; this is expected and
harmless. On Vercel, the platform is detected and the Vercel adapter is used.

### Deploying to Vercel

1. Push this repository to GitHub.
2. Go to https://vercel.com/new and import the `ChainGuard` repository.
3. Vercel detects SvelteKit automatically. Set the build command to `npm run build` and output
   to `build` (the defaults are usually correct).
4. Add the environment variable `PUBLIC_CHAINGUARD_API_BASE_URL` set to
   `https://chainguard.up.railway.app` (the value in `.env` is already the default, but set it
   explicitly in Vercel).
5. Deploy. The frontend talks to the deployed evidence API via HTTPS with CORS enabled.

Note for Windows developers: running `npm run build` with `@sveltejs/adapter-vercel`
configured directly can fail with an `EPERM` symlink error unless Windows Developer Mode is
enabled. Keeping `adapter-auto` avoids that: local builds use no platform adapter, and Vercel
uses the installed Vercel adapter.

The deployed evidence API is available at `https://chainguard.up.railway.app` with interactive
docs at `https://chainguard.up.railway.app/api-docs`.

### Environment variables

Copy `.env.example` to `.env` and adjust values. `.env` is gitignored and must never be
committed. See the environment variables section below.

## 17. Environment variables

| Variable                         | Purpose                                                                                        | Required       |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| `PUBLIC_CHAINGUARD_API_BASE_URL` | Base URL of the evidence API. Safe to expose in the browser. Defaults to the deployed backend. | No             |
| `ORIGIN`                         | Origin used by SvelteKit in production environments.                                           | For production |

Never put backend secrets into `PUBLIC_` variables. The frontend only knows the public API base
URL.

## 18. Security and privacy

Evidence files may contain sensitive information. The current prototype has no authentication
or authorization, and the backend currently answers unauthenticated requests. A production
deployment would require:

- authentication and authorization
- access control for evidence records
- protected evidence storage
- protected audit logs
- secure transport (HTTPS) in all environments
- secrets kept out of the repository

This prototype does not claim enterprise-grade security. It is a technical demonstration of
the integrity and custody workflow.

## 19. Forensic and legal disclaimer

This prototype is a technical demonstration, not legal advice. Using this application does not
automatically make evidence admissible in court. Real forensic workflows require organizational
procedures, trained personnel, documented acquisition methods, appropriate storage, access
controls, and jurisdiction-specific legal requirements.

## 20. Real-world alignment

The workflow aligns with established digital evidence practices:

- acquisition hashing (hashing evidence early in its lifecycle)
- verification hashing (re-hashing to check for change)
- fixity checking (using hashes to confirm information has not changed)
- chain of custody (documenting who handled evidence and when)
- contemporaneous documentation (recording events as they happen)
- evidence preservation (storing evidence under controlled conditions)

The project claims alignment with these concepts, not formal certification or compliance.

## 21. Future work

Realistic future work, clearly not yet implemented:

- stronger identity and access control
- cryptographically signed custody events
- immutable audit storage
- stronger evidence packaging
- C2PA provenance integration
- multiple independent hash algorithms
- forensic acquisition integrations
- secure evidence export
- digital signatures
- hardware-backed signing
- stronger audit verification
- case management
- organization-level access controls
- change-location and difference analysis for media (deliberately out of scope for integrity
  verification; this belongs to specialized forensic examination)

## 22. C2PA / provenance

C2PA is not implemented. Provenance standards such as C2PA can provide verifiable information
about content creation and transformations. Provenance is a complement to integrity checking,
not a universal truth detector. The metadata endpoint currently reports whether C2PA data is
present (`c2paPresent`), and future work could add real C2PA validation.

## 23. Project status

- Implemented: evidence intake, SHA-256 fingerprinting, evidence listing and detail, integrity
  verification, custody timeline, metadata panel, plain-language report, local compare tool.
- Tested: unit tests for hashing and formatting helpers; live API contract checks for intake,
  list, detail, verify, custody, metadata, report, and error paths.
- Partially implemented: offline custody synchronization (backend sync endpoint currently
  broken), browser end-to-end automation.
- Planned: automated end-to-end browser tests, verified mismatch through the server verify
  endpoint once the backend exposes a safe way to demonstrate it.

## 24. Hackathon context

Built for ICSC 2026, Universities Category, Track H: "Proving Digital Evidence Has Not Been
Changed." The project is a working prototype intended to demonstrate an honest integrity and
custody workflow. No additional official requirements are claimed.

## 25. Team

This project is being built by a two-person team. Team member names and roles are not recorded
in this repository and are intentionally not stated here.

## 26. License

This repository currently has no explicit license.
