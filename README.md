# LiteLLM Compromise Checker

Check if your Python project was affected by the [LiteLLM supply chain attack](https://github.com/BerriAI/litellm/issues/24518) (v1.82.7 & v1.82.8).

**Live site: https://saharmor.github.io/lite-llm-map/**

## What is this?

On March 24, 2026, LiteLLM versions 1.82.7 and 1.82.8 on PyPI were compromised with credential-stealing malware via a Trivy CI/CD supply chain attack. This tool lets you paste a GitHub repo URL to instantly check if your project uses a compromised version.

## Running locally

```bash
npm install
npm run dev
```

## Deploying

Pushes to `main` auto-deploy to GitHub Pages via the included GitHub Actions workflow.
