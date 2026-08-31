# Shared guidance for the official forms

An official form is the same document for everyone who opens it. Box 3.1 of
ASF1 asks the same thing of the first person and of the ten-thousandth, so
there is no reason to pay the model to describe it again each time — and doing
so is also slower, and needs a connection.

Each file here holds the explanations for one form in one language:

    <formId>.<farsi|dari>.json

The app fetches a form's file when that form is opened, and after that every
box and every page in it is explained instantly, for free, from this data.
Anything not in the file is still explained on demand, so a missing or partial
file makes the app slower, never broken.

## Making one

With the app running and `GEMINI_API_KEY` set:

    npm run dev                              # one terminal
    npm run guide-cache -- nhs_hc1           # another
    npm run guide-cache -- nhs_hc1 --dari

It walks the form's own PDF, asks once per page and once per box, and writes
the answers here. It is resumable — run it again and it only asks for what is
missing — and it never deletes anything.

## Reading one

These files are the words every user will see, so they are kept in the repo
rather than in a hidden cache: read them, and correct anything clumsy or wrong
in the Persian by hand. A hand correction stays corrected — the generator
skips whatever is already there.
