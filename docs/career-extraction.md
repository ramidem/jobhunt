# Career extraction

`career` is a database role for turning a saved posting into structured fields. The migration creates the role with no password. Nothing in this repo can sign in as `career`.

## What the role can do

- Read `job_posts` rows whose `extraction_status` is `new` or `needs_update`, including `raw_description`.
- Call `submit_extraction(job_id, payload)`.

It cannot delete rows. It cannot update `raw_description` or the application `status`. It cannot write `extracted` or the pay columns directly. Those columns change only inside `submit_extraction`.

A finished row (`processed` or `needs_info`) disappears from the role's reads.

## Extraction JSON

```json
{
  "skills": {
    "required": ["TypeScript", "PostgreSQL"],
    "niceToHave": ["Supabase"]
  },
  "pay": { "minPhp": 80000, "maxPhp": 150000 },
  "years": 4,
  "seniority": "senior",
  "engagement": "full-time",
  "hiringVia": "direct",
  "needsInfo": false
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `skills.required` | yes | Skills the posting asks for. An empty array is allowed. |
| `skills.niceToHave` | yes | Skills listed as nice to have. |
| `pay.minPhp` / `pay.maxPhp` | no | Monthly pay in PHP. Omit `pay`, or set either side to `null`, when the posting does not list it. `minPhp` cannot be greater than `maxPhp`. |
| `years` | no | Years of experience asked for. `0` to `80`, or `null`. |
| `seniority` | no | The posting's seniority words, such as `senior`. |
| `engagement` | no | How the work is engaged, such as `full-time` or `contract`. |
| `hiringVia` | no | Who is hiring, such as `direct` or `recruiter`. |
| `needsInfo` | no | `true` when the text is not enough to extract. The row is stored as `needs_info` and leaves the queue. Otherwise it is stored as `processed`. |

`submit_extraction` copies `pay`, `years` and `seniority` onto columns (`pay_min_php`, `pay_max_php`, `years`, `seniority`) and stores the whole payload, with empty text turned into `null`, in `extracted`. `engagement` and `hiringVia` live only in `extracted`. The function does not change `raw_description`, `status`, `url` or `user_id`.

## Applying this

After the migration is reviewed, apply it to the hosted project from a machine that is already linked. Do not put that command in CI.

```bash
npx supabase db push --dry-run
npx supabase db push
```

Then create a password for the role. Run this yourself. Do not commit the password or put it in Supabase dashboard settings from this repo.

```sql
alter role career with login password '<long password>';
```

Point the script at that login with a direct database URL (this is not the service role key):

```bash
CAREER_DATABASE_URL='postgresql://career:<password>@db.<project-ref>.supabase.co:5432/postgres' npm run career:sync
CAREER_DATABASE_URL='postgresql://career:<password>@db.<project-ref>.supabase.co:5432/postgres' npm run career:sync -- submit 123 payload.json
```

`pull` prints the queue. `submit` checks the JSON, then calls `submit_extraction`.
