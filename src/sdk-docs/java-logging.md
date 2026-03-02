### Installation

Using Maven:

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry</artifactId>
</dependency>
```

Using Gradle:

```groovy
implementation 'io.sentry:sentry'
```

Check the [central Maven repository](https://search.maven.org/artifact/io.sentry/sentry) for the latest version.

### Usage

The following example configures a `ConsoleHandler` that logs to standard out at the `INFO` level and a `SentryHandler` that logs to GlitchTip at the `WARN` level.

Example configuration using the `logging.properties` format:

```ini
# Enable the Console and Sentry handlers
handlers=java.util.logging.ConsoleHandler,io.sentry.jul.SentryHandler

# Set the default log level to INFO
.level=INFO

# Override the Sentry handler log level to WARNING
io.sentry.jul.SentryHandler.level=WARNING
```

When starting your application, add the `java.util.logging.config.file` to the system properties:

```bash
java -Djava.util.logging.config.file=/path/to/app.properties MyClass
```

**Configure your DSN** using the `SENTRY_DSN` environment variable or programmatically via `Sentry.init()`.
