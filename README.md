# MiSitio Downloads

## Estructura
- `index.html`: página principal.
- `css/styles.css`: estilos.
- `js/app.js`: búsqueda, filtros y renderizado del catálogo.
- `data/programas.json`: catálogo (lista JSON de programas).
- `assets/favicon.svg`: ícono.
- `legal/contacto.html`: página de contacto.
- `robots.txt` y `sitemap.xml`: archivos para rastreadores.

## Supermium incluido
La ficha de Supermium incluye tres instaladores: Windows 7 (64 bits), Windows 7 (32 bits) y Windows XP (32 bits). Los enlaces son los de GitHub Releases proporcionados para la versión 150. Comprobá las notas de la versión y la compatibilidad antes de instalar.

## Publicación
Subí el contenido de esta carpeta respetando la estructura a la raíz de tu hosting. Probá desde un servidor web, ya que el catálogo se carga mediante `fetch()`.

Para probar localmente:
```bash
python -m http.server 8000
```
Abrí `http://localhost:8000`.

## Antes de publicar
1. Reemplazá el dominio de ejemplo en `sitemap.xml` y agregá `Sitemap: https://TU-DOMINIO/sitemap.xml` a `robots.txt`.
2. Configurá HTTPS.
3. Revisá enlaces, versiones y compatibilidad.
4. Completá los datos reales de contacto y las páginas legales.
