Install the sentry-go SDK using [`go get`](https://golang.org/cmd/go/#hdr-Module_aware_go_get):

```bash
$ go get github.com/getsentry/sentry-go
```

Import and initialize the SDK early in your application's setup:

```go
import (
	"errors"
	"log"
	"time"
	"github.com/getsentry/sentry-go"
)

func main() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn:              "YOUR_DSN",
		TracesSampleRate: 0.01,
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
	// Flush buffered events before the program terminates
	defer sentry.Flush(2 * time.Second)
}
```

- **TracesSampleRate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.

Verify the SDK is sending errors to GlitchTip from your Go application by capturing an error:

```go
sentry.CaptureException(errors.New("my error"))
```

The `defer sentry.Flush()` ensures events are sent before the program exits.
```
