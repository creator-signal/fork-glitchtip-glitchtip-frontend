# Swift

## Installation

Add `swift-sentry` to your `Package.swift` dependencies:

```swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "your-app",
    platforms: [
       .macOS(.v12)
    ],
    dependencies: [
        .package(url: "https://github.com/swift-sentry/swift-sentry.git", from: "1.0.3"),
    ],
    targets: [
        .executableTarget(
            name: "your-app",
            dependencies: [
                .product(name: "SwiftSentry", package: "swift-sentry"),
            ]
        ),
    ]
)
```

## Configuration

Initialize Sentry in your application entry point:

```swift
import SwiftSentry

let sentry = try Sentry(dsn: "YOUR_DSN")
```

You can also read the DSN from an environment variable:

```swift
let dsn = ProcessInfo.processInfo.environment["SENTRY_DSN"] ?? ""
let sentry = try Sentry(dsn: dsn)
```

## Capturing Errors

Capture errors and exceptions:

```swift
do {
    try somethingThatMightFail()
} catch {
    sentry.capture(error: error)
}
```

## Shutdown

Call `shutdown()` before your application exits to ensure all events are sent:

```swift
try sentry.shutdown()
```

## Verify

Send a test error to confirm your setup:

```swift
enum AppError: Error, LocalizedError {
    case testError(String)

    var errorDescription: String? {
        switch self {
        case .testError(let message):
            return message
        }
    }
}

sentry.capture(error: AppError.testError("Hello from Swift!"))
try? await Task.sleep(nanoseconds: 2 * 1_000_000_000)
try sentry.shutdown()
```

The error should appear in GlitchTip within a few seconds.
