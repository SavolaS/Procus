# Procus Design Spec — Salesforce Lightning (SLDS) Look & Feel

## Current UI direction — 19 September 2026

This document is a Salesforce Lightning reference, not a locked visual contract. The founder explicitly permits redesign. The current overview uses a compact object header, one neutral metrics strip, a segmented case summary, a priority table, and quieter agent activity. Colour identifies state or action; it does not decorate every metric. Large warning banners and chevrons are not required for portfolio summaries.

Do not restore visible “Sample data” or prototype labels. Data provenance remains documented in README.md and the source. Keep useful calculation assumptions and the distinction between projected, agreed and realised savings in the product.

The historical measurements below remain reference material. Their prescriptive wording does not override the current design direction or AGENTS.md. This revision follows Salesforce’s [clarity, efficiency and consistency principles](https://developer.salesforce.com/docs/platform/salesforce-pages-developers-guide/guide/vf-dev-best-practices-slds-intro.html), without claiming to implement the SLDS component library.

## How to use this file

This was the initial visual reference for Procus; the current direction above takes precedence. There is no build step, no framework, no npm
package — everything here is plain CSS you paste into one stylesheet.

1. Copy the `:root { … }` block in **§2** verbatim into the top of your stylesheet. Do not
   edit the values. They are the real, shipped Salesforce token values (provenance in §1).
2. Never write a raw hex, rem or shadow anywhere else in the codebase. Always reference a
   `--slds-*` variable. If you need a value that does not exist, add it to `:root` first.
3. Build components from the per-component sections (**§4–§14**). Each gives the anatomy, the
   measured visual rules, and a copy-pasteable CSS snippet. Class names deliberately mirror
   SLDS (`slds-table`, `slds-badge`, …) so this file doubles as a lookup table when you read
   real Salesforce markup.
4. **§15** is the rule list — read it once, then use it as a review checklist.

**Every number and hex in this file was read out of the shipped Salesforce source**, not from
memory. Where I could not verify something, it is marked `[UNVERIFIED]` and says so plainly.

---

## 1. Provenance — where these values come from

Salesforce does not publish the token table as fetchable HTML (lightningdesignsystem.com is a
client-rendered SPA and returns an empty document to a fetcher). So values here were extracted
from the **published Salesforce npm artifacts**, which are the same files the browser loads:

| Source | Version | What was taken |
|---|---|---|
| `@salesforce-ux/design-system` → `assets/styles/salesforce-lightning-design-system.css` | **2.264.1** (release "Summer '26") | The `:root` token block + every component measurement in §4–§14 |
| `@salesforce-ux/design-tokens` → `dist/themes/lightning-blue/*.css` | **4.1.0** | `--slds-g-*` global hooks, `--slds-r-*` reference ramps, spacing/sizing/shadow/duration scales |
| `@salesforce-ux/design-tokens` → `dist/themes/cosmos/*.css` | **4.1.0** | The SLDS 2 "Cosmos" ramps, for the legacy/current comparison in §2.6 |
| `@salesforce-ux/design-system-primitive-tokens` → `design-tokens/**` | **0.3.7** | The SLDS 1 named ramps (`x-small`/`small`/`medium`/…), font-size aliases, touch targets |

### Two themes exist — we use **Lightning Blue**

* **Lightning Blue** is the theme that makes an app *look like Salesforce Lightning Experience*.
  Brand blue is **`#0176d3`**. This is what Procus uses.
* **Cosmos** is the new SLDS 2 default theme. Brand blue is **`#066afe`**, success is teal
  (`#0b827c`), error is magenta (`#e3066a`). It reads as a *different product*. §2.6 lists it
  for reference only.

### Current vs legacy blues — settled

| Hex | Status | Evidence |
|---|---|---|
| **`#0176d3`** | **Current.** Brand-50, the Salesforce blue. | 254 occurrences in the 2.264.1 stylesheet |
| `#1589ee` | **Legacy leftover.** Still hard-coded in 11 places (e.g. the vertical-nav hover wash `rgba(21,137,238,.1)`). Do not use as a brand colour. | 11 occurrences |
| `#0070d2` | **Dead.** The old SLDS 1 brand blue. | **0 occurrences** — fully removed |

### One trap you must know about

The shipped stylesheet is full of declarations like:

```css
background-color: var(--slds-g-color-error-base-40, rgb(234, 0, 30));
```

**The inline fallback is stale.** `--slds-g-color-error-base-40` actually resolves to `#ba0517`;
`rgb(234,0,30)` is `#ea001e`, which is error-**50**. Several fallbacks drifted this way (table
borders, tab rules, neutral button borders). Everything in this document uses the **resolved
`:root` value**, which is what a browser actually paints. Where the drift is visually
significant I call it out in the component section.

---

## 2. The `:root` block — copy this verbatim

```css
:root {
  /* ===================================================================
     PROCUS — SLDS "Lightning Blue" tokens
     Extracted from @salesforce-ux/design-system 2.264.1 (Summer '26)
     and @salesforce-ux/design-tokens 4.1.0.
     =================================================================== */

  /* --- 2.1 Neutral ramp ------------------------------------------- */
  --slds-neutral-0:    #000000;
  --slds-neutral-10:   #181818;  /* default body text */
  --slds-neutral-15:   #242424;
  --slds-neutral-20:   #2e2e2e;
  --slds-neutral-30:   #444444;  /* secondary text, table header text */
  --slds-neutral-40:   #5c5c5c;
  --slds-neutral-50:   #747474;  /* meta text, muted icons, toast bg */
  --slds-neutral-60:   #939393;
  --slds-neutral-65:   #a0a0a0;
  --slds-neutral-70:   #aeaeae;
  --slds-neutral-80:   #c9c9c9;  /* disabled, structural borders */
  --slds-neutral-90:   #e5e5e5;
  --slds-neutral-95:   #f3f3f3;  /* shade surface, table header, row hover */
  --slds-neutral-100:  #ffffff;

  /* --- 2.2 Brand ramp (Salesforce blue) --------------------------- */
  --slds-brand-10:     #001639;  /* inverse surface */
  --slds-brand-15:     #03234d;
  --slds-brand-20:     #032d60;  /* alt-inverse surface, link :active */
  --slds-brand-30:     #014486;  /* button hover/active, link hover/focus */
  --slds-brand-40:     #0b5cab;  /* focus ring, default link colour */
  --slds-brand-50:     #0176d3;  /* THE brand colour */
  --slds-brand-60:     #1b96ff;  /* active tab underline, nav active bar */
  --slds-brand-65:     #57a3fd;
  --slds-brand-70:     #78b0fd;
  --slds-brand-80:     #aacbff;
  --slds-brand-90:     #d8e6fe;
  --slds-brand-95:     #eef4ff;  /* tint background */

  /* --- 2.3 Semantic ramps ----------------------------------------- */
  /* Success (green) */
  --slds-success-10:   #071b12;
  --slds-success-20:   #1c3326;
  --slds-success-30:   #194e31;
  --slds-success-40:   #396547;
  --slds-success-50:   #2e844a;  /* theme_success background */
  --slds-success-60:   #3ba755;  /* path "complete" segment */
  --slds-success-70:   #45c65a;  /* success button background */
  --slds-success-80:   #91db8b;
  --slds-success-90:   #cdefc4;  /* success tint background */
  /* Warning (amber) */
  --slds-warning-10:   #201600;
  --slds-warning-20:   #3e2b02;
  --slds-warning-30:   #5f3e02;
  --slds-warning-40:   #825101;
  --slds-warning-50:   #a96404;
  --slds-warning-60:   #dd7a01;  /* theme_warning background */
  --slds-warning-70:   #fe9339;  /* the classic SLDS orange */
  --slds-warning-80:   #ffba90;
  --slds-warning-90:   #fedfd0;  /* warning tint background */
  /* Error (red) */
  --slds-error-10:     #300c01;
  --slds-error-20:     #640103;
  --slds-error-30:     #8e030f;  /* destructive hover, destructive text */
  --slds-error-40:     #ba0517;  /* theme_error bg, destructive button */
  --slds-error-50:     #ea001e;
  --slds-error-60:     #fe5c4c;
  --slds-error-70:     #fe8f7d;
  --slds-error-80:     #feb8ab;
  --slds-error-90:     #feded8;  /* error tint background */

  /* --- 2.4 Semantic aliases — USE THESE, not the ramps ------------- */
  /* Surfaces */
  --slds-surface-1:            var(--slds-neutral-100); /* cards, tables, modals */
  --slds-surface-2:            var(--slds-neutral-95);  /* app shell, page header */
  --slds-surface-3:            var(--slds-neutral-90);
  --slds-surface-inverse:      var(--slds-brand-20);
  --slds-surface-inverse-dark: var(--slds-brand-10);

  /* Text on surfaces */
  --slds-text-default:  var(--slds-neutral-10);  /* 17.8:1 on white */
  --slds-text-weak:     var(--slds-neutral-30);  /*  9.7:1 on white */
  --slds-text-weakest:  var(--slds-neutral-50);  /*  4.7:1 on white — AA floor */
  --slds-text-inverse:  var(--slds-neutral-100);
  --slds-text-disabled: var(--slds-neutral-80);

  /* Borders. base-1 = structural (tables, cards). base-4 = interactive controls. */
  --slds-border-1:      var(--slds-neutral-80);  /* #c9c9c9 */
  --slds-border-2:      var(--slds-neutral-70);  /* #aeaeae */
  --slds-border-3:      var(--slds-neutral-60);  /* #939393 */
  --slds-border-4:      var(--slds-neutral-50);  /* #747474 — 4.7:1, control borders */
  --slds-border-brand:  var(--slds-brand-50);
  --slds-border-focus:  var(--slds-brand-40);

  /* Accents */
  --slds-accent:            var(--slds-brand-50);
  --slds-accent-hover:      var(--slds-brand-30);
  --slds-accent-active:     var(--slds-brand-30);
  --slds-accent-tint:       var(--slds-brand-95);
  --slds-on-accent:         var(--slds-neutral-100);

  /* Links */
  --slds-link:          var(--slds-brand-40);   /* #0b5cab, 6.7:1 */
  --slds-link-hover:    var(--slds-brand-30);   /* #014486 */
  --slds-link-active:   var(--slds-brand-20);   /* #032d60 */

  /* Status: solid fill / text-on-fill / soft tint / text-on-tint */
  --slds-success:       var(--slds-success-50);
  --slds-on-success:    var(--slds-neutral-100);
  --slds-success-tint:  var(--slds-success-90);
  --slds-success-text:  var(--slds-success-30);

  --slds-warning:       var(--slds-warning-60);
  --slds-on-warning:    var(--slds-neutral-10);  /* warning fills take DARK text */
  --slds-warning-tint:  var(--slds-warning-90);
  --slds-warning-text:  var(--slds-warning-30);

  --slds-error:         var(--slds-error-40);
  --slds-on-error:      var(--slds-neutral-100);
  --slds-error-tint:    var(--slds-error-90);
  --slds-error-text:    var(--slds-error-30);

  /* Info: stock SLDS Lightning Blue paints .slds-theme_info NEUTRAL GREY (#747474).
     Procus deliberately deviates and uses brand blue, matching SLDS 2 / Cosmos
     semantics, because grey "info" is indistinguishable from "offline". */
  --slds-info:          var(--slds-brand-50);
  --slds-on-info:       var(--slds-neutral-100);
  --slds-info-tint:     var(--slds-brand-95);
  --slds-info-text:     var(--slds-brand-30);

  --slds-offline:       var(--slds-neutral-30);  /* #444444 */
  --slds-on-offline:    var(--slds-neutral-100);
  --slds-offline-tint:  var(--slds-neutral-95);
  --slds-offline-text:  var(--slds-neutral-30);

  /* Disabled */
  --slds-disabled-bg:     var(--slds-neutral-80);
  --slds-disabled-border: var(--slds-neutral-80);
  --slds-disabled-text:   var(--slds-neutral-80);

  /* --- 2.5 Typography --------------------------------------------- */
  /* SLDS 2.264.1 ships the SYSTEM stack. "Salesforce Sans" is NOT referenced
     by the default font-family token any more — do not load a webfont. */
  --slds-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                      Helvetica, Arial, sans-serif, "Apple Color Emoji",
                      "Segoe UI Emoji", "Segoe UI Symbol";
  --slds-font-family-mono: Consolas, Menlo, Monaco, Courier, monospace;

  /* Size ramp. Base is 0.8125rem = 13px — this is the dense-app default. */
  --slds-font-size-1:  0.625rem;   /* 10px */
  --slds-font-size-2:  0.75rem;    /* 12px — text-body_small, labels, meta */
  --slds-font-size-3:  0.8125rem;  /* 13px — BODY DEFAULT, all table cells */
  --slds-font-size-4:  0.875rem;   /* 14px — page-header meta text */
  --slds-font-size-5:  1rem;       /* 16px — text-heading_small, card title */
  --slds-font-size-6:  1.125rem;   /* 18px — page-header title */
  --slds-font-size-7:  1.25rem;    /* 20px — text-heading_medium */
  --slds-font-size-8:  1.5rem;     /* 24px */
  --slds-font-size-9:  1.75rem;    /* 28px — text-heading_large */
  --slds-font-size-10: 2rem;       /* 32px */
  --slds-font-size-11: 2.625rem;   /* 42px */
  --slds-font-size-base: var(--slds-font-size-3);

  --slds-line-height-reset:   1;
  --slds-line-height-heading: 1.25;
  --slds-line-height-text:    1.5;

  --slds-font-weight-regular:  400;
  --slds-font-weight-semibold: 600;
  --slds-font-weight-bold:     700;

  --slds-letter-spacing-caps: 0.0625rem;  /* 1px, on uppercase labels only */

  /* --- 2.6 Spacing (SLDS named ramp) ------------------------------- */
  --slds-space-none:      0;
  --slds-space-xxx-small: 0.125rem;  /*  2px */
  --slds-space-xx-small:  0.25rem;   /*  4px */
  --slds-space-x-small:   0.5rem;    /*  8px */
  --slds-space-small:     0.75rem;   /* 12px */
  --slds-space-medium:    1rem;      /* 16px */
  --slds-space-large:     1.5rem;    /* 24px */
  --slds-space-x-large:   2rem;      /* 32px */
  --slds-space-xx-large:  3rem;      /* 48px */

  /* --- 2.7 Radius -------------------------------------------------- */
  --slds-radius-small:  0.125rem;  /*  2px */
  --slds-radius-medium: 0.25rem;   /*  4px — buttons, cards, inputs, tabs */
  --slds-radius-large:  0.5rem;    /*  8px */
  --slds-radius-pill:   15rem;     /* badges */
  --slds-radius-circle: 50%;

  /* --- 2.8 Borders & sizing ---------------------------------------- */
  --slds-border-width-1: 1px;
  --slds-border-width-2: 2px;
  --slds-border-width-3: 3px;
  --slds-border-width-4: 4px;

  --slds-tappable:         2.75rem;  /* 44px — SLDS SQUARE_TAPPABLE */
  --slds-tappable-small:   2rem;     /* 32px — dense-table action buttons */
  --slds-tappable-x-small: 1.5rem;   /* 24px */

  --slds-height-control: 2rem;       /* 32px — button/input/tab-header height */
  --slds-height-row:     2rem;       /* 32px — dense table row */

  /* --- 2.9 Shadows -------------------------------------------------- */
  --slds-shadow-1: 0 2px 2px 0 rgba(0, 0, 0, 0.10);  /* cards, page header */
  --slds-shadow-2: 0 2px 3px 0 rgba(0, 0, 0, 0.16);  /* dropdowns, popovers */
  --slds-shadow-3: 0 2px 4px 0 rgba(0, 0, 0, 0.16);  /* modals */
  --slds-shadow-4: 0 2px 5px 0 rgba(0, 0, 0, 0.16);
  --slds-shadow-header: 0 2px 4px rgba(0, 0, 0, 0.07); /* global header */
  --slds-shadow-drag:   0 2px 4px 0 rgba(0, 0, 0, 0.40);

  /* Focus rings — the single most important accessibility token here */
  --slds-shadow-focus:        0 0 0 2px var(--slds-border-focus);
  --slds-shadow-focus-outset: 0 0 0 2px var(--slds-neutral-100),
                              0 0 0 4px var(--slds-border-focus);
  --slds-shadow-focus-inset:  inset 0 0 0 2px var(--slds-border-focus);

  /* --- 2.10 Motion --------------------------------------------------- */
  --slds-duration-immediately: 0.05s;
  --slds-duration-quickly:     0.1s;
  --slds-duration-promptly:    0.2s;
  --slds-duration-slowly:      0.4s;
  --slds-duration-toast:       4.8s;   /* short toast */
  --slds-duration-toast-long:  9.6s;

  /* --- 2.11 Layout --------------------------------------------------- */
  --slds-header-height:  3.125rem;  /* 50px global header */
  --slds-nav-width:      15rem;     /* vertical nav [UNVERIFIED — see §4] */
  --slds-z-sticky:       1;
  --slds-z-dropdown:     7000;
  --slds-z-modal:        9000;
  --slds-z-toast:        10000;
}
```

### 2.6 Cosmos (SLDS 2) ramps — reference only, do not use

If you ever need to flip Procus to the newer SLDS 2 theme, swap only these. Everything else
in §2 (spacing, radius, type, shadows) is identical between themes.

```
brand   30 #022ac0 · 40 #0250d9 · 50 #066afe · 60 #4992fe · 90 #d6e6ff · 95 #edf4ff
success 30 #024d4c · 50 #0b827c · 70 #01c3b3 · 90 #acf3e4     (teal, not green)
warning 30 #6f3400 · 50 #a96504 · 70 #e4a201 · 90 #f9e3b6
error   30 #8a033e · 40 #b60554 · 50 #e3066a · 90 #fddde3     (magenta, not red)
info    = the Lightning-Blue ramp (#0176d3 at 50) — Cosmos makes "info" blue
```

---

## 3. Base layer

SLDS sets `html { font-size: 100%; line-height: 1.5 }` and `body { font-size: 0.8125rem }`.
Note the shipped stylesheet also sets `html { background: #eef4ff }` — that is the
documentation-site background, not the app chrome. Lightning Experience itself renders the
app shell on the neutral shade (`#f3f3f3`) with white content surfaces. Use the latter.

```css
*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 100%;
  line-height: var(--slds-line-height-text);
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: var(--slds-font-family);
  font-size: var(--slds-font-size-base);       /* 13px */
  line-height: var(--slds-line-height-text);
  color: var(--slds-text-default);
  background: var(--slds-surface-2);           /* #f3f3f3 app shell */
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--slds-link);
  text-decoration: none;
}
a:hover, a:focus   { color: var(--slds-link-hover); text-decoration: underline; }
a:active           { color: var(--slds-link-active); }

/* One global focus rule. Never remove an outline without replacing it. */
:focus-visible {
  outline: none;
  box-shadow: var(--slds-shadow-focus);
  border-radius: var(--slds-radius-small);
}

/* Typography utilities, values measured from SLDS 2.264.1 */
.slds-text-heading_large  { font-size: var(--slds-font-size-9); line-height: var(--slds-line-height-heading); }
.slds-text-heading_medium { font-size: var(--slds-font-size-7); line-height: var(--slds-line-height-heading); }
.slds-text-heading_small  { font-size: var(--slds-font-size-5); line-height: var(--slds-line-height-heading); }
.slds-text-body_regular   { font-size: var(--slds-font-size-3); }
.slds-text-body_small     { font-size: var(--slds-font-size-2); }

.slds-text-title {
  font-size: var(--slds-font-size-2);
  line-height: var(--slds-line-height-heading);
  color: var(--slds-text-weak);
}
.slds-text-title_caps {
  font-size: var(--slds-font-size-2);
  line-height: var(--slds-line-height-heading);
  color: var(--slds-text-weak);
  font-weight: var(--slds-font-weight-regular);
  text-transform: uppercase;
  letter-spacing: var(--slds-letter-spacing-caps);
}

.slds-truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slds-text-align_left   { text-align: left; }
.slds-text-align_center { text-align: center; }
.slds-text-align_right  { text-align: right; }

.slds-assistive-text {
  position: absolute; width: 1px; height: 1px;
  clip: rect(0 0 0 0); clip-path: inset(50%);
  overflow: hidden; white-space: nowrap;
}
```

**Heading recipe.** SLDS heading utilities set size + line-height but *not* weight — weight
comes from the component. Page-header titles are `1.125rem/700`; card titles are `1rem/700`.
Do not invent a third heading weight.

---

## 4. Global header + vertical navigation

**What it is.** A fixed 50px white bar across the top (product mark, global search, global
actions), with a vertical nav rail below-left. The rail is the app launcher / section switcher.

**Visual rules (measured):**

| Property | Value |
|---|---|
| Header height | `3.125rem` (50px) |
| Header padding | `0.5rem 0` |
| Header background | `#ffffff` |
| Header shadow | `0 2px 4px rgba(0,0,0,0.07)` |
| Header item padding | `0 1rem` |
| Search field | `flex: 0 1 33.5rem`, `min-width: 27.5rem`, icon inset `1.25rem`, input `padding-left: 3rem` |
| Header icon size | `1.25rem` square |
| Nav section title | `0.5rem 1rem`, `padding-left: 1.5rem`, `1rem/700` |
| Nav item padding | `0.5rem 1.5rem 0.5rem 2rem` |
| Nav compact padding | `0.25rem 1.5rem` |
| Nav hover/active wash | `rgba(21,137,238,0.1)` on a full-bleed `::before` |
| Nav hover/active bar | `inset 2px 0 0 #1b96ff` (a 2px left rail, not a background change) |
| Nav item text | `#181818` at all states |

The nav rail width is not set by SLDS (the region owns it). `15rem` is a sensible Procus value
— **`[UNVERIFIED]` against Salesforce.**

```css
.slds-global-header {
  display: flex;
  align-items: center;
  height: var(--slds-header-height);
  padding: var(--slds-space-x-small) 0;
  background: var(--slds-surface-1);
  box-shadow: var(--slds-shadow-header);
  position: sticky; top: 0; z-index: var(--slds-z-dropdown);
}
.slds-global-header__item { padding: 0 var(--slds-space-medium); }

.slds-nav-vertical { position: relative; width: var(--slds-nav-width); }

.slds-nav-vertical__title {
  padding: var(--slds-space-x-small) var(--slds-space-medium)
           var(--slds-space-x-small) var(--slds-space-large);
  font-size: var(--slds-font-size-5);
  font-weight: var(--slds-font-weight-bold);
}

.slds-nav-vertical__item { position: relative; }
.slds-nav-vertical__item::before {
  content: ""; position: absolute; inset: 0;
}
.slds-nav-vertical__item:hover::before,
.slds-nav-vertical__item.slds-is-active::before {
  background: rgba(21, 137, 238, 0.1);
}

.slds-nav-vertical__action {
  position: relative;
  display: flex; align-items: center;
  width: 100%;
  padding: var(--slds-space-x-small) var(--slds-space-large)
           var(--slds-space-x-small) var(--slds-space-x-large);
  color: var(--slds-text-default);
  border: 1px solid transparent;
  border-radius: 0;
  background: none;
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 0 0 var(--slds-brand-60);
}
.slds-nav-vertical__action:hover,
.slds-is-active > .slds-nav-vertical__action {
  text-decoration: none;
  box-shadow: inset 2px 0 0 var(--slds-brand-60);
}
.slds-nav-vertical__action:focus-visible { box-shadow: var(--slds-shadow-focus-inset); }

.slds-nav-vertical_compact .slds-nav-vertical__action,
.slds-nav-vertical_compact .slds-nav-vertical__title {
  padding: var(--slds-space-xx-small) var(--slds-space-large);
}
```

---

## 5. Page header (record-home style)

**What it is.** The block at the top of every object page: icon + eyebrow + title on the left,
action buttons right-aligned on the same row, and a meta row of label/value pairs below.

**Anatomy:** `.slds-page-header` › `__row` › `__col-title` (icon + `__name` + `__title`) and
`__col-actions`; then a second `__row` of `__col-details` › `__detail-block`s.

**Visual rules (measured):**

| Property | Value |
|---|---|
| Padding | `1rem` |
| Background | `#f3f3f3` (**shade, not white** — this is what separates it from the content below) |
| Border | `1px solid #c9c9c9` |
| Radius | `0.25rem` |
| Shadow | `0 2px 2px 0 rgba(0,0,0,0.1)` |
| Title | `1.125rem` / `700` / line-height `1.25` |
| Eyebrow (`__name-meta`) | `0.75rem`, truncated, `padding-right: 0.5rem` |
| Meta value (`__meta-text`) | `0.875rem` |
| Record icon | `2.25rem` square |
| Actions column | `align-self: flex-start`, `flex: none`, `padding-bottom: 0.25rem` |
| Gap between action buttons | `0.25rem` |
| Detail column padding | `0 1rem`; the row itself uses `-1rem` gutters |

```css
.slds-page-header {
  padding: var(--slds-space-medium);
  background: var(--slds-surface-2);
  border: var(--slds-border-width-1) solid var(--slds-border-1);
  border-radius: var(--slds-radius-medium);
  box-shadow: var(--slds-shadow-1);
}
.slds-page-header__row { display: flex; }
.slds-page-header__row + .slds-page-header__row { margin-top: var(--slds-space-small); }
.slds-page-header__row_gutters { margin-inline: calc(var(--slds-space-medium) * -1); }

.slds-page-header__col-title   { flex: 1 1 0%; min-width: 0; }
.slds-page-header__col-actions { flex: none; align-self: flex-start; padding-bottom: var(--slds-space-xx-small); }
.slds-page-header__col-details { flex: 1 1 auto; padding-inline: var(--slds-space-medium); max-width: 100%; }

.slds-page-header__icon { width: 2.25rem; height: 2.25rem; }

.slds-page-header__name-meta {
  font-size: var(--slds-font-size-2);
  color: var(--slds-text-weak);
  padding-right: var(--slds-space-x-small);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.slds-page-header__title {
  display: block;
  font-size: var(--slds-font-size-6);
  font-weight: var(--slds-font-weight-bold);
  line-height: var(--slds-line-height-heading);
}
.slds-page-header__meta-text { font-size: var(--slds-font-size-4); }

.slds-page-header__controls { display: flex; }
.slds-page-header__control + .slds-page-header__control { margin-left: var(--slds-space-xx-small); }

/* Meta row: a label above a value, label muted+small, value at body size */
.slds-page-header__detail-block .slds-text-title { margin-bottom: var(--slds-space-xxx-small); }
```

**Rule:** primary action is the single `_brand` button and sits **rightmost**. Everything else
is `_neutral`. Never put two brand buttons in a page header.

---

## 6. Tabset / sub-tabs

**What it is.** Horizontal tabs under the page header. SLDS has two flavours: **default**
(underline) for in-page sections, and **scoped** (boxed, connected to a panel) for nested
content. Procus uses default tabs everywhere except inside a card.

**Visual rules (measured):**

| Property | Default tabs | Scoped tabs |
|---|---|---|
| Link height / line-height | `2.5rem` (40px) | `2.5rem` |
| Link padding | `0 0.5rem` | `0 1.5rem` |
| Item padding (inline) | `0.75rem` | — |
| Idle colour | `#444444` | `#444444` |
| Active/hover colour | `#181818` | `#014486` on hover |
| Indicator | `border-bottom: 2px` — transparent → `#0176d3` on hover, `#1b96ff` when active | background flips to `#ffffff`, first tab gets `0.25rem 0 0 0` radius |
| Nav rule | `border-bottom: 1px` (resolves to `#747474`; the stale inline fallback is `#e5e5e5`) | — |
| Item pull-down | `margin-bottom: -1px` so the active tab covers the nav rule | same |
| Panel padding | `1rem 0` | — |
| Focus | `outline: 2px solid #0b5cab; outline-offset: -0.375rem` on the item | same |

`#747474` is a heavy rule for a tab strip. Procus uses `--slds-border-1` (`#c9c9c9`) — it reads
closer to real Lightning Experience. This is a **deliberate deviation**, noted here so nobody
"fixes" it back.

```css
.slds-tabs_default { display: block; width: 100%; }

.slds-tabs_default__nav {
  display: flex;
  align-items: flex-start;
  border-bottom: var(--slds-border-width-1) solid var(--slds-border-1);
  list-style: none; margin: 0; padding: 0;
}

.slds-tabs_default__item {
  position: relative;
  padding-inline: var(--slds-space-small);
  margin-bottom: calc(var(--slds-border-width-1) * -1);
  color: var(--slds-text-weak);
}
.slds-tabs_default__item:has(:focus-visible) {
  outline: var(--slds-border-width-2) solid var(--slds-border-focus);
  outline-offset: -0.375rem;
}

.slds-tabs_default__link {
  display: block;
  height: 2.5rem; line-height: 2.5rem;
  padding: 0 var(--slds-space-x-small);
  color: var(--slds-text-weak);
  text-decoration: none;
  border-bottom: var(--slds-border-width-2) solid transparent;
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  cursor: pointer;
}
.slds-tabs_default__link:hover,
.slds-tabs_default__link:focus {
  color: var(--slds-text-default);
  border-color: var(--slds-brand-50);
  text-decoration: none;
}
.slds-tabs_default__item.slds-is-active .slds-tabs_default__link {
  color: var(--slds-text-default);
  border-color: var(--slds-brand-60);
  font-weight: var(--slds-font-weight-bold);
}

.slds-tabs_default__content { padding: var(--slds-space-medium) 0; }
.slds-tabs_default__content[hidden] { display: none; }
```

---

## 7. Data table

This is the component that decides whether Procus reads as an enterprise app. Get it right.

**Visual rules (measured from SLDS 2.264.1):**

| Property | Value |
|---|---|
| Table background | `#ffffff` |
| Font size | `inherit` → `0.8125rem` (13px) |
| Cell padding | `0.25rem 0.5rem` |
| Header cell padding | `0.25rem 0.5rem`, `font-weight: 700`, `line-height: normal` |
| Header background | `#f3f3f3` |
| Header text colour | `#444444` |
| Header row height | `2rem` (32px), enforced by `.slds-th__action { height: 2rem }` |
| `th` default weight | `400` (only `thead th` is 700) |
| Row hover | cells go `#f3f3f3` — opt out with `.slds-no-row-hover` |
| Selected row | `#f3f3f3` (same as hover), links darken to `#032d60` |
| `_bordered` | `border-collapse: separate`; table top/bottom `1px #c9c9c9`; every `tbody` cell `border-top: 1px #c9c9c9` |
| `_col-bordered` | `border-left: 1px #c9c9c9` between adjacent cells |
| `_striped` | `tbody tr:nth-of-type(even)` cells go `#f3f3f3` |
| `_cell-buffer` | first/last cell gets `1.5rem` outer padding |
| `_fixed-layout` | `table-layout: fixed; width: 100%`; `.slds-cell-shrink` becomes `3rem` |
| `.slds-cell-shrink` | `width: 1%` (auto-layout) — for checkbox/row-number columns |
| Cell focus | `box-shadow: inset 0 0 0 2px #0b5cab, inset 0 0 0 4px #fff` |
| Sort icon | `0.75rem` square, `margin-left: 0.25rem`, `display: none` until `.slds-is-sorted`; ascending = `rotate(180deg)`; icon fills `#0176d3` on hover |
| Sortable header hover | background flips to **white** (`#ffffff`), not darker |

**Striped or bordered?** SLDS ships both and uses **neither by default**. Real Lightning list
views are `_bordered` + row hover, **not striped**. Procus does the same: horizontal 1px rules,
no zebra. Stripes plus hover is ambiguous — you cannot tell which row is under the cursor.

**Numeric columns.** SLDS has no numeric-alignment rule and **does not set
`font-variant-numeric` anywhere** (verified: 0 occurrences in the 1.1 MB stylesheet). So the
tabular-figures rule below is a **Procus addition**, not an SLDS rule. Keep it — money columns
that do not align on the decimal look amateur.

```css
.slds-table {
  width: 100%;
  background: var(--slds-surface-1);
  font-size: inherit;
  border-collapse: collapse;
}

.slds-table th,
.slds-table td {
  padding: var(--slds-space-xx-small) var(--slds-space-x-small);
  position: relative;
  white-space: nowrap;
  text-align: left;
  vertical-align: middle;
}
.slds-table th { font-weight: var(--slds-font-weight-regular); }

.slds-table thead th {
  background: var(--slds-surface-2);
  color: var(--slds-text-weak);
  font-weight: var(--slds-font-weight-bold);
  line-height: normal;
  height: var(--slds-height-row);
  white-space: nowrap;
}

/* Sortable header: the whole cell is a button-like target, 32px tall */
.slds-th__action {
  display: flex; align-items: center;
  width: 100%; height: var(--slds-height-row);
  padding: var(--slds-space-xx-small) var(--slds-space-x-small);
  margin: calc(var(--slds-space-xx-small) * -1) calc(var(--slds-space-x-small) * -1);
  background: none; border: 0; color: inherit; font: inherit;
  font-weight: var(--slds-font-weight-bold);
  cursor: pointer;
}
.slds-th__action:hover,
.slds-th__action:focus { background: var(--slds-surface-1); outline: 0; }
.slds-th__action:focus-visible { box-shadow: var(--slds-shadow-focus-outset); }

.slds-is-sortable__icon {
  width: 0.75rem; height: 0.75rem;
  margin-left: var(--slds-space-xx-small);
  display: none;
  fill: currentColor;
}
.slds-is-sortable:hover .slds-is-sortable__icon,
.slds-is-sorted .slds-is-sortable__icon { display: inline-block; }
.slds-is-sortable:hover .slds-is-sortable__icon { fill: var(--slds-brand-50); }
.slds-is-sorted_asc .slds-is-sortable__icon { transform: rotate(180deg); }

/* Row hover / selection */
.slds-table:not(.slds-no-row-hover) tbody tr:hover > td,
.slds-table:not(.slds-no-row-hover) tbody tr:hover > th { background: var(--slds-surface-2); }
.slds-table tbody tr.slds-is-selected > td,
.slds-table tbody tr.slds-is-selected > th { background: var(--slds-surface-2); }

/* Borders — the Procus default */
.slds-table_bordered {
  border-top: var(--slds-border-width-1) solid var(--slds-border-1);
  border-bottom: var(--slds-border-width-1) solid var(--slds-border-1);
}
.slds-table_bordered tbody td,
.slds-table_bordered tbody th { border-top: var(--slds-border-width-1) solid var(--slds-border-1); }
.slds-table_col-bordered td + td,
.slds-table_col-bordered th + th { border-left: var(--slds-border-width-1) solid var(--slds-border-1); }

/* Available but off by default */
.slds-table_striped tbody tr:nth-of-type(even) > td,
.slds-table_striped tbody tr:nth-of-type(even) > th { background: var(--slds-surface-2); }

.slds-table_fixed-layout { table-layout: fixed; width: 100%; }
.slds-table_fixed-layout .slds-cell-shrink { width: 3rem; padding-inline: 0; }
.slds-cell-shrink { width: 1%; }

.slds-table_cell-buffer tr > :first-child { padding-left: var(--slds-space-large); }
.slds-table_cell-buffer tr > :last-child  { padding-right: var(--slds-space-large); }

.slds-cell-wrap { white-space: pre-line; overflow-wrap: break-word; }

/* PROCUS ADDITION — not an SLDS rule. Money and quantity columns. */
.slds-cell-numeric,
th.slds-cell-numeric { text-align: right; font-variant-numeric: tabular-nums; }
```

**Column alignment rules.** Text left. Integers, currency, percentages and dates-as-numbers
right, with `tabular-nums`. Status badges and icons centred only if the column header is also
centred. Never centre a text column.

---

## 8. Cards / region panels

**What it is.** A white bordered surface with a bold header, a body, and an optional centred
footer. This is the only container Procus uses for grouping content inside a page.

**Visual rules (measured):**

| Property | Value |
|---|---|
| Background | `#ffffff` |
| Border | `1px solid #c9c9c9` |
| Radius | `0.25rem` |
| Shadow | `0 2px 2px 0 rgba(0,0,0,0.1)` |
| Card padding | `0` (the sub-parts own their padding) |
| Header padding | `0.75rem 1rem 0` + `margin-bottom: 0.75rem` |
| Header title | `1rem` / `700` / line-height `1.25` |
| Body margin | `0.75rem` top and bottom; `__body_inner` adds `1rem` inline padding |
| Footer | `0.75rem 1rem`, `margin-top: 0.75rem`, `border-top: 1px #c9c9c9`, `text-align: center`, `font-size: 0.8125rem` |
| Card + card | `margin-top: 1rem` |
| Empty body/footer | `display: none` when empty |

**Note:** the card body has **no horizontal padding by default** — that is deliberate, so a
full-bleed table can sit flush inside a card. Add `__body_inner` only for prose.

```css
.slds-card {
  position: relative;
  background: var(--slds-surface-1);
  border: var(--slds-border-width-1) solid var(--slds-border-1);
  border-radius: var(--slds-radius-medium);
  box-shadow: var(--slds-shadow-1);
  background-clip: padding-box;
}
.slds-card + .slds-card { margin-top: var(--slds-space-medium); }

.slds-card__header {
  display: flex; align-items: center; gap: var(--slds-space-x-small);
  padding: var(--slds-space-small) var(--slds-space-medium) 0;
  margin-bottom: var(--slds-space-small);
}
.slds-card__header-title {
  display: flex; align-items: center;
  font-size: var(--slds-font-size-5);
  font-weight: var(--slds-font-weight-bold);
  line-height: var(--slds-line-height-heading);
}
.slds-card__header-actions { margin-left: auto; }

.slds-card__body { margin-block: var(--slds-space-small); }
.slds-card__body_inner { padding-inline: var(--slds-space-medium); }
.slds-card__body:empty, .slds-card__footer:empty { display: none; }

.slds-card__footer {
  padding: var(--slds-space-small) var(--slds-space-medium);
  margin-top: var(--slds-space-small);
  border-top: var(--slds-border-width-1) solid var(--slds-border-1);
  text-align: center;
  font-size: var(--slds-font-size-3);
}
```

---

## 9. Badges, pills, status indicators

**Badge** — a static, non-interactive status chip. **Pill** — a removable/selectable token.
Do not mix them up: if it has an X, it is a pill.

**Badge visual rules (measured):**

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center` |
| Padding | `0.25rem 0.5rem` |
| Font | `0.75rem` / `700` / `line-height: normal` |
| Radius | `15rem` (full pill) |
| Border | `1px solid transparent` |
| Default background | `#f3f3f3`, text `#181818` |
| `_inverse` | background `#747474`, text `#ffffff` |
| `_lightest` | background `#ffffff`, border `#c9c9c9` |
| Icon | `0.75rem`; `__icon_left` `margin-right: 0.25rem`; icon colour `#747474` |
| Badge + badge | `margin-left: 0.5rem` |
| Empty badge | `padding: 0` |

**Theme fills (measured from `.slds-theme_*`):**

| Class | Background | Text | Contrast |
|---|---|---|---|
| `theme_success` | `#2e844a` | `#ffffff` | 4.65:1 ✓ |
| `theme_warning` | `#dd7a01` | `#181818` (**dark**) | 5.80:1 ✓ |
| `theme_error` | `#ba0517` | `#ffffff` | 6.73:1 ✓ |
| `theme_offline` | `#444444` | `#ffffff` | 9.74:1 ✓ |
| `theme_info` | `#747474` in stock SLDS; Procus uses `#0176d3` | `#ffffff` | 4.67 / 4.63:1 ✓ |
| `theme_inverse` | `#001639` | `#ffffff` | — |
| `theme_shade` | `#f3f3f3` | inherits | — |

Warning takes **dark** text. This is not a typo and it is the one status colour people get
wrong. `#ffffff` on `#dd7a01` is 3.6:1 and fails AA.

For dense tables, solid status fills are loud. Procus uses **soft badges** (tint background +
dark semantic text) in table cells and **solid theme fills** only in banners and headers. Both
are below.

```css
.slds-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--slds-space-xx-small) var(--slds-space-x-small);
  font-size: var(--slds-font-size-2);
  font-weight: var(--slds-font-weight-bold);
  line-height: normal;
  white-space: nowrap;
  border: var(--slds-border-width-1) solid transparent;
  border-radius: var(--slds-radius-pill);
  background: var(--slds-surface-2);
  color: var(--slds-text-default);
}
.slds-badge + .slds-badge { margin-left: var(--slds-space-x-small); }
.slds-badge:empty { padding: 0; }
.slds-badge__icon_left  { margin-right: var(--slds-space-xx-small); }
.slds-badge__icon_right { margin-left:  var(--slds-space-xx-small); }

/* Solid fills — banners, page headers, KPI tiles */
.slds-theme_success { background: var(--slds-success); color: var(--slds-on-success); }
.slds-theme_warning { background: var(--slds-warning); color: var(--slds-on-warning); }
.slds-theme_error   { background: var(--slds-error);   color: var(--slds-on-error); }
.slds-theme_offline { background: var(--slds-offline); color: var(--slds-on-offline); }
.slds-theme_info    { background: var(--slds-info);    color: var(--slds-on-info); }
.slds-theme_inverse { background: var(--slds-surface-inverse-dark); color: var(--slds-text-inverse); }
.slds-theme_shade   { background: var(--slds-surface-2); }

/* Soft badges — PROCUS ADDITION for in-table status. Tint + semantic text. */
.slds-badge_success { background: var(--slds-success-tint); color: var(--slds-success-text); }
.slds-badge_warning { background: var(--slds-warning-tint); color: var(--slds-warning-text); }
.slds-badge_error   { background: var(--slds-error-tint);   color: var(--slds-error-text); }
.slds-badge_info    { background: var(--slds-info-tint);    color: var(--slds-info-text); }
.slds-badge_offline { background: var(--slds-offline-tint); color: var(--slds-offline-text); }

/* Status dot — for a column too narrow for a badge. PROCUS ADDITION. */
.slds-status-dot {
  display: inline-block;
  width: 0.5rem; height: 0.5rem;
  border-radius: var(--slds-radius-circle);
  margin-right: var(--slds-space-xx-small);
  vertical-align: baseline;
}
.slds-status-dot_success { background: var(--slds-success); }
.slds-status-dot_warning { background: var(--slds-warning); }
.slds-status-dot_error   { background: var(--slds-error); }
.slds-status-dot_offline { background: var(--slds-offline); }
```

**Pill visual rules (measured):** `inline-flex`, `justify-content: space-between`,
`line-height: 1.5`, `min-height: 1.625rem`, `padding-left: 0.125rem`, border `1px` (resolves to
`#747474`), radius `0.25rem`, background `#ffffff`; hover background `#f3f3f3`; focus
`0 0 0 2px #0b5cab`; `pill + pill { margin-left: 0.125rem }`. The container is
`min-height: calc(1.875rem + 2px)` with `0.125rem` padding.

```css
.slds-pill {
  display: inline-flex; align-items: center; justify-content: space-between;
  max-width: 100%; min-height: 1.625rem;
  padding-left: var(--slds-space-xxx-small);
  line-height: var(--slds-line-height-text);
  border: var(--slds-border-width-1) solid var(--slds-border-4);
  border-radius: var(--slds-radius-medium);
  background: var(--slds-surface-1);
}
.slds-pill:hover { background: var(--slds-surface-2); }
.slds-pill:focus-within { box-shadow: var(--slds-shadow-focus); outline: 0; }
.slds-pill + .slds-pill { margin-left: var(--slds-space-xxx-small); }
```

---

## 10. Alerts, inline banners, and toasts

SLDS has three distinct things. Use the right one.

### 10.1 Alert (`.slds-notify_alert`) — page-wide system banner
Full-width strip pinned under the global header. Rare — outage, impersonation, offline mode.

Measured: `padding: 0.5rem 2rem 0.5rem 0.5rem`, `width: 100%`, `text-align: center`,
`color: #ffffff`, default background `#747474`, close button absolute at `right: 0.75rem`.
It also paints a 45°, 64px diagonal stripe overlay at `rgba(0,0,0,0.025)` — that texture is
what makes SLDS alerts recognisable. Combine with a `.slds-theme_*` class for colour.

### 10.2 Scoped notification (`.slds-scoped-notification`) — in-page banner
**This is the one Procus should use most.** It sits inside a card or above a table.

Measured: `padding: 0.75rem`. `_light` = background `#f3f3f3`, text `#181818`.
`_dark` = background `#747474`, text `#ffffff`. Colour otherwise comes from a `theme_*` class.

### 10.3 Toast (`.slds-notify_toast`) — transient confirmation
Measured: `min-width: 30rem`, `padding: 0.75rem 3rem 0.75rem 1.5rem`, `margin: 0.5rem`,
radius `0.25rem`, default background `#747474`, `text-align: left`, `color: #ffffff`,
close at `right: 0.75rem`. Container is `position: fixed; top: 0; left: 0; width: 100%;
z-index: 10000; text-align: center`. Dismiss timings are tokenised: **4.8s** short,
**9.6s** medium. Errors should not auto-dismiss.

```css
/* Full-width system alert */
.slds-notify_alert {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 100%;
  padding: var(--slds-space-x-small) var(--slds-space-x-large)
           var(--slds-space-x-small) var(--slds-space-x-small);
  text-align: center;
  color: var(--slds-text-inverse);
  background-color: var(--slds-neutral-50);
  background-image: linear-gradient(45deg,
    rgba(0,0,0,0.025) 25%, transparent 25%, transparent 50%,
    rgba(0,0,0,0.025) 50%, rgba(0,0,0,0.025) 75%, transparent 75%, transparent);
  background-size: 64px 64px;
}

/* In-page banner — the workhorse */
.slds-scoped-notification {
  display: flex; align-items: flex-start; gap: var(--slds-space-x-small);
  padding: var(--slds-space-small);
  border-radius: var(--slds-radius-medium);
}
.slds-scoped-notification_light { background: var(--slds-surface-2); color: var(--slds-text-default); }
.slds-scoped-notification_dark  { background: var(--slds-neutral-50); color: var(--slds-text-inverse); }

/* PROCUS ADDITION: tinted banners with a 4px semantic left rule.
   Reads better in a dense app than a full-saturation strip. */
.slds-scoped-notification_error {
  background: var(--slds-error-tint);
  color: var(--slds-text-default);
  border-left: var(--slds-border-width-4) solid var(--slds-error);
}
.slds-scoped-notification_warning {
  background: var(--slds-warning-tint);
  color: var(--slds-text-default);
  border-left: var(--slds-border-width-4) solid var(--slds-warning);
}
.slds-scoped-notification_success {
  background: var(--slds-success-tint);
  color: var(--slds-text-default);
  border-left: var(--slds-border-width-4) solid var(--slds-success);
}
.slds-scoped-notification_info {
  background: var(--slds-info-tint);
  color: var(--slds-text-default);
  border-left: var(--slds-border-width-4) solid var(--slds-info);
}

/* Toast */
.slds-notify_container {
  position: fixed; top: 0; left: 0;
  width: 100%; z-index: var(--slds-z-toast);
  text-align: center; pointer-events: none;
}
.slds-notify_toast {
  position: relative;
  display: inline-flex; align-items: center; justify-content: flex-start;
  min-width: 30rem; max-width: min(50rem, calc(100vw - 2rem));
  margin: var(--slds-space-x-small);
  padding: var(--slds-space-small) var(--slds-space-xx-large)
           var(--slds-space-small) var(--slds-space-large);
  border-radius: var(--slds-radius-medium);
  background: var(--slds-neutral-50);
  color: var(--slds-text-inverse);
  box-shadow: var(--slds-shadow-3);
  text-align: left;
  word-break: break-word;
  pointer-events: auto;
}
.slds-notify__close {
  position: absolute; top: 50%; right: var(--slds-space-small);
  transform: translateY(-50%);
}
```

---

## 11. Buttons

**Geometry is shared by every variant (measured):**

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center` |
| Border width | `1px` |
| Radius | `0.25rem` |
| `line-height` | `1.875rem` (30px) → **32px total height** with borders |
| Horizontal padding | `1rem` on every filled/outlined variant |
| Base (bare/link) padding | `0` |
| `_small` | `line-height: 1.75rem; min-height: 2rem` |
| Gap between buttons | `margin-left: 0.25rem` |
| Focus | `box-shadow: 0 0 0 2px #0b5cab` (outline) or the 4px outset ring |
| Transition | `border 0.15s linear` |
| Icon-only large | `3rem` square, icon `1.5rem` |
| Disabled (filled) | background + border `#c9c9c9`, text `#ffffff` |
| Disabled (bare) | text `#c9c9c9`, transparent bg/border |

**Variant colours (measured, resolved):**

| Variant | Background | Border | Text | Hover/active |
|---|---|---|---|---|
| `_brand` | `#0176d3` | `#0176d3` | `#ffffff` | bg+border `#014486` |
| `_neutral` | `#ffffff` | `#747474` | `#0176d3` | bg `#f3f3f3` |
| `_outline-brand` | `#ffffff` | `#0176d3` | `#0176d3` | bg `#f3f3f3` |
| `_destructive` | `#ba0517` | `#ba0517` | `#ffffff` | bg `#8e030f` |
| `_text-destructive` | `#ffffff` | `#747474` | `#8e030f` | bg `#f3f3f3` |
| `_success` | `#45c65a` | `#2e844a` | `#181818` | bg+border `#2e844a`, text `#ffffff` |
| bare (`.slds-button` alone) | transparent | transparent | `#0176d3` | text `#014486` |

The neutral button's border resolves to `#747474`, **not** the `#c9c9c9` shown in the
stylesheet's stale inline fallback. `#747474` on white is 4.67:1 and clears the 3:1 non-text
requirement; `#c9c9c9` is 1.66:1 and does not. Keep `#747474`.

```css
.slds-button {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0;
  line-height: 1.875rem;
  font-family: inherit;
  font-size: var(--slds-font-size-3);
  color: var(--slds-brand-50);
  background: transparent;
  border: var(--slds-border-width-1) solid transparent;
  border-radius: var(--slds-radius-medium);
  text-decoration: none;
  vertical-align: middle;
  user-select: none;
  cursor: pointer;
  transition: border var(--slds-duration-quickly) linear,
              background-color var(--slds-duration-quickly) linear;
}
.slds-button:hover, .slds-button:focus { color: var(--slds-brand-30); text-decoration: none; }
.slds-button:focus-visible { box-shadow: var(--slds-shadow-focus); outline: 0; }
.slds-button + .slds-button { margin-left: var(--slds-space-xx-small); }
.slds-button[disabled], .slds-button:disabled { color: var(--slds-disabled-text); cursor: default; }
.slds-button[disabled] * { pointer-events: none; }

/* Shared padding for every filled/outlined variant */
.slds-button_brand, .slds-button_neutral, .slds-button_outline-brand,
.slds-button_destructive, .slds-button_text-destructive, .slds-button_success {
  padding-inline: var(--slds-space-medium);
}

.slds-button_brand {
  background: var(--slds-brand-50); border-color: var(--slds-brand-50);
  color: var(--slds-on-accent);
}
.slds-button_brand:hover, .slds-button_brand:focus, .slds-button_brand:active {
  background: var(--slds-brand-30); border-color: var(--slds-brand-30);
  color: var(--slds-on-accent);
}

.slds-button_neutral {
  background: var(--slds-surface-1); border-color: var(--slds-border-4);
  color: var(--slds-brand-50);
}
.slds-button_neutral:hover, .slds-button_neutral:focus { background: var(--slds-surface-2); }

.slds-button_outline-brand {
  background: var(--slds-surface-1); border-color: var(--slds-brand-50);
  color: var(--slds-brand-50);
}
.slds-button_outline-brand:hover, .slds-button_outline-brand:focus { background: var(--slds-surface-2); }

.slds-button_destructive {
  background: var(--slds-error-40); border-color: var(--slds-error-40);
  color: var(--slds-on-error);
}
.slds-button_destructive:hover, .slds-button_destructive:focus, .slds-button_destructive:active {
  background: var(--slds-error-30); border-color: var(--slds-error-30);
  color: var(--slds-on-error);
}

.slds-button_text-destructive {
  background: var(--slds-surface-1); border-color: var(--slds-border-4);
  color: var(--slds-error-30);
}
.slds-button_text-destructive:hover, .slds-button_text-destructive:focus { background: var(--slds-surface-2); }

.slds-button_success {
  background: var(--slds-success-70); border-color: var(--slds-success-50);
  color: var(--slds-text-default);
}
.slds-button_success:hover, .slds-button_success:focus {
  background: var(--slds-success-50); border-color: var(--slds-success-50);
  color: var(--slds-text-inverse);
}

.slds-button_brand[disabled], .slds-button_destructive[disabled], .slds-button_success[disabled] {
  background: var(--slds-disabled-bg); border-color: var(--slds-disabled-border);
  color: var(--slds-text-inverse);
}

.slds-button_small { line-height: 1.75rem; min-height: var(--slds-tappable-small); }

/* Icon-only button — keep a 32px hit area in dense tables */
.slds-button_icon {
  width: var(--slds-tappable-small); height: var(--slds-tappable-small);
  padding: 0; line-height: 1;
  color: var(--slds-text-weakest);
}
.slds-button_icon:hover { color: var(--slds-text-default); }

/* Grouped buttons: collapse borders, round the outer corners only */
.slds-button-group { display: inline-flex; }
.slds-button-group .slds-button { border-radius: 0; margin: 0; }
.slds-button-group .slds-button + .slds-button { margin-left: -1px; }
.slds-button-group .slds-button:first-child { border-radius: var(--slds-radius-medium) 0 0 var(--slds-radius-medium); }
.slds-button-group .slds-button:last-child  { border-radius: 0 var(--slds-radius-medium) var(--slds-radius-medium) 0; }
.slds-button-group .slds-button:only-child  { border-radius: var(--slds-radius-medium); }
.slds-button-group .slds-button:focus { z-index: 1; }
```

---

## 12. Path (the chevron pipeline)

**What it is.** The stage pipeline from Opportunity records — a row of chevrons, each a stage,
coloured by completion. This is the single highest-value component for the Procus
Kanban/workflow view, so here is exactly how Salesforce builds it.

**The mechanism.** The chevron is **not** a clip-path or an SVG. Each `__item` is a plain box
whose background is invisible; two absolutely-positioned pseudo-elements paint it:
`::before` covers the **top half** and is skewed `+28deg`; `::after` covers the **bottom half**
and is skewed `-30deg`. Together they form the arrow. The label sits on a `z-index: 5` link
above them.

**Measured geometry:**

| Property | Value |
|---|---|
| Item | `position: relative; flex: 1; min-width: 5rem; text-align: center` |
| Item margins | `margin-left: 0.375rem; margin-right: 0.4375rem` |
| Pseudo-element inset | `left: -0.25rem; right: -0.3125rem` |
| `::before` | `top: 0; height: calc(2rem / 2 + 0.0625rem)` = `1.0625rem`; `transform: skew(28deg)` |
| `::after` | `bottom: 0; height: 1rem; transform: skew(-30deg)` |
| Link | `height: 2rem; padding: 0.5rem 0.25rem 0.5rem 0.5rem; z-index: 5; display: flex; centred` |
| First item | `margin-left: 0`; left corners `border-radius: 2rem`; `padding-left: 0.625rem`; pseudo `left: 1.125rem` |
| Last item | `margin-right: 0`; right corners `border-radius: 2rem`; `padding-right: 0.625rem`; pseudo `right: 0.625rem` |
| Label flip | `__title` / `__stage` swap via `rotateX(180deg)`, `transition: transform 0.2s linear` |
| Stage name heading | `display: block; font-weight: 700; margin: 0.75rem 0` |

**State colours (measured):**

| State | Background (item + both pseudos) | Link colour | Hover |
|---|---|---|---|
| `.slds-is-incomplete` | `#f3f3f3` | `#181818` | `#c9c9c9` |
| `.slds-is-complete` | `#3ba755` (success-60) | `#ffffff` | `#2e844a` (success-50) |
| `.slds-is-current` | `#ffffff` + `0.125rem` `#014486` gradient edges | `#014486` | border `#032d60` |

The "current" stage does not get a solid fill. It stays white and draws a 2px `#014486` outline
**along the chevron edges** using three stacked linear-gradients at `background-size:
0.125rem 100%, 0.125rem 100%, 100% 0.125rem` on each pseudo-element. Simplified below to a
2px border on the pseudos — visually equivalent at normal zoom and far easier to maintain.

```css
.slds-path__nav {
  display: flex; align-items: flex-start;
  list-style: none; margin: 0; padding: 0;
  overflow: hidden;
}

.slds-path__item {
  position: relative;
  flex: 1; min-width: 5rem;
  margin-left: 0.375rem; margin-right: 0.4375rem;
  text-align: center;
}
.slds-path__item::before,
.slds-path__item::after {
  content: "";
  position: absolute;
  left: -0.25rem; right: -0.3125rem;
  cursor: pointer;
}
.slds-path__item::before {
  top: 0;
  height: calc(var(--slds-height-control) / 2 + 0.0625rem);
  transform: skew(28deg) translate3d(0, 0, 0);
}
.slds-path__item::after {
  bottom: 0;
  height: calc(var(--slds-height-control) / 2);
  transform: skew(-30deg) translate3d(0, 0, 0);
}

.slds-path__item:first-child {
  margin-left: 0;
  padding-left: 0.625rem;
  border-top-left-radius: 2rem; border-bottom-left-radius: 2rem;
}
.slds-path__item:first-child::before,
.slds-path__item:first-child::after { left: 1.125rem; }

.slds-path__item:last-child {
  margin-right: 0;
  padding-right: 0.625rem;
  border-top-right-radius: 2rem; border-bottom-right-radius: 2rem;
}
.slds-path__item:last-child::before,
.slds-path__item:last-child::after { right: 0.625rem; }

.slds-path__link {
  position: relative; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  height: var(--slds-height-control);
  padding: var(--slds-space-x-small) var(--slds-space-xx-small)
           var(--slds-space-x-small) var(--slds-space-x-small);
  font-size: var(--slds-font-size-2);
  text-decoration: none;
  cursor: pointer;
}
.slds-path__link:focus-visible { box-shadow: var(--slds-shadow-focus-inset); outline: 0; }
.slds-path__title { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* --- States --- */
.slds-path__item.slds-is-incomplete,
.slds-path__item.slds-is-incomplete::before,
.slds-path__item.slds-is-incomplete::after { background: var(--slds-surface-2); }
.slds-path__item.slds-is-incomplete .slds-path__link { color: var(--slds-text-default); }
.slds-path__item.slds-is-incomplete:hover,
.slds-path__item.slds-is-incomplete:hover::before,
.slds-path__item.slds-is-incomplete:hover::after { background: var(--slds-neutral-80); }

.slds-path__item.slds-is-complete,
.slds-path__item.slds-is-complete::before,
.slds-path__item.slds-is-complete::after { background: var(--slds-success-60); }
.slds-path__item.slds-is-complete .slds-path__link { color: var(--slds-text-inverse); }
.slds-path__item.slds-is-complete:hover,
.slds-path__item.slds-is-complete:hover::before,
.slds-path__item.slds-is-complete:hover::after { background: var(--slds-success-50); }

.slds-path__item.slds-is-current,
.slds-path__item.slds-is-current::before,
.slds-path__item.slds-is-current::after { background: var(--slds-surface-1); }
.slds-path__item.slds-is-current::before { border-top: var(--slds-border-width-2) solid var(--slds-brand-30); }
.slds-path__item.slds-is-current::after  { border-bottom: var(--slds-border-width-2) solid var(--slds-brand-30); }
.slds-path__item.slds-is-current .slds-path__link {
  color: var(--slds-brand-30);
  font-weight: var(--slds-font-weight-bold);
}

.slds-path__stage-name {
  display: block;
  font-weight: var(--slds-font-weight-bold);
  margin: var(--slds-space-small) 0;
}
```

**Procus mapping.** Model the procurement workflow as the Path: `Request → Approval → Sourcing
→ PO Issued → Received → Invoiced`. Stages behind the current one are `_complete` (green),
the active one is `_current` (white with the blue outline), stages ahead are `_incomplete`
(grey). Three states only — do not invent a fourth colour.

---

## 13. Progress indicator / progress bar

For linear, non-branching processes where the Path is too heavy.

**Measured:**

| Property | Value |
|---|---|
| `.slds-progress` | `max-width: 70%; width: 100%; margin: auto; position: relative` |
| Track | `height: 0.5rem` (medium); background `#c9c9c9`; no border |
| Track sizes | x-small `0.125rem`, small `0.25rem`, medium `0.5rem`, large `0.75rem` |
| `_circular` | `border-radius: 0.5rem` on track and value |
| Value fill | `background: #0176d3`; `_success` variant `#2e844a` |
| Step marker | `1rem` square, `border-radius: 50%`, background `#747474`, `border: 4px solid #ffffff` |
| List | `display: flex; justify-content: space-between; align-items: center` |

```css
.slds-progress-bar {
  display: block; width: 100%; height: 0.5rem;
  background: var(--slds-neutral-80);
  border: 0; position: relative; overflow: hidden;
}
.slds-progress-bar_circular,
.slds-progress-bar_circular .slds-progress-bar__value { border-radius: var(--slds-radius-large); }
.slds-progress-bar__value { display: block; height: 100%; background: var(--slds-accent); }
.slds-progress-bar__value_success { background: var(--slds-success); }

.slds-progress { position: relative; width: 100%; max-width: 70%; margin: auto; }
.slds-progress__list {
  display: flex; align-items: center; justify-content: space-between;
  list-style: none; margin: 0; padding: 0;
  position: relative; z-index: 1;
}
.slds-progress__marker {
  display: flex; align-items: center; justify-content: center;
  width: 1rem; height: 1rem;
  border-radius: var(--slds-radius-circle);
  background: var(--slds-neutral-50);
  border: var(--slds-border-width-4) solid var(--slds-surface-1);
}
.slds-progress__item.slds-is-completed .slds-progress__marker { background: var(--slds-accent); }
.slds-progress__marker:focus-visible { box-shadow: var(--slds-shadow-focus-outset); outline: 0; }
```

---

## 14. Empty / illustration states

**Measured:**

| Property | Value |
|---|---|
| Container | `text-align: center` |
| `_small` graphic | `max-width: 300px; max-height: 200px; margin-bottom: 1rem` |
| `_large` graphic | `max-width: 600px; max-height: 400px; margin-bottom: 3rem` |
| `_large` header | `margin-bottom: 1.5rem`; paragraph `margin-bottom: 3rem` |
| Illustration stroke/fill primary | `#90d0fe` (cloud-blue-80) |
| Illustration stroke/fill secondary | `#cfe9fe` (cloud-blue-90) |

Procus has no illustration library, so use a large muted glyph in the same two blues and keep
the SLDS layout: graphic → heading → one sentence → one action.

```css
.slds-illustration { text-align: center; padding: var(--slds-space-xx-large) var(--slds-space-medium); }
.slds-illustration__svg { width: 100%; max-width: 300px; max-height: 200px; margin-bottom: var(--slds-space-medium); }
.slds-illustration_large .slds-illustration__svg { max-width: 600px; max-height: 400px; margin-bottom: var(--slds-space-xx-large); }
.slds-illustration__header {
  font-size: var(--slds-font-size-5);
  font-weight: var(--slds-font-weight-bold);
  line-height: var(--slds-line-height-heading);
  margin-bottom: var(--slds-space-x-small);
}
.slds-illustration__text { color: var(--slds-text-weak); margin-bottom: var(--slds-space-large); }
.slds-illustration__stroke-primary   { stroke: var(--slds-brand-70); }
.slds-illustration__stroke-secondary { stroke: var(--slds-brand-90); }
.slds-illustration__fill-primary     { fill:   var(--slds-brand-70); }
.slds-illustration__fill-secondary   { fill:   var(--slds-brand-90); }
```

---

## 15. Design principles → concrete rules

SLDS names four principles: **Clarity, Efficiency, Consistency, Beauty**. Salesforce's own
definitions — *clarity* eliminates ambiguity so people can see, understand and act with
confidence; *efficiency* streamlines workflows and anticipates needs; *consistency* applies the
same solution to the same problem to strengthen intuition; *beauty* is craftsmanship that
respects people's time and attention.

Salesforce's canonical wording is only served from the client-rendered SLDS site, which returns
no fetchable text. The phrasing above was reconciled across secondary write-ups and matches the
long-standing Salesforce formulation, but **the exact wording is `[UNVERIFIED]` against a
primary source**. The rules below are what those principles mean for Procus, and *those* are
derived from measured SLDS behaviour.

### Clarity

* **Do** give every status exactly one encoding — colour **plus** a word. `theme_error` red with
  the label "Rejected". Never colour alone.
* **Do** keep 13px body text at `#181818` (17.8:1). Use `#444444` (9.7:1) for secondary and
  `#747474` (4.7:1) as the absolute floor. **Don't** go to `#939393` — it is 3.07:1 and fails AA.
* **Don't** use `.slds-theme_info`'s stock grey for informational state; it is indistinguishable
  from `theme_offline`. Procus overrides it to brand blue (§2.4).
* **Do** truncate with `.slds-truncate` and put the full value in `title=`. **Don't** wrap text
  in a dense table — wrapping rows destroys the vertical rhythm that makes a table scannable.

### Efficiency

* **Do** target **32px rows** (`0.25rem 0.5rem` cell padding + 13px text). That is the SLDS
  dense default and the reason Lightning fits ~25 rows on a laptop screen.
* **Do** put the primary action as the rightmost `_brand` button in the page header, and
  per-row actions behind a `2rem` icon button at the end of the row.
* **Don't** pad a data table to "breathe". Whitespace belongs *between* regions (`1rem` card
  gaps), not inside rows.
