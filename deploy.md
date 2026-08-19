Edited by Mengheng
# Deploying the Web Admin Dashboard (Portainer)

How to wire up CI + Portainer for `cinemate-web-backoffice` (the MOI TV /
CINEMATE admin dashboard — Vite + React SPA, built with pnpm), mirroring the
**exact pattern already used for `cinemate-api`** in this Portainer
environment: one Docker Hub image repo per environment (`*-dev` / `*-prod`),
each running as its own Swarm service with its own container, deployed
independently.

| | `cinemate-api` (existing) | `cinemate-web-backoffice` (this doc) |
|---|---|---|
| Docker Hub images | `docker.io/<user>/cinemate-api-dev`, `docker.io/<user>/cinemate-api-prod` | `docker.io/<user>/cinemate-admin-dev`, `docker.io/<user>/cinemate-admin-prod` |
| Portainer services | `cinemate-api-dev`, `cinemate-api-prod` | `cinemate-admin-dev`, `cinemate-admin-prod` |
| Trigger branch | `dev` → dev image, `main` → prod image | same |

**Shape of the deployment:** the image is a multi-stage build — a Node/pnpm
stage compiles the SPA to static files (`vite build` → `dist/`), and an nginx
stage serves those files and reverse-proxies `/api/*` to the matching
`cinemate-api` environment. See [Dockerfile](Dockerfile) and
[nginx.conf.template](nginx.conf.template), already added at the repo root.

## 0. Repo prerequisites (read before deploying)

- **Two lockfiles exist** (`package-lock.json` and `pnpm-lock.yaml`), but
  `pnpm-workspace.yaml` (with `allowBuilds` for `@tailwindcss/oxide` and
  `esbuild`) makes pnpm the intended package manager, and the Dockerfile
  builds with pnpm. Consider deleting `package-lock.json` so it can't drift
  out of sync with `pnpm-lock.yaml` and get used by accident.
- **`VITE_PROXY_TARGET` (in `.env`) only affects the local dev server** — it's
  read by the `server.proxy` block in [vite.config.ts](vite.config.ts) and
  has no effect on `vite build` or the production image. Production API
  routing is handled by nginx instead (see below), so nothing needs to be
  baked in at build time.
