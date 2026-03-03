# FastAPI

## Installation

Install the Sentry SDK:

```bash
pip install sentry-sdk
```

## Configuration

In your main application file (e.g., `main.py`), initialize the SDK before creating your FastAPI app:

```python
import sentry_sdk
from fastapi import FastAPI

sentry_sdk.init(
    dsn="YOUR_DSN",
    auto_session_tracking=False,
    traces_sample_rate=0.01,
    # enable_logs=True,
)

app = FastAPI()
```

The SDK automatically detects FastAPI and enables the integration.

- **auto_session_tracking** - Not supported by GlitchTip. Set to `False`.
- **traces_sample_rate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production to save costs and disk space. Use `1.0` during development to see all transactions.
- **enable_logs** - Optionally enable [log collection](/documentation/logs) to view application logs alongside your errors in GlitchTip.

## Verify

Add a test endpoint to trigger an error:

```python
@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0
```

Visit `/sentry-debug` in your browser. The error should appear in GlitchTip within a few seconds.

You can also send a test message manually:

```python
@app.get("/capture-message")
async def capture_message():
    sentry_sdk.capture_message("Test message from FastAPI")
    return {"message": "Message captured"}
```
