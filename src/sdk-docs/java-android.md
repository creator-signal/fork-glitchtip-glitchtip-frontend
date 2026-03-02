### Configure your Gradle file

In your top-level `build.gradle` file, make sure that Maven Central is added as a repository:

```groovy
repositories {
    mavenCentral()
}
```

Then, add `sentry-android` to your `app/build.gradle` dependencies:

```groovy
dependencies {
    implementation 'io.sentry:sentry-android'
}
```

Check the [central Maven repository](https://search.maven.org/artifact/io.sentry/sentry-android) for the latest version.

### Configure your Android manifest

Add this `<meta-data>` tag inside the `<application>` element of your `AndroidManifest.xml`:

```xml
<application>
  <meta-data android:name="io.sentry.dsn" android:value="YOUR_DSN" />
</application>
```

### Verify

Open up `MainActivity.java` and throw an exception:

```java
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import java.lang.Exception;
import io.sentry.Sentry;

public class MainActivity extends AppCompatActivity {
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    try {
      throw new Exception("Hello, GlitchTip!");
    } catch (Exception exception) {
      Sentry.captureException(exception);
    }
  }
}
```
