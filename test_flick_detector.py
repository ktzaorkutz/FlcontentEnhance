#!/usr/bin/env python3
"""Unit tests for the finger flick detection logic (no microphone required)."""

import collections
import time
import unittest
from unittest.mock import patch, MagicMock

# Patch sounddevice before importing the module so no audio device is needed
import sys
sys.modules["sounddevice"] = MagicMock()

import finger_flick_detector as ffd


class TestFlickWindow(unittest.TestCase):
    def setUp(self):
        ffd.flick_times.clear()
        ffd.last_flick_time = 0.0
        ffd.in_transient = False

    def _record(self, ts):
        """Call record_flick and return trigger count."""
        triggered = []
        with patch("finger_flick_detector.open_claude") as mock_open, \
             patch("threading.Thread") as mock_thread:
            mock_thread.return_value = MagicMock()
            ffd.record_flick(ts)
            return mock_thread.called  # True if trigger fired

    def test_three_flicks_within_window_triggers(self):
        base = time.monotonic()
        self._record(base)
        self._record(base + 1.0)
        triggered = self._record(base + 2.0)
        self.assertTrue(triggered, "3 flicks within 3s should trigger")

    def test_three_flicks_outside_window_no_trigger(self):
        base = time.monotonic()
        self._record(base)
        self._record(base + 1.5)
        triggered = self._record(base + 3.5)  # > 3s from first flick
        self.assertFalse(triggered, "3 flicks spanning >3s should NOT trigger")

    def test_flick_queue_cleared_after_trigger(self):
        base = time.monotonic()
        self._record(base)
        self._record(base + 0.5)
        self._record(base + 1.0)   # trigger fires, queue clears
        self.assertEqual(len(ffd.flick_times), 0, "Queue should clear after trigger")

    def test_two_flicks_no_trigger(self):
        base = time.monotonic()
        self._record(base)
        triggered = self._record(base + 1.0)
        self.assertFalse(triggered, "Only 2 flicks should not trigger")

    def test_old_flicks_purged(self):
        base = time.monotonic()
        # Inject two stale flicks and one recent flick manually
        ffd.flick_times.append(base - 4.0)  # outside window
        ffd.flick_times.append(base - 3.5)  # outside window
        ffd.flick_times.append(base - 0.5)  # inside window
        # record_flick at `base` should purge the two stale entries
        self._record(base)
        # Queue should now have only: base-0.5, base
        self.assertEqual(len(ffd.flick_times), 2)


class TestTransientDuration(unittest.TestCase):
    """Verify that duration gating in audio_callback works correctly."""

    def setUp(self):
        ffd.flick_times.clear()
        ffd.last_flick_time = 0.0
        ffd.in_transient = False
        ffd.transient_start = 0.0
        ffd.transient_peak = 0.0

    def _make_block(self, peak_value, frames=512):
        import numpy as np
        block = np.zeros((frames, 1), dtype="float32")
        block[frames // 2, 0] = peak_value
        return block

    def test_valid_flick_detected(self):
        """A short, loud transient should be counted as a flick."""
        with patch("finger_flick_detector.record_flick") as mock_record, \
             patch("time.monotonic") as mock_time:
            # Onset block
            mock_time.return_value = 1.000
            ffd.audio_callback(self._make_block(0.9), 512, None, None)
            self.assertTrue(ffd.in_transient)

            # Decay block (50 ms later — within valid range)
            mock_time.return_value = 1.050
            ffd.audio_callback(self._make_block(0.01), 512, None, None)  # below release threshold
            self.assertFalse(ffd.in_transient)
            mock_record.assert_called_once()

    def test_sustained_sound_ignored(self):
        """A sound lasting longer than MAX_FLICK_DURATION should be discarded."""
        with patch("finger_flick_detector.record_flick") as mock_record, \
             patch("time.monotonic") as mock_time:
            mock_time.return_value = 1.000
            ffd.audio_callback(self._make_block(0.9), 512, None, None)

            # Still above threshold after 150 ms — longer than max flick
            mock_time.return_value = 1.151
            ffd.audio_callback(self._make_block(0.9), 512, None, None)
            self.assertFalse(ffd.in_transient)
            mock_record.assert_not_called()

    def test_quiet_sound_ignored(self):
        """A sound below the amplitude threshold should not start a transient."""
        with patch("finger_flick_detector.record_flick") as mock_record, \
             patch("time.monotonic") as mock_time:
            mock_time.return_value = 1.000
            ffd.audio_callback(self._make_block(0.05), 512, None, None)  # below threshold
            self.assertFalse(ffd.in_transient)
            mock_record.assert_not_called()


if __name__ == "__main__":
    unittest.main(verbosity=2)
