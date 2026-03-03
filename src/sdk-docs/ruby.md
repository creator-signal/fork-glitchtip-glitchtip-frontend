## Installation

Install the SDK via Rubygems by adding it to your Gemfile:

```ruby
gem "sentry-ruby"
```

## Configuration

Configure the SDK with your DSN. The SDK also honors the `SENTRY_DSN` environment variable. You can find your DSN in GlitchTip under project settings.

```ruby
Sentry.init do |config|
  config.dsn = 'YOUR_DSN_HERE'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]
  config.traces_sample_rate = 0.01
end
```
