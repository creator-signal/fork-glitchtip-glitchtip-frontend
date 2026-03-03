Install the **NuGet** package:

Package Manager:

```shell
Install-Package Sentry.AspNetCore
```

.NET Core CLI:

```shell
dotnet add package Sentry.AspNetCore
```

## Configuration

In your `Program.cs`, add `UseSentry` to the web host builder:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseSentry(o =>
{
    o.Dsn = "YOUR_DSN";
    o.TracesSampleRate = 0.01;
    o.AutoSessionTracking = false;
});

var app = builder.Build();
app.MapGet("/", () => "Hello World!");
app.Run();
```

- **TracesSampleRate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.
- **AutoSessionTracking** - Not supported by GlitchTip. Set to `false`.

## Verify

Create a route that throws an exception:

```csharp
app.MapGet("/debug-sentry", () =>
{
    throw new Exception("My first GlitchTip error!");
});
```

Visit `/debug-sentry` in your browser. The error should appear in GlitchTip within a few seconds.
