**Workflow GitHub Actions — Actualizar IPC automáticamente**

Descripción
- Propósito: ejecutar `node scripts/fetch_ipc.js` periódicamente (cron) y manualmente, y commitear `functions/ipc.json` si hay cambios.
- Uso: ideal para mantener actualizados los datos oficiales del IPC desde el INE sin intervención manual.

Cómo funciona (resumen)
- Trigger: `schedule` (cron diario) y `workflow_dispatch` (manual).
- Permisos: requiere `contents: write` para que el workflow pueda commitear y pushear cambios usando `GITHUB_TOKEN`.
- Pasos: checkout, setup Node, ejecutar script, commitear y push si hay cambios.

Ejemplo de workflow (copiar a `.github/workflows/update-ipc.yml`)

```yaml
name: Actualizar IPC
on:
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-ipc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: true
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci --prefer-offline || true
      - run: node scripts/fetch_ipc.js
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add functions/ipc.json
          git diff --cached --quiet || (git commit -m "chore: update IPC data" && git push)

```

Notas y recomendaciones
- Si prefieres un token con más control, crea un PAT (personal access token) y configúralo como `ACTIONS_PAT` en los secrets, sustituyendo el push por `git push https://x-access-token:${{ secrets.ACTIONS_PAT }}@github.com/${{ github.repository }} HEAD:main`.
- Ajusta la expresión `cron` según la zona horaria y la frecuencia deseada.
- Revisa que `scripts/fetch_ipc.js` use la URL oficial (ya está configurada por defecto en este repositorio).

¿Quieres que añada este archivo y el workflow `.github/workflows/update-ipc.yml` al repo ahora?
