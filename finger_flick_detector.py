#!/usr/bin/env python3
"""
Finger Flick Detector - Siri-like listening system
Listens for 3 consecutive finger flick sounds within 3 seconds and opens Claude.
"""

import sys
import time
import subprocess
import threading
import collections
import numpy as np
import sounddevice as sd

# ─── Configuration ──────────────────────────────────────────────────────────────

SAMPLE_RATE = 44100          # Hz
BLOCK_SIZE  = 512            # samples per audio callback (~11ms per block)
CHANNELS    = 1

# Flick detection thresholds
AMPLITUDE_THRESHOLD  = 0.15  # peak amplitude to count as a transient (0.0–1.0)
MIN_FLICK_DURATION   = 0.005 # seconds – minimum spike duration
MAX_FLICK_DURATION   = 0.12  # seconds – finger flicks are short (<120 ms)
COOLDOWN_SECONDS     = 0.15  # ignore new flicks immediately after one is detected

# Trigger parameters
REQUIRED_FLICKS      = 3     # number of consecutive flicks to trigger
WINDOW_SECONDS       = 3.0   # all flicks must occur within this window

# What to open when triggered
CLAUDE_COMMAND       = ["claude"]  # Claude Code CLI; change to e.g. ["xdg-open", "https://claude.ai"] for browser

# ─── State ──────────────────────────────────────────────────────────────────────

flick_times: collections.deque = collections.deque()
last_flick_time: float = 0.0
in_transient: bool = False
transient_start: float = 0.0
transient_peak: float = 0.0
lock = threading.Lock()

# ─── Helpers ────────────────────────────────────────────────────────────────────

def open_claude() -> None:
    """Launch Claude in a subprocess without blocking the audio thread."""
    print("\n[TRIGGER] 3 finger flicks detected — opening Claude!\n")
    try:
        subprocess.Popen(CLAUDE_COMMAND)
    except FileNotFoundError:
        # Fallback: open Claude in the default browser
        subprocess.Popen(["xdg-open", "https://claude.ai"])
    except Exception as exc:
        print(f"[ERROR] Could not open Claude: {exc}")


def record_flick(ts: float) -> None:
    """Record a detected flick timestamp and check the trigger window."""
    global flick_times

    now = ts
    # Purge flicks outside the rolling window
    while flick_times and now - flick_times[0] > WINDOW_SECONDS:
        flick_times.popleft()

    flick_times.append(now)
    count = len(flick_times)
    print(f"  [flick #{count}] t={now:.3f}s  (need {REQUIRED_FLICKS} in {WINDOW_SECONDS}s)")

    if count >= REQUIRED_FLICKS:
        flick_times.clear()
        # Fire in a daemon thread so audio keeps running
        threading.Thread(target=open_claude, daemon=True).start()


# ─── Audio callback ─────────────────────────────────────────────────────────────

def audio_callback(indata: np.ndarray, frames: int,
                   time_info, status) -> None:
    """Called by sounddevice on every audio block."""
    global in_transient, transient_start, transient_peak, last_flick_time

    if status:
        print(f"[warn] {status}", file=sys.stderr)

    now = time.monotonic()
    audio = indata[:, 0]                    # mono
    peak  = float(np.max(np.abs(audio)))

    with lock:
        if not in_transient:
            # ── Look for onset ──────────────────────────────────────────────
            if (peak >= AMPLITUDE_THRESHOLD
                    and (now - last_flick_time) > COOLDOWN_SECONDS):
                in_transient   = True
                transient_start = now
                transient_peak  = peak
        else:
            # ── We're inside a transient; track peak ────────────────────────
            if peak > transient_peak:
                transient_peak = peak

            duration = now - transient_start

            # Transient ended (amplitude fell back below threshold)
            if peak < AMPLITUDE_THRESHOLD * 0.4:
                if MIN_FLICK_DURATION <= duration <= MAX_FLICK_DURATION:
                    last_flick_time = now
                    record_flick(now)
                elif duration > MAX_FLICK_DURATION:
                    # Too long — probably speech or sustained noise
                    print(f"  [skip] transient too long ({duration*1000:.0f}ms)")
                in_transient = False

            elif duration > MAX_FLICK_DURATION:
                # Still above threshold after max duration → sustained sound, ignore
                print(f"  [skip] sustained sound ({duration*1000:.0f}ms)")
                in_transient = False


# ─── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 55)
    print("  Finger Flick Detector  —  listening for Claude trigger")
    print("=" * 55)
    print(f"  Snap/flick {REQUIRED_FLICKS}x within {WINDOW_SECONDS}s to open Claude")
    print(f"  Amplitude threshold : {AMPLITUDE_THRESHOLD}")
    print(f"  Max flick duration  : {MAX_FLICK_DURATION*1000:.0f} ms")
    print(f"  Cooldown            : {COOLDOWN_SECONDS*1000:.0f} ms")
    print(f"  Command             : {' '.join(CLAUDE_COMMAND)}")
    print("-" * 55)
    print("  Press Ctrl-C to quit.\n")

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            blocksize=BLOCK_SIZE,
            channels=CHANNELS,
            dtype="float32",
            callback=audio_callback,
        ):
            while True:
                time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n[stopped]")
    except sd.PortAudioError as exc:
        print(f"[ERROR] Audio device problem: {exc}")
        print("  Make sure a microphone is connected and accessible.")
        sys.exit(1)


if __name__ == "__main__":
    main()
