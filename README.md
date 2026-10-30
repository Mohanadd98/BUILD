# BinaaHub

A construction quantity calculator for iPhone and Android, in Arabic and English.
Phase 1, Egypt edition. Everything is stored on the phone; there is no account and no internet server.

| Calculator        | Status   |
| ----------------- | -------- |
| Concrete          | Ready    |
| Bricks and blocks | Ready    |
| Plaster           | Ready    |
| Tiles             | Next     |
| Paint             | Planned  |
| Save project      | Planned  |

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
git clone https://github.com/mohanadd98/build.git binaahub
cd binaahub
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
cd binaahub
git pull
npm install
npx expo start
```

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
  app/          one file per screen (home, concrete, blocks, plaster, settings)
  calc/         the formulas only, no screens; this is what the tests check
  config/       materials.ts, all ratios and coverage values
  components/   shared buttons, number boxes, result cards
  i18n/         English (en.ts) and Arabic (ar.ts) text
  state/        language and light/dark preference, saved on the phone
  theme/        colours and sizes
__tests__/      unit tests, one file per calculator
```

## Technology

React Native with Expo (SDK 58), TypeScript, and Expo Router. One codebase runs on both iOS and Android.
