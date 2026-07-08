Install the Perl Sentry SDK:

```bash
cpanm Sentry::SDK
```

Initialize the SDK early in your application:

```perl
use Sentry::SDK;

Sentry::SDK->init({
  dsn => "YOUR_DSN",
  traces_sample_rate => 0.01,
});
```

Verify your setup by capturing a test exception:

```perl
eval {
  die "Test GlitchTip error";
};

if ($@) {
  Sentry::SDK->capture_exception($@);
}
```

## Tips

- Set `release` and `environment` to track which deployments introduce errors.
- Set `traces_sample_rate` to a low value in production to save disk space. Most teams find 1-10% sufficient for useful [performance data](/documentation/performance).
