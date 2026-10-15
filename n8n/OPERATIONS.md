# Automatic article batch

The running batch is `Blog - 소소한 기준 [Util] - Batch Publication`
(`thOXjRSewyYeWfRS`). It targets the 30 additional article rows, IDs 4–33.
The two older published articles are outside this count.

The batch reads the actual table state after every stage. It calls the existing
generation, image receipt, approval and publication workflows through their
`Batch Input` triggers. It checks the public publication manifest before marking
an article published. No hourly schedules were activated for this batch.

Writing failures with a confirmed response and reconciled charge can receive
one automatic correction. The correction includes the previous draft, measured
length and concrete review issues. A topic receives at most two tracked writing
attempts. Unknown paid outcomes retain their reservation and are never resubmitted.
The monthly generation and review budget remains USD 7 including reservations.

The approval helper performs a separate source and image review through the
existing OpenAI credential. Passing revisions are explicitly labeled as automated
review, then snapshotted for publication. Failed revisions cannot be published.
The system does not claim that an automated review is a physical product test or
a human editorial review.

`generated/current-workflows.json` records the current saved workflow graphs;
`generated/batch-publication.ts` is the SDK definition of the batch coordinator.
The older `build-workflows.mjs` and its original generated helpers are bootstrap
artifacts and should not overwrite these live graphs without porting the later
batch, pricing and approval changes. Runtime code and prompts for the later
stages are stored in `runtime/` and `prompts/`.

The batch ends when all 30 rows are confirmed published, the monthly budget is
reached, no safely executable rows remain, or the polling cap is reached. Inspect
its final `Batch Result`; starting a run is not evidence of 30 publications.
Do not start a second coordinator while the first is running.
