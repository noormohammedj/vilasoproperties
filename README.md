# Vilaso Properties — website prototypes

Prototypes for [Vilaso Properties](https://www.instagram.com/vilaso_properties/), Dindigul, built by Noor Mohammed.

- `sample1/` — cinematic dark theme: rolling property tiles (drag to spin, tap to open), property detail with highlights, why invest, price story (10 yrs back, 10 yrs projected), comparison with nearby areas, amenities, site-visit contact.

Static HTML/CSS/JS. Hosted on GitHub Pages; the site opens at https://vilasoproperties.com/ and at /sample1/.
The home page `index.html` is generated from `sample1/index.html` (asset paths prefixed): after editing `sample1/index.html`, run `sh make-root.sh`.

## Edit content
Everything shown comes from `sample1/data.js`: projects, prices, area rates, amenities, phone numbers.
Keep JS files ASCII-only (write ₹ as `₹`).

**Prices, past rates and projections are illustrative** until Vilaso shares real figures. Projects with `sample: true` are made-up examples.

## Run locally
    python3 -m http.server 8080   # then open http://localhost:8080/sample1/
