# Creator Signal GlitchTip frontend

The Creator Signal fork keeps its authentication UI in this directory. The
normal GlitchTip application and generic OIDC client remain upstream code.

The Creator Signal build replaces only the public authentication routes:

- `/login` renders the Creator Signal ZITADEL-only page.
- `/register` redirects to `/login`.
- `/reset-password` and its child paths redirect to `/login`.

The login page trusts only a provider whose API provider ID is exactly
`zitadel`; a display-name match is deliberately insufficient. If reconciliation
has not created that provider, the page fails closed with a configuration
message and does not expose password controls.

`Dockerfile.prod` consumes the named `creator-signal-backend` build target.
`docker-bake.hcl` builds that target from the pinned Creator Signal backend
commit and feeds it directly into the frontend image, so the published image is
the complete GlitchTip runtime without requiring cross-repository package
credentials or falling back to the upstream GitLab backend image.
