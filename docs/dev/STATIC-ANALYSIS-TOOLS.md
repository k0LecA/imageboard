# ESLint and dependency-cruiser

Both tools are already included in `devDependencies`.

```bash
cd backend/
pnpm install
```

## ESLint

```bash
# Initialize configuration (if missing)
pnpm create @eslint/config

# Run analysis
pnpm exec eslint .

# Save results
pnpm exec eslint . -f json -o eslint-report.json
```

## dependency-cruiser

```bash
# Initialize configuration (if missing)
pnpm exec depcruise --init

# Run analysis
pnpm exec depcruise .

# Generate HTML report
pnpm exec depcruise . --output-type html --output-to dependencies.html

# Generate SVG dependency graph (requires Graphviz)
pnpm exec depcruise . --output-type dot | dot -Tsvg > dependencies.svg
```