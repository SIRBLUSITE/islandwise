# Islandwise — send BSD within the Bahamas (demo)
Static HTML/CSS/JS, no build. Open `index.html` directly, or:
    cd /workspace/bahamas-wise && python3 -m http.server 8080   # http://localhost:8080
Simulated only — no real payments. Domestic BSD→BSD, no FX. Fee: B$0.99 + 0.37%.

## Banks + simulated bank linking
- `BANKS` in app.js: CBOB-licensed authorised-dealer banks (sources in code comment). Short codes are internal demo codes, not SWIFT/routing codes.
- Link bank modal (pick bank → DEMO sign-in, accepts anything, nothing stored → pick generated accounts → linked). Linked accounts: `localStorage["iw.linkedAccounts"]`; wallet: `localStorage["iw.walletBSD"]`. "Reset demo data" in the Banks section clears both.
- Send flow "Pay from" (linked account / islandwise balance / demo card / link new), with balance check. "Add money" pulls from a linked bank into the header wallet.
