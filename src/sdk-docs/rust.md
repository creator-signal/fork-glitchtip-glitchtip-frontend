GlitchTip is an open-source alternative to Sentry that works seamlessly with the Sentry Rust SDK.

# Step 1: Include the SDK via Cargo

`cargo add sentry`

# Step 2: Initialize the SDK

Add the following code to your main.rs (or where relevant to run as soon as possible)

```rust
let _guard = sentry::init("YOUR_DSN");
```

# Step 3: Verify Error Reporting

The quickest way to verify Sentry in your Rust application is to cause a panic:

```rust
fn main() {
    let _guard = sentry::init("YOUR_DSN");

    // GlitchTip will capture this
    panic!("Oh no, an error!");
}
```

# Additional settings

The Rust SDK accepts various configuration options. Here's an example that sets the release name.

```rust
let _guard = sentry::init((
    "YOUR_DSN",
    sentry::ClientOptions {
        release: sentry::release_name!(),
        ..Default::default()
    },
));
```
