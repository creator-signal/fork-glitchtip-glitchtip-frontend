It is recommended to use an integration for your particular ASGI framework if available, as those are easier to use and capture more useful information.

If you use an ASGI framework not directly supported by the SDK, or wrote a raw ASGI app, you can use this generic ASGI middleware. It captures errors and attaches a basic amount of information for incoming requests.

```python
import sentry_sdk
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

from myapp import asgi_app

sentry_sdk.init(
    dsn="YOUR_DSN",
    auto_session_tracking=False,
    traces_sample_rate=0.01,
)

asgi_app = SentryAsgiMiddleware(asgi_app)
```