- **API calls go through `/api`.** [apiClient.ts](src/api/clients/apiClient.ts#L6)
  calls `import.meta.env.VITE_API_BASE_URL || '/api'`, and nothing sets
  `VITE_API_BASE_URL`, so it's always the relative `/api` prefix in
  production. `nginx.conf.template`'s `/api/` location proxies that straight
  through to `cinemate-api`, prefix and all — this must land on a route
  `cinemate-api` actually serves at `/api/...` (confirmed against how the dev
  proxy behaves: no path rewrite there either).
- **One image build serves both environments.** The Dockerfile doesn't bake
  in which backend to talk to — `API_PROXY_TARGET` is read at container
  *start*, not build time (see step 3). So "dev" vs "prod" here is purely
  about which image repo it's pushed to and which `cinemate-api-*` service it
  points at — not a build-time difference in the dashboard itself.

## 1. Build and test the image locally

Do this before wiring up CI — it proves the `Dockerfile` actually works and
lets you sanity-check the `/api` proxy without pushing anything.

1. **Build the image:**
   ```
   docker build -t cinemate-admin:local .
   ```
   This runs both Dockerfile stages: `pnpm install --frozen-lockfile` +
   `pnpm run build` in the `node:20-alpine` stage, then copies `dist/` into
   the `nginx:1.27-alpine` stage.

2. **Run it**, pointing `API_PROXY_TARGET` at a real `cinemate-api` you can
   reach from your machine (adjust host/port — no trailing path, no trailing
   slash):
   ```
   docker run --rm -p 8080:80 -e API_PROXY_TARGET=http://143.14.226.13:3001 cinemate-admin:local
   ```
   (`143.14.226.13:3001` is the same host currently in `.env`'s
   `VITE_PROXY_TARGET` — reuse it here for a like-for-like local check.)

3. **Verify:**
   - Open `http://localhost:8080` — the dashboard should load.
   - Navigate to a nested route (e.g. Movies, Settings) and hard-refresh the
     browser — it should still render (confirms the nginx SPA fallback in
     [nginx.conf.template](nginx.conf.template) is working, not a 404).
   - Open DevTools → Network, trigger any API-backed screen (e.g. login), and
     confirm requests to `/api/...` return real responses rather than 404s
     from the nginx container itself (confirms the reverse proxy is wired
     correctly).

4. **Stop it** with `Ctrl+C` (the `--rm` flag cleans the container up
   automatically).

If anything fails here (build error, blank page, 404s on refresh, failed
`/api` calls), fix it locally before touching CI — CI will reproduce the same
build deterministically, so a broken local build means a broken CI build.

## 2. CI workflow (in this repo)

`.github/workflows/ci.yml` is already added:

```yaml
name: CI

on:
  push:
    branches: ["main", "dev"]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Resolve tag
        id: meta
        run: |
          BRANCH=${GITHUB_REF_NAME}
          if [ "$BRANCH" = "main" ]; then
            echo "TAG=docker.io/${{ secrets.DOCKERHUB_USERNAME }}/cinemate-admin-prod:latest" >> $GITHUB_OUTPUT
          elif [ "$BRANCH" = "dev" ]; then
            echo "TAG=docker.io/${{ secrets.DOCKERHUB_USERNAME }}/cinemate-admin-dev:latest" >> $GITHUB_OUTPUT
          else
            echo "Unrecognized branch: $BRANCH" >&2
            exit 1
          fi

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile
          push: true
          platforms: linux/amd64
          tags: ${{ steps.meta.outputs.TAG }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Push to `dev` → `docker.io/<user>/cinemate-admin-dev:latest`. Push to `main`
→ `docker.io/<user>/cinemate-admin-prod:latest`. Two separate Docker Hub
repos, exactly like `cinemate-api-dev` / `cinemate-api-prod`.

**Notes**
- `cinemate-admin` is just an example name prefix — pick something distinct
  from `cinemate-api`; rename in both the workflow and the Portainer stacks
  below if you'd rather match the repo name exactly
  (`cinemate-web-backoffice-dev` / `-prod`).
- `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` are GitHub Actions secrets scoped
  **per repo** — add them under this repo's Settings → Secrets and variables
  → Actions (same Docker Hub account/token `cinemate-api` uses is fine).
- The `pnpm install` + `vite build` happen *inside* the Docker build (in the
  `Dockerfile`'s first stage), not on the GitHub runner — this workflow only
  needs Docker Buildx, it doesn't need a Node/pnpm setup step itself.
- If the Docker Hub repos `cinemate-admin-dev` / `cinemate-admin-prod` don't
  exist yet, either create them first on Docker Hub, or push once manually
  (`docker push`) — most Docker Hub accounts auto-create a repo on first push
  from a token with write access.

## 3. Add the two services in Portainer (dev + prod)

The Portainer environment here runs in **Docker Swarm mode**, so deploying a
stack creates an actual Swarm **service** (visible under Portainer →
environment → *Services*, not just *Containers*). Following the existing
`cinemate-api-dev`/`cinemate-api-prod` pattern, create **two separate
stacks** for the dashboard too — `cinemate-admin-dev` and
`cinemate-admin-prod` — each independent of the other and of the API stacks.

1. **Shared network for the `/api` proxy.** nginx proxies `/api/*` to
   `cinemate-api-dev`/`cinemate-api-prod` by container DNS name, so each
   dashboard service needs to be on the same Swarm overlay network as its
   matching API service. Check what network `cinemate-api-dev`/`-prod` are
   already attached to (Portainer → that service → look at *Network*) and
   reuse it — don't create a second one. If none exists yet:
   ```
   docker network create -d overlay cinemate-net
   ```
   and attach both `cinemate-api-*` stacks to it as well as the new
   `cinemate-admin-*` stacks.

2. **Portainer → Stacks → Add stack**, repeated once per environment:

   **`cinemate-admin-dev`:**
   ```yaml
   services:
     cinemate-admin-dev:
       image: docker.io/<dockerhub-username>/cinemate-admin-dev:latest
       environment:
         API_PROXY_TARGET: http://cinemate-api-dev:<API_PORT>   # scheme://service-name:port, no path
       ports:
         - "<DEV_PORT>:80"   # nginx listens on 80 inside the container
       networks:
         - cinemate-net
       deploy:
         replicas: 1
         restart_policy:
           condition: any

   networks:
     cinemate-net:
       external: true
   ```

   **`cinemate-admin-prod`:** identical, but `image: ...cinemate-admin-prod:latest`,
   `API_PROXY_TARGET: http://cinemate-api-prod:<API_PORT>`, and a different
   `<PROD_PORT>` (Swarm's ingress mesh needs a unique published port per
   service on the node).

   Note: `restart: unless-stopped` is a **standalone-Compose key and is
   silently ignored in Swarm mode** — use `deploy.restart_policy` instead, as
   above. Confirm `<DEV_PORT>`/`<PROD_PORT>`, `<API_PORT>`, and
   reverse-proxy/domain routing with whoever manages that — Swarm publishes
   ports via the **ingress routing mesh** by default, meaning the port
   becomes reachable from *every* swarm node, not just the one running the
   container.

3. **Deploy each stack** — Portainer pulls the image and creates the service
   (`replicas: 1` = one container/task; raise it later for more instances
   load-balanced by Swarm). `API_PROXY_TARGET` is read at **container start**
   (nginx's `envsubst` templating), so each environment's stack points at its
   own API without needing a different image.

## 4. Day-to-day flow

1. Push to `dev` → CI builds and pushes `cinemate-admin-dev:latest`. Push to
   `main` → CI builds and pushes `cinemate-admin-prod:latest`.
2. In Portainer, open the matching stack (`cinemate-admin-dev` or
   `cinemate-admin-prod`) → **Pull and redeploy** to pick up the new image.
   Swarm performs a **rolling update** — it starts the new container and only
   stops the old one once the new one is up, so there can briefly be both
   running.
3. There is currently **no auto-redeploy** wired up (same as the API today) —
   step 2 is a manual action after each push, done separately per
   environment.
4. Because each environment is its own stack/service, redeploying
   `cinemate-admin-dev` never touches `cinemate-admin-prod` or either
   `cinemate-api-*` service, and vice versa.
