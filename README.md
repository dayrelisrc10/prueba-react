# Voces

Una pequeña app en React y TypeScript para explorar la comunidad y sus publicaciones con [JSONPlaceholder](https://jsonplaceholder.typicode.com).

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Vite muestra en la terminal la dirección local para abrir en el navegador.

## Pruebas y compilación

```bash
npm test
npm run build
```

Las pruebas usan Vitest, React Testing Library y `user-event`. Las llamadas a la API se simulan para que la suite sea reproducible y no dependa de la red.

## Funcionalidad

- Lista de usuarios con búsqueda por nombre, sin distinguir mayúsculas.
- Selección de una persona para cargar sus publicaciones.
- Formulario para añadir publicaciones, con título y texto obligatorios (también se rechazan valores compuestos solo por espacios).
- Estados visibles de carga y error, con opción para reintentar las solicitudes.
- Diseño adaptable a móvil y atributos accesibles para los controles y mensajes de estado.

## Decisiones

- Vite ofrece una configuración ligera para React y TypeScript.
- La comunicación con JSONPlaceholder está aislada en `src/api.ts`; los datos se tipan en `src/types.ts`.
- Las publicaciones nuevas se agregan al estado local y aparecen antes que las descargadas. JSONPlaceholder no las persiste, por lo que desaparecen al recargar la página.
- Las solicitudes se cancelan al desmontar el componente o cambiar de usuario para evitar actualizar la vista con respuestas obsoletas.
- La búsqueda se hace sobre la lista ya cargada de usuarios, sin solicitudes adicionales.

## Qué haría con más tiempo

- Extraería la lista, el perfil y el formulario en componentes independientes.
- Añadiría pruebas de reintento, cancelación de solicitudes y errores al cargar publicaciones.
- Mejoraría la persistencia local de publicaciones y añadiría paginación si la fuente de datos creciera.
- Añadiría validación más detallada, edición/borrado y una comprobación visual en navegadores y tamaños de pantalla.

## Uso de IA

Durante el desarrollo de esta prueba utilicé Copilot como asistente. Principalmente, le pedí que me generara el esqueleto inicial de la interfaz en React (la estructura de las tarjetas, la lista de usuarios y el formulario) y un borrador para este README.Acepté la estructura visual base y la configuración inicial de los tests, ya que me ahorraba tiempo en el setup. Sin embargo, corregí y ajusté manualmente las partes críticas de la lógica: implementé por mi cuenta el manejo de estados de carga y error, añadí un AbortController para cancelar peticiones si el usuario cambiaba de selección muy rápido, y modifiqué la validación del formulario para usar .trim() y no permitir espacios en blanco. Además, adapté las pruebas de Testing Library para buscar los elementos por sus roles accesibles (como getByRole), asegurando que los tests validen la experiencia real del usuario
