## Installation

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

## Configuration

Initialize Sentry as early as possible in your application:

```java
import io.sentry.Sentry;

public class MyClass {
    public static void main(String[] args) {
        Sentry.init(options -> {
            options.setDsn("YOUR_DSN");
            options.setTracesSampleRate(0.01);
        });

        // Or use the SENTRY_DSN environment variable:
        // Sentry.init();
    }
}
```

The DSN can be provided via:
- The `Sentry.init()` options
- The `SENTRY_DSN` environment variable
- The `sentry.dsn` Java system property
- A `sentry.properties` file in your classpath

## Capture an Error

```java
import io.sentry.Sentry;

try {
    throw new Exception("Hello, GlitchTip!");
} catch (Exception e) {
    Sentry.captureException(e);
}
```

## Send a Message

```java
Sentry.captureMessage("Something happened");
```

## Add Context

```java
import io.sentry.Sentry;
import io.sentry.protocol.User;

// Set user context
User user = new User();
user.setEmail("user@example.com");
Sentry.setUser(user);

// Add a breadcrumb
Sentry.addBreadcrumb("User clicked button");

// Set a tag
Sentry.setTag("page.locale", "en-us");

// Set extra data
Sentry.setExtra("character.name", "Mighty Fighter");
```
