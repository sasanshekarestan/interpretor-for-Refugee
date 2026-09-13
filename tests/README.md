# Tests

```
npm test                      build, then run everything
npm test -- cookie back       only the suites whose names contain these
npm test -- --no-build        against whatever is already in dist/
npm run serve                 serve dist/ on :4173 to poke at by hand
```

Playwright against a real build, at 390px (a cheap phone) and 1280px, with the
API stubbed by `page.route()` so anything answered by the model appears as the
literal string `FROM_THE_MODEL`.

These suites used to live in a scratch directory outside the repository. Only
whoever was in that session could run them, and when the session ended they
were gone, while `CLAUDE.md` went on telling people to run eleven suites nobody
could find. A test that is not in the repository does not exist.

## What each one is for

| Suite | Guards |
| --- | --- |
| `design-guard` | The palette, the type floor, and the claim that the design system is finished. No browser. |
| `library-test` | Every form card opens its document, or says honestly why it cannot. No parser error reaches a person. |
| `cookie-test` | Nothing loads before someone answers. Refusing is as easy as agreeing. |
| `back-test` | The back control, browser back and forward, and that a new screen opens at its top. |
| `cursor-test` | Every control on five screens shows the hand, and no disabled one does. |
| `docs-test` | My Documents stores on the device and clears completely. |
| `favicon-test` | The icons exist, at the right sizes, and the manifest points at them. |
| `cache-test`, `gp-cache-test`, `hc5-test` | The written Persian guidance is served, and the model is never asked for what we already wrote. |
| `error-test` | Failures say what happened, in both languages. |
| `speech-test` | Voice input and spoken output. |
| `export-test` | The transcript file a person downloads. |

## Two things that will trip you up

**Build before testing.** The server falls back to `index.html` for any path it
cannot find, exactly as Vercel does. A guidance file that is not in `dist/`
comes back as an HTML page with status 200, the app decides the cache is
unavailable and quietly asks the model instead. `npm test` builds for you;
`--no-build` is the one that will lie to you.

**The cookie notice is a tap trap.** It sits over the bottom of the screen, so
every suite except `cookie-test` seeds a refusal before the page loads:

```js
await page.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});
```

Without it, two unrelated suites time out and the reason is not obvious.

## The design guard is a ratchet

It records today's counts in `design-ceiling.json` and fails if any of them
rises. It does not fail on the debt that is already there, because most of the
app does not follow `design.md` yet and a check that fails on every run is a
check people learn to ignore.

```
node tests/design-guard.mjs            check
node tests/design-guard.mjs --accept   lower the ceiling after a sweep
```

Run `--accept` and commit the ceiling whenever you remove some. It only ever
goes down.

The rules with no ceiling, which are at zero and stay there: phantom `dir-rtl`
and `dir-ltr` classes, the NHS's blue anywhere in the app's own interface, and
any form declaring a document that is not in `public/forms`.
