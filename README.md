# my-app

A production-grade Node.js REST API deployed to AWS EKS via a fully automated GitOps CI/CD pipeline. Every git push automatically builds, tests, and deploys the app to Kubernetes — with zero downtime rolling deploys and instant rollback capability.

---

## Live pipeline flow

```
git push
    ↓
GitHub Actions — build Docker image, run tests
    ↓
Push image to AWS ECR (tagged with git SHA)
    ↓
Update image tag in my-app-infra repo
    ↓
ArgoCD detects change and deploys to EKS
    ↓
Kubernetes rolling deploy — zero downtime
```

---

## Architecture

| Component | Technology |
|---|---|
| Application | Node.js + Express |
| Containerization | Docker multi-stage build |
| Container registry | AWS ECR |
| CI pipeline | GitHub Actions + OIDC |
| Kubernetes | AWS EKS |
| Deployment | ArgoCD (GitOps) |
| Package manager | Helm |
| Auto scaling | Horizontal Pod Autoscaler |
| Secrets | Kubernetes Secrets |

---

## Key features

**Multi-stage Dockerfile**
Produces a lean ~80MB production image. Dev tools, test files, and unused packages never reach production. Final image runs as a non-root user for security.

**Zero downtime deploys**
Kubernetes rolling updates keep the old pod alive until the new one passes health checks. Users never see downtime during deployments.

**Health endpoints**
- `GET /healthz` — liveness probe. Kubernetes restarts the pod if this fails.
- `GET /readyz` — readiness probe. Kubernetes removes the pod from the load balancer if this fails.

**Graceful shutdown**
The app listens for `SIGTERM` and finishes in-flight requests before exiting — critical for zero downtime during pod termination.

**Passwordless AWS authentication**
GitHub Actions authenticates to AWS using OIDC — no long-lived credentials stored anywhere. The IAM role is locked to this specific repository.

**Horizontal Pod Autoscaler**
Automatically adds pods when CPU exceeds 70% and removes them when CPU drops below 10%. Scales from 1 to 5 pods.

---

## Environments

| Environment | Namespace | Replicas | Deploy trigger |
|---|---|---|---|
| Dev | `my-app` | 1 | Automatic on every push to main |
| Prod | `my-app-prod` | 2 | Manual promotion via workflow_dispatch |

---

## Repo structure

```
my-app/
├── src/
│   ├── index.js        # Express app with graceful shutdown
│   └── health.js       # /healthz and /readyz endpoints
├── .github/
│   └── workflows/
│       ├── ci.yaml              # Build, push to ECR, update infra repo
│       └── promote-to-prod.yaml # Manual prod promotion
├── Dockerfile           # Multi-stage production build
├── .dockerignore        # Excludes node_modules, tests, git history
└── package.json
```

---

## Infrastructure repo

Kubernetes config, Helm charts, and ArgoCD applications live in a separate repo following the GitOps pattern:

[my-app-infra](https://github.com/ochirdorj/my-app-infra)

---

## How to run locally

```bash
# Clone the repo
git clone https://github.com/ochirdorj/my-app.git
cd my-app

# Install dependencies
npm install

# Run locally
npm start

# Test health endpoints
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz

# Build Docker image
docker build -t my-app:local .
docker run -p 3000:3000 my-app:local
```

---

## How to promote to production

1. Push code to `main` — automatically deploys to dev
2. Test the dev environment
3. Go to GitHub → Actions → **Promote to prod**
4. Click **Run workflow** and paste the image tag (git SHA)
5. ArgoCD automatically deploys to prod

---

## How to rollback

```bash
# See recent commits
git log --oneline

# Revert the bad commit
git revert BAD_COMMIT_SHA --no-edit
git push

# ArgoCD automatically deploys the previous version
```
