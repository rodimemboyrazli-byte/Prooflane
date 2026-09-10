# Prooflane Backend

## Lokal starten

```bash
npm run dev
```

Beim ersten schreibenden API-Aufruf wird `data/prooflane.db` erzeugt und alle SQL-Migrationen in `db/migrations/` angewendet. Der Pfad ist über `DATABASE_PATH` konfigurierbar; siehe `.env.example`.

## Demo-Zugang

Lokal wird beim ersten Login automatisch ein gefüllter Demo-Mandant angelegt:

```text
E-Mail: demo@prooflane.test
Passwort: Prooflane!2026
```

Er enthält zwei Nachweise, eine Maßnahme und eine Kundenfreigabe. In Production ist der Zugang deaktiviert. Nur für einen bewusst temporären Test `ALLOW_DEMO_ACCOUNT=true` setzen.

## Datenmodell

- `organizations`, `users`, `memberships`: Mandanten und Rollen `owner`, `editor`, `viewer`.
- `sessions`: serverseitig gespeicherte, gehashte Session-Tokens.
- `evidence`, `tasks`, `customer_access`: Kernprozess.
- `customer_evidence_grants`: explizite Evidenzfreigaben je Kunde.
- `audit_log`: unveränderbare Prozessspur jeder serverseitigen Änderung.

## API

| Bereich | Routen |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me` |
| Arbeitsstand | `GET /api/workspace` |
| Nachweise | `GET`, `POST /api/evidence`; `PATCH /api/evidence/:id` |
| Maßnahmen | `GET`, `POST /api/tasks`; `PATCH /api/tasks/:id` |
| Kunden | `GET`, `POST /api/customers`; `PATCH /api/customers/:id/share` |
| Evidenzfreigaben | `PATCH /api/customers/:id/evidence` mit `{ "evidenceIds": ["…"] }` |
| Auditspur | `GET /api/audit?limit=50` |

Alle Geschäfts-Routen sind sessiongeschützt und auf `organization_id` gefiltert. Änderungen brauchen `owner` oder `editor`.

## Betrieb

Diese Grundlage nutzt SQLite mit persistentem Node-Dateisystem und ist für lokale Entwicklung oder Node-Hosting mit persistentem Volume funktionsfähig. Für serverlose Cloud-Deployments SQLite-Adapter durch D1/Postgres ersetzen; Dokumente separat in R2/Blob speichern. SQL-Migrationen bleiben dafür Grundlage.
