import SwiftUI

struct ContentView: View {

    @StateObject private var detector = FlickDetector()

    // Directions to listen for — covers all "flick" motions
    private let swipeDirections: [SwipeDirection] = [.up, .down, .left, .right]

    var body: some View {
        ZStack {
            background
            mainContent
        }
        .ignoresSafeArea()
        .gesture(combinedDragGesture)
        // Reset triggered banner automatically
        .onChange(of: detector.triggered) { triggered in
            // FlickDetector handles its own reset
        }
    }

    // MARK: - Background

    private var background: some View {
        Color(.systemBackground)
            .overlay(
                detector.triggered
                    ? Color.purple.opacity(0.15).animation(.easeIn(duration: 0.2), value: detector.triggered)
                    : Color.clear
            )
    }

    // MARK: - Main Content

    private var mainContent: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            Image(systemName: "hand.point.up.left.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .foregroundStyle(
                    detector.triggered
                        ? .purple
                        : (detector.flickCount > 0 ? .blue : .gray)
                )
                .scaleEffect(detector.triggered ? 1.3 : 1.0)
                .animation(.spring(response: 0.3, dampingFraction: 0.5), value: detector.triggered)

            // Status label
            VStack(spacing: 8) {
                Text(statusTitle)
                    .font(.title2.bold())
                    .foregroundStyle(detector.triggered ? .purple : .primary)
                    .animation(.easeInOut, value: detector.triggered)

                Text(statusSubtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }

            // Flick counter dots
            flickDots

            Spacer()

            instructionCard
        }
    }

    // MARK: - Flick Dots

    private var flickDots: some View {
        HStack(spacing: 16) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(index < detector.flickCount ? Color.blue : Color.gray.opacity(0.3))
                    .frame(width: 18, height: 18)
                    .scaleEffect(index < detector.flickCount ? 1.2 : 1.0)
                    .animation(.spring(response: 0.25, dampingFraction: 0.5), value: detector.flickCount)
            }
        }
    }

    // MARK: - Instruction Card

    private var instructionCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("How to trigger", systemImage: "info.circle")
                .font(.headline)

            VStack(alignment: .leading, spacing: 6) {
                instructionRow(number: "1", text: "Swipe (flick) anywhere on screen")
                instructionRow(number: "2", text: "Do it 3 times within 3 seconds")
                instructionRow(number: "3", text: "Claude opens automatically")
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .padding(.horizontal, 24)
        .padding(.bottom, 40)
    }

    private func instructionRow(number: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Text(number)
                .font(.caption.bold())
                .foregroundStyle(.white)
                .frame(width: 20, height: 20)
                .background(Circle().fill(Color.blue))
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Status Text

    private var statusTitle: String {
        if detector.triggered { return "Opening Claude..." }
        if detector.flickCount == 0 { return "Ready" }
        return "\(detector.flickCount) of 3 flicks"
    }

    private var statusSubtitle: String {
        if detector.triggered { return "Launching Claude AI" }
        if detector.flickCount == 0 { return "Flick 3 times quickly to open Claude" }
        return "Keep going! \(3 - detector.flickCount) more flick\(3 - detector.flickCount == 1 ? "" : "s") needed"
    }

    // MARK: - Gesture

    /// A drag gesture that fires on completion if the translation qualifies as a flick.
    private var combinedDragGesture: some Gesture {
        DragGesture(minimumDistance: 30, coordinateSpace: .global)
            .onEnded { value in
                let distance = sqrt(
                    pow(value.translation.width, 2) +
                    pow(value.translation.height, 2)
                )
                // Duration proxy: predictedEndLocation distance / translation distance
                // Just ensure it's a quick, decisive motion (velocity-like check)
                let speed = distance / max(value.time.timeIntervalSince(value.startLocation.x < 0 ? .now : .now), 0.001)

                // Accept any swipe ≥ 30pt as a flick
                if distance >= 30 {
                    detector.recordFlick()
                }
            }
    }
}

// MARK: - SwipeDirection (unused enum kept for readability)
private enum SwipeDirection { case up, down, left, right }

#Preview {
    ContentView()
}
