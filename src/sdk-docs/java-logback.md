### Installation

Using Maven:

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-logback</artifactId>
</dependency>
```

Using Gradle:

```groovy
implementation 'io.sentry:sentry-logback'
```

Check the [central Maven repository](https://search.maven.org/artifact/io.sentry/sentry-logback) for the latest version.

### Usage

The following example configures a `ConsoleAppender` that logs to standard out at the `INFO` level and a `SentryAppender` that logs to GlitchTip at the `WARN` level.

Example configuration using the `logback.xml` format:

```xml
<configuration>
    <!-- Configure the Console appender -->
    <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Configure the Sentry appender, overriding the logging threshold to the WARN level -->
    <appender name="Sentry" class="io.sentry.logback.SentryAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>WARN</level>
        </filter>
    </appender>

    <root level="INFO">
        <appender-ref ref="Console" />
        <appender-ref ref="Sentry" />
    </root>
</configuration>
```

**Configure your DSN** using the `SENTRY_DSN` environment variable or programmatically via `Sentry.init()`.
