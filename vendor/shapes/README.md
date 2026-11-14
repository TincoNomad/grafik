# shapes (vendorizado)

Matemática de formas SVG copiada de Remotion, sin React.

- Origen: `remotion/packages/shapes/src/utils/` y `remotion/packages/paths/src/`
  (commit `dba0f86`, Remotion 4.0.543).
- Licencia: MIT. Copyright (c) 2023 JonnyBurger. Texto completo en
  `LICENSE.md` (shapes) y `LICENSE.paths.md` (paths).
- Cambios locales: solo las rutas de import. Se quitó el tipo
  `@remotion/paths` y `serializeInstructions` pasó a archivo local.
- Lo que **no** se copió: `make-star.ts` y `make-polygon.ts`. Dependían de
  `reduceInstructions` y del cálculo de bounding box, que arrastraban ~60 KB de
  motor de paths. Esas dos viven propias en `grafik/formas.ts`.

Autochequeo: `bun vendor/shapes/prueba.ts`

Para actualizar: volver a copiar los archivos del commit nuevo y correr el
autochequeo. Si una firma cambió, falla ahí y no en un video.