* **Do** make the whole `th` a `.slds-th__action` button so sorting is one click anywhere in
  the header cell.

### Consistency

* **Do** use **one radius**: `0.25rem` for every rectangle (buttons, cards, inputs, tabs,
  toasts). `15rem` only for badges. `0.125rem` only for focus rings on inline text.
* **Do** use **one focus ring**: `0 0 0 2px #0b5cab`, or the outset variant on dark/tinted
  surfaces. **Never** `outline: none` without a replacement.
* **Do** use **one elevation per role**: `shadow-1` for cards and the page header, `shadow-2`
  for dropdowns, `shadow-3` for modals and toasts. Four shadows total, no more.
* **Don't** introduce a hex. If you typed `#` outside the `:root` block in §2, it is a bug.
* **Do** keep the two-border discipline: `#c9c9c9` for structure (tables, cards, dividers),
  `#747474` for interactive control edges (buttons, inputs, pills). Mixing them is the fastest
  way to make an app look un-Salesforce.

### Beauty

* **Do** reserve saturated fills for meaning. Brand blue on exactly one button per view; solid
  status fills in banners only; soft tinted badges inside tables.
* **Do** give money columns `text-align: right` and `font-variant-numeric: tabular-nums`.
  (SLDS itself never sets this — 0 occurrences — but misaligned currency is the loudest
  "not a real enterprise app" signal there is.)
