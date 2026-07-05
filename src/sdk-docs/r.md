Install the GlitchTip R package:

```r
pak::pak("hyperverse-r/glitchtipr")
```

Add your DSN to your `.Renviron` file:

```bash
GLITCHTIP_DSN=https://KEY@glitchtip.example.com/PROJECT_ID
```

Initialize the package early in your application:

```r
library(glitchtipr)

gt <- gt_connect()
```

Capture errors around code you want to monitor:

```r
gt_capture(gt, {
  stop("Test GlitchTip error")
})
```

## Plumber

For plumber2 applications, use the `@capture` tag:

```r
#* @capture
#* @get /plot
function(request, query) {
  generate_plot(query$bins)
}
```

## Tips

- `gt_connect()` reads `GLITCHTIP_DSN` from the environment.
- If no DSN is configured, the package remains inactive, which is useful for local development.
- Errors are reported and then re-raised so your framework can handle them normally.
