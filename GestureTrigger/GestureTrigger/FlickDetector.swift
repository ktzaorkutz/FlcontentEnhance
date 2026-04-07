import Foundation
import Combine

/// Detects 3 consecutive flicks (swipes in any direction) within a 3-second window.
/// Publishes a trigger event when the condition is met.
final class FlickDetector: ObservableObject {

    // MARK: - Configuration

    private let requiredFlicks = 3
    private let windowSeconds: TimeInterval = 3.0

    // MARK: - State

    @Published private(set) var flickCount: Int = 0
    @Published private(set) var triggered: Bool = false

    private var flickTimestamps: [Date] = []
    private var resetTimer: AnyCancellable?

    // MARK: - Public API

    /// Call this every time a flick gesture is detected.
    func recordFlick() {
        let now = Date()

        // Remove timestamps outside the 3-second window
        flickTimestamps = flickTimestamps.filter {
            now.timeIntervalSince($0) <= windowSeconds
        }

        flickTimestamps.append(now)
        flickCount = flickTimestamps.count

        scheduleReset()

        if flickTimestamps.count >= requiredFlicks {
            fire()
        }
    }

    func reset() {
        flickTimestamps = []
        flickCount = 0
        triggered = false
        resetTimer?.cancel()
    }

    // MARK: - Private

    private func fire() {
        triggered = true
        openClaudeApp()

        // Reset after brief delay so the UI can show feedback
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.reset()
        }
    }

    private func scheduleReset() {
        resetTimer?.cancel()
        resetTimer = Just(())
            .delay(for: .seconds(windowSeconds), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.reset()
            }
    }

    // MARK: - Claude App Launch

    private func openClaudeApp() {
        // Claude's URL scheme — falls back to App Store if not installed
        let claudeURL = URL(string: "claude://")!
        let appStoreURL = URL(string: "https://apps.apple.com/app/claude-ai/id6473753684")!

        DispatchQueue.main.async {
            if UIApplication.shared.canOpenURL(claudeURL) {
                UIApplication.shared.open(claudeURL)
            } else {
                UIApplication.shared.open(appStoreURL)
            }
        }
    }
}
