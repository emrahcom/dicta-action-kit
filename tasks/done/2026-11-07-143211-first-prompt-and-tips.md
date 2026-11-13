# First prompt and tips

Add a sample first prompt and tips from real sessions to
`docs/getting-started.md` in the harness, as `harness.md` (Contents, Checking a
harness run) describes. Short and easy to read: the prompt in step 2 of Steps,
the tips as a short list in a section of their own, one or two sentences each.

The prompt uses the guides' own example site, `recipe-box`: its short name,
where its code is, the running site, and a request to study the site and propose
the capabilities.

The tips, from the example site's sessions:

- Say at the start what you want, such as "do not integrate the module yet".
- Say where the site's code is, or that you only have the running site.
- Review the capability list before you approve it: the agent stops there.
- Trying requests needs the module in the site; without integration, the agent
  stops after the check.

Check: `npm run check` in the harness passes.
