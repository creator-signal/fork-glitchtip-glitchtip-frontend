### Installation

Using Maven:

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-log4j</artifactId>
</dependency>
```

Using Gradle:

```groovy
implementation 'io.sentry:sentry-log4j'
```

Check the [central Maven repository](https://search.maven.org/artifact/io.sentry/sentry-log4j) for the latest version.

### Usage

The following example configures a `ConsoleAppender` that logs to standard out at the `INFO` level and a `SentryAppender` that logs to GlitchTip at the `WARN` level.

Example configuration using the `log4j.properties` format:

```ini
# Enable the Console and Sentry appenders
log4j.rootLogger=INFO, Console, Sentry

# Configure the Console appender
log4j.appender.Console=org.apache.log4j.ConsoleAppender
log4j.appender.Console.layout=org.apache.log4j.PatternLayout
log4j.appender.Console.layout.ConversionPattern=%d{HH:mm:ss.SSS} [%t] %-5p: %m%n

# Configure the Sentry appender, overriding the logging threshold to the WARN level
log4j.appender.Sentry=io.sentry.log4j.SentryAppender
log4j.appender.Sentry.threshold=WARN
```

Alternatively, using the `log4j.xml` format:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">
<log4j:configuration debug="true"
    xmlns:log4j='http://jakarta.apache.org/log4j/'>

    <!-- Configure the Console appender -->
    <appender name="Console" class="org.apache.log4j.ConsoleAppender">
        <layout class="org.apache.log4j.PatternLayout">
            <param name="ConversionPattern"
                   value="%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n" />
        </layout>
    </appender>

    <!-- Configure the Sentry appender, overriding the logging threshold to the WARN level -->
    <appender name="Sentry" class="io.sentry.log4j.SentryAppender">
        <filter class="org.apache.log4j.varia.LevelRangeFilter">
            <param name="levelMin" value="WARN" />
        </filter>
    </appender>

    <root level="INFO">
        <appender-ref ref="Console" />
        <appender-ref ref="Sentry" />
    </root>
</log4j:configuration>
```

**Configure your DSN** using the `SENTRY_DSN` environment variable or programmatically via `Sentry.init()`.
