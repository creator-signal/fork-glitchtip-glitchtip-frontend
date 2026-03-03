Install `sentry-sdk` into your Django project:

```bash
$ pip install --upgrade sentry-sdk
```

To configure the SDK, initialize it with the Django integration in your `settings.py` file:

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="YOUR_DSN",
    integrations=[DjangoIntegration()],
    auto_session_tracking=False,
    traces_sample_rate=0,
    # enable_logs=True,
)
```

You can verify your SDK installation by creating a route that triggers an error:

```py
from django.urls import path

def trigger_error(request):
    division_by_zero = 1 / 0

urlpatterns = [
    path('glitchtip-debug/', trigger_error),
    # ...
]
```

Visiting this route will trigger an error that will be captured by GlitchTip.

## Configuration

Here is a more robust configuration example:

```python
sentry_sdk.init(
    dsn="YOUR_DSN",
    integrations=[DjangoIntegration()],
    auto_session_tracking=False,
    traces_sample_rate=0.01,
    # enable_logs=True,
    release="1.0.0",
    environment="production",
)
```

- **dsn** - Where to send event data to. Found in GlitchTip under project settings.
- **integrations** - Platform integrations such as DjangoIntegration and CeleryIntegration.
- **auto_session_tracking** - Not supported by GlitchTip. Set to `False`.
- **traces_sample_rate** - Percent of requests sent to GlitchTip as performance monitoring transactions. `0.01` means 1%. We recommend a low value to save costs and disk space.
- **enable_logs** - Optionally enable [log collection](/documentation/logs) to view application logs alongside your errors in GlitchTip.
- **release** - Set release name such as "1.0". Defaults to environment variable `SENTRY_RELEASE`.
- **environment** - Set the running environment name, such as "production". Defaults to environment variable `SENTRY_ENVIRONMENT`.
- **send_default_pii** - Set to `True` to send additional PII event data. Defaults to `False`.
- **debug** - Set to `True` to view more information about the SDK when something goes wrong. Defaults to `False`.

## Content Security Policy Reporting

Using Content Security Policy (CSP)? Send reports to GlitchTip. Set your website's CSP `report-uri` directive to the GlitchTip Security Endpoint.

Django 6.0+ includes built-in CSP support. In `settings.py` set:

```python
SECURE_CSP = {
    # ...
    "report-uri": ["your Security Endpoint here"],
}
```
