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
attempts. A confirmed short draft then uses at most two additions passes: only
missing explanations are generated and inserted into existing sections; the full
article is preserved. Unknown paid outcomes retain their reservation and are never resubmitted.
Factual review failures use at most two paragraph-patch passes, with actual paragraph
indices and current review feedback. Image-only errors never trigger a text rewrite.
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

## Photo selection

`Blog - 소소한 기준 [Util] - Free Photos` (`nEOFgYflJsZYfbpc`) runs before fal.
It searches Openverse for Flickr/Wikimedia photographs with CC0 or CC BY licenses,
filters actual source and license URLs, and excludes small or already-used images.
The existing OpenAI credential selects only relevant, distinct photographs from the
actual candidates (at most four per search, with concise article context to bound
vision costs). Selection may return zero; only the remaining slots use fal.
The search needs no new key. The bounded visual selection uses the existing API
budget and preserves unknown outcomes rather than repeating a paid request.

`config/photo-sources.json` also lists Pexels, Pixabay and Unsplash as candidates.
They are not connected: Pexels needs a free API key, Pixabay needs its automation
terms checked, and Unsplash needs its own hotlink/download-tracking integration.
Never treat every photo on these sites as automatically reusable.

Stock images retain author, original photo page, license URL, search query and check
time. Local WebP copies display credit and license links below the image. Generated
illustrations keep their internal provenance but use natural explanatory captions.
For this content-publishing use of external AI tools, see cases 4 and 10 in the
[official AI Act support-desk casebook](https://www.sw.or.kr/site/sw/ex/board/View.do?bcIdx=65415&cbIdx=390&searchExt1=).

Confirmed image-only review failures retain the existing text and accepted images.
Only rejected slots are replaced; the revision increments and its prior approval is
cleared before a new independent review. A rejected visual review can provide a new
image prompt for its exact position; accepted image order and replacement prompts
stay aligned. This does not waive article-quality checks.
