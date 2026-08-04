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
credentials or falling back to the upstream GitLab backend image. The pinned backend also
reconciles the six governed Creator Signal projects, including isolated Sales
Pulse Admin browser and server projects.

The combined-image layer also applies a fail-closed compatibility transform to
the async OAuth2 client. The pinned backend can resolve aiohttp 3.13, while the
installed allauth async client calls a helper introduced in aiohttp 3.14. The
transform uses the supported `BasicAuth(...).encode()` path present in the
pinned runtime and fails the image build if the expected source target changes
or the encoded header cannot be verified.
