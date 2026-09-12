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
- `access_requests`: öffentliche Anfragen; zunächst immer `pending`.
- `sessions`: serverseitig gespeicherte, gehashte Session-Tokens.
- `evidence`, `tasks`, `customer_access`: Kernprozess.
- `customer_evidence_grants`: explizite Evidenzfreigaben je Kunde.
- `evidence_documents`: PDF-Anhänge zu Nachweisen, organisationsgetrennt gespeichert.
- `audit_log`: unveränderbare Prozessspur jeder serverseitigen Änderung.

## API

| Bereich | Routen |
| --- | --- |
| Auth | `POST /api/auth/login`, `/logout`; `GET /api/auth/me` |
| Zugang anfragen | `POST /api/access-requests` |
| Arbeitsstand | `GET /api/workspace` |
| Nachweise | `GET`, `POST /api/evidence`; `PATCH /api/evidence/:id` |
| PDFs | `GET`, `POST /api/evidence/:id/documents`; `GET /api/documents/:id`; `GET /api/evidence/:id/report` |
| Maßnahmen | `GET`, `POST /api/tasks`; `PATCH /api/tasks/:id` |
| Kunden | `GET`, `POST /api/customers`; `PATCH /api/customers/:id/share` |
| Evidenzfreigaben | `PATCH /api/customers/:id/evidence` mit `{ "evidenceIds": ["…"] }` |
| Auditspur | `GET /api/audit?limit=50` |

Alle Geschäfts-Routen sind sessiongeschützt und auf `organization_id` gefiltert. Änderungen brauchen `owner` oder `editor`.

Öffentliche Registrierung ist gesperrt. `POST /api/auth/register` antwortet mit `403`. Zugangsanfragen landen als `pending` in `access_requests`; nach Prüfung legt das interne Team den Account an.

## Betrieb

Diese Grundlage nutzt SQLite mit persistentem Node-Dateisystem und ist für lokale Entwicklung oder Node-Hosting mit persistentem Volume funktionsfähig. Für serverlose Cloud-Deployments SQLite-Adapter durch D1/Postgres ersetzen; Dokumente separat in R2/Blob speichern. SQL-Migrationen bleiben dafür Grundlage.

PDF-Uploads akzeptieren ausschließlich PDFs bis 15 MB. Uploads und Downloads sind sessiongeschützt und zusätzlich über `organization_id` getrennt. Der Bericht-Endpunkt erzeugt einen PDF-Nachweisbericht direkt aus Evidenz, Anhängen und verknüpften Maßnahmen.
