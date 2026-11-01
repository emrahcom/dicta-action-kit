# Example site accessibility

Check the pages of `dicta-example-site` against WCAG 2.2 level AA, per
`example-site.md` (Structure), and fix what fails.

- Check at least: a page title and one `h1` on each page, a label for every
  form field, buttons and links named by their text or label, everything usable
  by keyboard with a visible focus indicator, enough contrast, and an API error
  that is announced (`role="alert"` or a status region).
- Browser tests, in Chromium only: each page can be used by keyboard alone (add
  a task, mark it done, open it, change it, share it), every form field has an
  accessible name, and an API error is announced.
- No new dependency for the checks.
