# BUILD

A construction quantity calculator for iPhone and Android, in Arabic and English.
Phase 1, Egypt edition. Everything is stored on the phone; there is no account and no internet server.

| Calculator        | Status   |
| ----------------- | -------- |
| Concrete          | Ready    |
| Bricks and blocks | Ready    |
| Plaster           | Ready    |
| Tiles             | Ready    |
| Paint             | Ready    |
| Save project      | Ready    |

## Run the app on your phone (first time, about 20 minutes)

You need a laptop (Windows or Mac) and your phone on **the same Wi-Fi network**.

### 1. Install the tools on your laptop (once)

1. **Node.js**: download the "LTS" version from <https://nodejs.org> and install it with the default options.
2. **Git**: download from <https://git-scm.com/downloads> and install with the default options.
3. **Expo Go** on your phone: search "Expo Go" in the App Store (iPhone) or Google Play (Samsung) and install it.

To check that it worked, open a terminal (Windows: "Command Prompt"; Mac: "Terminal") and type:

```
node -v
```

You should see a version number such as `v22.x.x`.

### 2. Download the project (once)

In the terminal, type these lines one at a time and press Enter after each:

```
git clone https://github.com/mohanadd98/build.git build
cd build
git checkout claude/binaahub-calculator-app-37hdvn
npm install
```

`npm install` downloads the libraries the app uses. It takes a few minutes the first time.

### 3. Start the app

```
npx expo start
```

A large QR code appears in the terminal.

* **iPhone**: open the normal Camera app, point it at the QR code, and tap the banner that appears.
* **Samsung / Android**: open Expo Go and tap "Scan QR code".

The app opens inside Expo Go. Leave the terminal open while you test. When you change any code, the app on your phone reloads by itself.

**If the phone cannot connect** (common on office or university Wi-Fi), stop the server with `Ctrl + C` and start it with:

```
npx expo start --tunnel
```

To stop the app, press `Ctrl + C` in the terminal.

### Getting the latest version later

```
cd build
git pull
npm install
npx expo start
```

## Saving projects

1. Open any calculator and enter the values.
2. Tap **Save to project**.
3. Type a new project name (for example "Villa Maadi") and tap **Create project and save**, or tap an existing project to add the calculation to it.
4. Open **Saved projects** on the home screen to see every saved calculation with its formulas.
5. **Share** sends the calculation as text through WhatsApp, email or any app on the phone.

**Important:** saved projects live only on this phone. Uninstalling the app or losing the phone deletes them. Use **Share** to keep a copy of anything important.

## Bill of quantities, prices and quotes

1. When saving a calculation, choose its **construction phase** (foundations, concrete structure, masonry, plastering, flooring, painting or other).
2. Open **Material prices** on the home screen and type your local unit prices. Leave a box empty for anything you do not price. Prices stay on this phone.
3. Open a saved project. The **Bill of quantities** adds up every material by phase and shows the cost of priced items.
4. Export it:
   * **Export BOQ as PDF**: a priced table to send or print.
   * **Export BOQ for Excel (CSV)**: opens in Excel or Google Sheets, Arabic included.
   * **Request quotes from contractors (PDF)**: the same quantities with empty price columns, for contractors to fill in.

Calculations saved before this feature have no materials list. Calculate and save them again to include them in the bill of quantities.

## Hot weather warning

The Concrete screen shows the highest air temperature forecast for the next 3 days at the site city. At 35 °C or more it warns that fresh concrete must not exceed 35 °C (ECP 203-2025 clause 2-3-1-6); from 30 °C it suggests hot weather precautions.

* Choose the city in **Settings**, or choose **Off** to keep BUILD fully offline.
* Only the city's public coordinates are sent to the free Open-Meteo service, never your location.
* Without internet the warning simply does not appear.
* Open-Meteo is free for non-commercial use only; a commercial release needs their paid plan or another provider.

## Check the formulas (unit tests)

Every formula has automatic tests that compare the app's answer with numbers worked out by hand.

```
npm test
```

You should see `Tests: ... passed`. If any test says `failed`, a formula no longer gives the expected answer.

## Change a mix ratio or coverage value

All material values are in **one file**: `src/config/materials.ts`.
Each value has a comment saying where it comes from and how reliable it is:

* **Code**: from a building code clause.
* **Practice**: common Egyptian site practice. Check it against your project specification.
* **Product**: depends on the brand. Use the value from the manufacturer's data sheet.
* **Geometry**: pure arithmetic.

Open the file in any text editor (VS Code is free: <https://code.visualstudio.com>), change the number, save, and the app updates. Then run `npm test`. Some tests check the default values, so update the expected numbers there too if you change a default on purpose.

## Folder map

```
src/
  app/          one file per screen (home, five calculators, save, projects, settings)
  calc/         the formulas only, no screens; this is what the tests check
  config/       materials.ts, all ratios and coverage values
  components/   shared buttons, number boxes, result cards
  i18n/         English (en.ts) and Arabic (ar.ts) text
  state/        language, light/dark preference and saved projects in memory
  storage/      saving projects and prices on the phone, PDF and CSV export
  theme/        colours and sizes
__tests__/      unit tests, one file per calculator plus project storage
```

## Technology

React Native with Expo (SDK 58), TypeScript, and Expo Router. One codebase runs on both iOS and Android.
