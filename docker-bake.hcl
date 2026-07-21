variable "GITHUB_SHA" {
  default = "local"
}

target "backend" {
  context    = "https://github.com/creator-signal/fork-glitchtip-glitchtip-backend.git#284e8e65834ad4a4ad75f2c8d4be64e3f0e892f9"
  dockerfile = "Dockerfile"
  args = {
    IS_CI = "True"
  }
}

target "combined" {
  context    = "."
  dockerfile = "Dockerfile.prod"
  contexts = {
    creator-signal-backend = "target:backend"
  }
  args = {
    FRONTEND_GLITCHTIP_VERSION = GITHUB_SHA
  }
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]
  tags = [
    "ghcr.io/creator-signal/fork-glitchtip-glitchtip-frontend:master",
    "ghcr.io/creator-signal/fork-glitchtip-glitchtip-frontend:sha-${GITHUB_SHA}",
  ]
  labels = {
    "org.opencontainers.image.licenses"  = "MIT"
    "org.opencontainers.image.revision"  = GITHUB_SHA
    "org.opencontainers.image.source"    = "https://github.com/creator-signal/fork-glitchtip-glitchtip-frontend"
    "org.opencontainers.image.title"     = "fork-glitchtip-glitchtip-frontend"
  }
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
  output     = ["type=registry"]
  attest     = ["type=provenance,mode=max"]
}
