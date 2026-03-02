### Installation

Using Maven:

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-log4j2</artifactId>
</dependency>
```

Using Gradle:

```groovy
implementation 'io.sentry:sentry-log4j2'
```

Check the [central Maven repository](https://search.maven.org/artifact/io.sentry/sentry-log4j2) for the latest version.

### Usage

The following example configures a `ConsoleAppender` that logs to standard out at the `INFO` level and a `SentryAppender` that logs to GlitchTip at the `WARN` level.

Example configuration using the `log4j2.xml` format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration status="warn" packages="org.apache.logging.log4j.core,io.sentry.log4j2">
    <appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n" />
        </Console>

        <Sentry name="Sentry" />
    </appenders>

    <loggers>
        <root level="INFO">
            <appender-ref ref="Console" />
            <!-- Note that the Sentry logging threshold is overridden to the WARN level -->
            <appender-ref ref="Sentry" level="WARN" />
        </root>
    </loggers>
</configuration>
```

**Configure your DSN** using the `SENTRY_DSN` environment variable or programmatically via `Sentry.init()`.
