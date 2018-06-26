Lego Landing  
==================  

Lego landing es un engine para generar landings modulares, los cuales pueden ser iterados para generar nuevos landings y hacer AB testing o tener varios landings en desarrollo al mismo tiempo.

## Instalación  

`npm i --save lego-landing`

## Modo de uso  

Lego landing expone dos métodos: `Server` y `Builder` 

Simplemente hay que hacer  

`const { Server, Builder } = require('lego-landing')`  

y ejecutarlo con  

`Server()`  

El puerto donde va a correr el servidor de dev se define en un archivo
`.env` como PORT o directamente como una variable de entorno.  

Debes tener dos directorios en tu ambiente de desarrollo:  

`dist` y `sites`  

sites es donde tendrás todos tus sitios, dentro de sus propios directorios.
dist es donde se van a generar los landings ya compilados y listos para prod.

Para iniciar solo necesitas tener los directorios creados de sites y dist. Luego puedes ir agregando sitios dentro de sites con sus respectivos assets.

Para generar los dist, solo debes ejecutar:  

`Builder()`  

como parte de tu flujo de CI

## Estructura de archivos:

```
mi-desarrollo
  |- dist
    |- mi-primer-sitio
      |- images
        |- something.png
      |- scripts
        |- site.js
      |- styles
        |- site.css
      |- site.html

  |- sites
    |- mi-primer-sitio
      |- assets
        |- images
          |- something.png
        |- scripts
          |- site.js
        |- styles
          |- site.sass
          |- _header.sass
      |- _header.pug
      |- site.pug
```

Durante el desarrollo lego-landing provee livereload, solo agrega `!= LRScript` antes de cerrar tu etiqueta head
