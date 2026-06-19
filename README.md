# QuickShip Customer Profile - Google Apps Script

This is the Google Apps Script version of the QuickShip customer profiling app. It has two pages:

- **Data Entry**: saves customer profile records into Google Sheets.
- **Lookup**: fetches saved records by QS Code and Company Name.

The field list follows the attached `Detailed_Customer_Profiling_Sheet.xlsx`.

## Files

- `Code.gs` - Apps Script backend and Google Sheets logic.
- `App.html` - Apps Script web app layout.
- `Styles.html` - Premium QuickShip theme CSS.
- `JavaScript.html` - Browser logic using `google.script.run`.
- `index.html` - Static GitHub Pages helper page.
- `appsscript.json` - Apps Script manifest.
- `.clasp.json.example` - Example config for GitHub and clasp workflow.

## Setup In Google Apps Script

1. Go to [script.google.com](https://script.google.com).
2. Create a new Apps Script project.
3. Add the files from this folder:
   - `Code.gs`
   - `App.html`
   - `Styles.html`
   - `JavaScript.html`
   - `appsscript.json`
4. Run `setupQuickShipSheet()` once from the Apps Script editor.
5. Approve the requested Google permissions.
6. Copy the spreadsheet URL returned in the execution log if you want to inspect the data sheet.
7. Deploy:
   - Click **Deploy**.
   - Choose **New deployment**.
   - Select **Web app**.
   - Execute as: **Me**.
   - Who has access: choose your required audience.

## Use An Existing Google Sheet

If you already have a Google Sheet, run this from Apps Script:

```javascript
setQuickShipSheet('YOUR_SPREADSHEET_ID', 'Customer Profiles');
```

The spreadsheet ID is the value between `/d/` and `/edit` in a Google Sheets URL.

## GitHub Workflow With clasp

Install and log in:

```bash
npm install -g @google/clasp
clasp login
```

Create or link an Apps Script project:

```bash
cp .clasp.json.example .clasp.json
```

Edit `.clasp.json` and paste your Apps Script project ID, then push:

```bash
clasp push
```

For GitHub, commit this folder. Keep `.clasp.json` private because it is project-specific.

## GitHub Pages 404 Note

GitHub Pages requires a lowercase `index.html` file. This project includes one, but it is only a static helper page.

The working QuickShip form must run from the Apps Script web app deployment URL because GitHub Pages cannot run Apps Script functions such as `google.script.run`.

## Notes

- No service account is needed.
- Data is saved under the `Customer Profiles` tab.
- The app automatically creates headers and freezes the header row.
- Lookup accepts either QS Code, Company Name, or both.
