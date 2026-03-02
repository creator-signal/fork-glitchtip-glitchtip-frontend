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
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

app = FastAPI()
```

The SDK automatically detects FastAPI and enables the integration.

Set `traces_sample_rate` to a value between `0.0` and `1.0` to control the percentage of transactions captured for performance monitoring. Set `profiles_sample_rate` to enable profiling. Use `1.0` in development and lower values in production.

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
