# GestureTrigger — Flick 3x to Open Claude

A native SwiftUI iPhone app that listens for **3 consecutive finger flicks in under 3 seconds** and launches the Claude AI app.

---

## How It Works

| File | Role |
|------|------|
| `FlickDetector.swift` | Core logic — tracks flick timestamps, fires when 3 flicks happen within 3s |
| `ContentView.swift` | Full-screen drag gesture listener + animated UI feedback |
| `GestureTriggerApp.swift` | App entry point |

**Gesture detection:**
- Any swipe ≥ 30 points in any direction counts as one flick
- `FlickDetector` keeps a sliding 3-second window of flick timestamps
- 3 flicks inside that window → `UIApplication.open("claude://")` is called
- Falls back to the Claude App Store page if Claude isn't installed

---

## Requirements

- iOS 17.0+
- Xcode 15+
- Claude app installed on device (optional — falls back to App Store)

## Setup

1. Open `GestureTrigger.xcodeproj` in Xcode
2. Set your Team in **Signing & Capabilities**
3. Change `PRODUCT_BUNDLE_IDENTIFIER` to something unique (e.g. `com.yourname.GestureTrigger`)
4. Build & run on your iPhone

---

## Limitation — Why This Isn't "Always-On"

iOS **does not allow** third-party apps to intercept gestures system-wide while in the background. Only Apple system services (Siri, AssistiveTouch) have that privilege.

**The always-on alternative — Back Tap (zero code required):**

1. **Settings → Accessibility → Touch → Back Tap**
2. Set **Triple Tap** → **Open App** (or create a Shortcut first)
3. Create a Shortcut: Shortcuts app → **+** → Add Action → **Open App** → Claude
4. Assign that Shortcut to Triple Tap

Triple-tapping the back of your iPhone will open Claude from anywhere, even the lock screen.

> This works on iPhone 8 and later running iOS 14+.