* **Don't** animate longer than `0.2s` for state changes. SLDS tokenises `0.1s` (quickly) and
  `0.2s` (promptly); the Path's label flip is `0.2s linear`. Nothing in an enterprise app
  should ease for half a second.
* **Do** honour `prefers-reduced-motion` and drop every transition to `0.01ms`.

### Accessibility floor (all verified by computation against §2 values)

| Requirement | How Procus meets it |
|---|---|
| Body text ≥ 4.5:1 | `#181818` on `#ffffff` = **17.76:1**; on `#f3f3f3` = **16.0:1** |
| Secondary text ≥ 4.5:1 | `#444444` = **9.74:1**; `#747474` = **4.67:1** |
| Links ≥ 4.5:1 | `#0b5cab` = **6.70:1** |
| Button fills ≥ 4.5:1 | brand **4.63:1**, destructive **6.73:1**, success **4.65:1**, warning (dark text) **5.80:1** |
| Non-text/control borders ≥ 3:1 | `#747474` = **4.67:1** ✓. `#c9c9c9` = **1.66:1** ✗ — structural only, never a control edge |
| Focus visible | `--slds-shadow-focus` on every interactive element; `:focus-visible`, never `:focus` alone |
| Hit target | `2.75rem` (44px) is the SLDS token; `2rem` (32px) is the documented dense minimum and what row-level icon buttons use |
| Colour never alone | every status badge carries a text label |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 16. Sources

