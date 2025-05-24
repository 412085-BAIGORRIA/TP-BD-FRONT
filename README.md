# TP-BD-FRONT
## Autenticación
 - página de login y registro.
 - Mantener al usuario logueado (almacenar token en localStorage o sessionStorage).
 -  Manejo de sesión (logout, expiración de token).

## Pantalla principal / Dashboard
 - Barra de búsqueda con autocompletado (si la API lo permite).
 - Mostrar películas populares, recientes o destacadas al iniciar (para explorar).
 - Cards de películas con:
   - Imagen (poster).
   - Título.
   - Fecha de estreno.
   - Botón de acción (ver detalles, marcar vista/no vista).

## Detalle de Pelicula
 - ✅ Marcar como vista / no vista
 - ⭐ Puntuar (1–10 o estrellas)
 - ❤️ Añadir a favoritos
 - 🗨️ Escribir y ver reseñas personales

## Mi perfil / Mis listas
 - Películas vistas (con puntuación y reseña si hay)
 - Películas por ver
 - Favoritas
 - Opción para editar puntuaciones y reseñas

## Funcionalidas adicionales
 - 🎨 Dark mode (toggle con localStorage para recordar la preferencia).
 - 🧠 Almacenamiento temporal de estado (si aún no tienes conexión con backend).
 - 📱 Responsive: adaptar diseño para móvil (hamburguesa, columnas, etc).

## paleta de colores
| Uso                           | Color claro               | Color dark                |
| ----------------------------- | ------------------------- | ------------------------- |
| Fondo principal               | `#F9F9F9` (casi blanco)   | `#121212` (negro azulado) |
| Fondo de tarjetas             | `#FFFFFF`                 | `#1E1E1E`                 |
| Texto principal               | `#1A1A1A`                 | `#EAEAEA`                 |
| Texto secundario              | `#555555`                 | `#BBBBBB`                 |
| Acento 1 (botones)            | `#E50914` (rojo Netflix)  | `#E50914`                 |
| Acento 2 (hover, tags)        | `#F5C518` (amarillo IMDb) | `#F5C518`                 |
| Éxito (vistas)                | `#00C896`                 | `#00C896`                 |
| Fondo de elementos destacados | `#ECECEC`                 | `#252525`                 |