Fetched and read directly:

* `https://registry.npmjs.org/@salesforce-ux/design-system/latest` — resolved current release
  **2.264.1 / "Summer '26"** and its token dependency versions.
* `https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/assets/styles/salesforce-lightning-design-system.css`
  — the shipped stylesheet (1.09 MB). **Every component measurement in §4–§14 and the `:root`
  colour values in §2 were read from this file.**
* `https://registry.npmjs.org/@salesforce-ux/design-tokens/-/design-tokens-4.1.0.tgz` —
  `dist/themes/lightning-blue/{global,reference}.tokens.css` and `dist/themes/cosmos/…` for the
  `--slds-g-*` / `--slds-r-*` ramps, spacing, sizing, shadow and duration scales.
* `https://registry.npmjs.org/@salesforce-ux/design-system-primitive-tokens/-/design-system-primitive-tokens-0.3.7.tgz`
  — `design-tokens/**` for the SLDS 1 named ramps (`x-small`…`xx-large`), the font-size aliases
  and `SQUARE_TAPPABLE`.
* `https://trailhead.salesforce.com/content/learn/modules/lightning-design-system-development-for-designers/get-started-with-slds`
  — Salesforce's own SLDS overview. Confirms SLDS encodes Salesforce UX principles but does
  **not** enumerate the four by name.

Attempted and failed (recorded so nobody retries them):

* `https://www.lightningdesignsystem.com/…` — client-rendered SPA, returns an empty document.
  This is why the token values were taken from the npm artifacts instead.
* `https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-custom-properties.html`
  — HTTP 403 to non-browser clients.

Secondary (used only for the principle *wording* in §15, flagged `[UNVERIFIED]`): general
write-ups of the four SLDS principles, cross-checked for agreement. No colour, size or spacing
value in this document comes from a secondary source.
