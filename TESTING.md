# Inclusion 360 — Plan de pruebas (entregable)

Aplicación: Expo / React Native + Supabase
Backend: Postgres con RLS, Auth, Realtime, RPC

---

## 1. Pruebas de autenticación

| # | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| A1 | Registro válido | Pantalla "Crear cuenta" → nombre, email válido, pwd ≥ 6 → "Crear cuenta" | Usuario creado, profile auto-generado por trigger, redirección a `/(tabs)` |
| A2 | Email inválido | Email sin "@" | Error: "Correo inválido" |
| A3 | Password corto | Pwd < 6 chars | Error: "La contraseña debe tener al menos 6 caracteres" |
| A4 | Email duplicado | Registrar email ya existente | Error: "Este correo ya está registrado" |
| A5 | Login válido | Email/pwd correctos | Redirección a `/(tabs)`, sesión persistida en SecureStore |
| A6 | Login inválido | Pwd incorrecto | Error: "Correo o contraseña incorrectos" |
| A7 | Persistencia | Cerrar app, reabrir | Usuario sigue autenticado |
| A8 | Logout | Perfil → "Cerrar sesión" → confirmar | Sesión limpia, redirección a `/login` |
| A9 | Guard | Sin sesión, intentar acceso a `/(tabs)` | Redirección automática a `/login` |

## 2. Inicio (Home)

| # | Caso | Resultado esperado |
|---|---|---|
| H1 | Saludo dinámico | "Buenos días/tardes/noches, {nombre}" |
| H2 | Stats reales | Cards muestran # alertas, # lugares (global), puntos del usuario |
| H3 | Última alerta | Card visible solo si hay alertas; navega a `/alertas` al tocar |
| H4 | Avatar → perfil | Tap en avatar abre tab perfil |

## 3. Mapa / Lugares

| # | Caso | Resultado esperado |
|---|---|---|
| M1 | Listado | Carga 10 seeds + cualquier lugar reportado |
| M2 | Stats header | Total lugares, # categorías, total verificados |
| M3 | Filtro categoría | Tap chip → filtra lista |
| M4 | Búsqueda | Input filtra por nombre |
| M5 | Score bar | Barra verde proporcional a `verified_count` |
| M6 | Detalle | Tap card → modal con descripción, tags, stats, reseñas |
| M7 | Verificar | "Verificar (+5 pts)" → RPC `verify_place` → +1 verified_count, +5 puntos |
| M8 | Reseña | Estrellas + nota → INSERT report + RPC `award_points(3)` |
| M9 | Reportar lugar | FAB → modal → INSERT places + RPC `award_points(10)` |
| M10 | Empty filtro | Filtro sin resultados → mensaje vacío |

## 4. Alertas

| # | Caso | Resultado esperado |
|---|---|---|
| AL1 | Listado | Solo alertas del user actual (RLS) |
| AL2 | Simular | Botón → INSERT alerta random, aparece arriba |
| AL3 | **Realtime** | Insertar alerta desde otro dispositivo / SQL → aparece sin refresh |
| AL4 | Filtros severidad | Chips: Todos / Alta / Media / Baja |
| AL5 | Eliminar individual | Botón ✕ por card |
| AL6 | Limpiar todas | Icono ✕ header → confirm → DELETE all |
| AL7 | Empty state | Sin alertas → mensaje |

## 5. Asistente / Chat

| # | Caso | Resultado esperado |
|---|---|---|
| C1 | Persistencia | Mensajes guardados en `chat_messages`, supervivencia entre sesiones |
| C2 | Enviar | Input → INSERT user msg → respuesta canned aleatoria (~800ms) |
| C3 | Limpiar | Icono ✕ → DELETE all chat_messages del user |
| C4 | RLS | User A no ve chats de User B |

## 6. Traductor

| # | Caso | Resultado esperado |
|---|---|---|
| T1 | Permisos cámara | Primera vez pide permiso |
| T2 | Cámara front/back | Botón toggle |
| T3 | Frases DB | Carga 15 seeds de `sign_phrases` en chips horizontales |
| T4 | Detección sim | "Traducir" → muestra frase random tras 1.2s |
| T5 | Tap chip | Setea frase como detectada |

## 7. Perfil

| # | Caso | Resultado esperado |
|---|---|---|
| P1 | Datos reales | Nombre, email, puntos del profile |
| P2 | Editar nombre | Modal → guarda en `profiles.full_name` |
| P3 | Toggle alertas | UPDATE settings.alerts_enabled |
| P4 | Sensibilidad | UPDATE settings.sensitivity (1-3) |
| P5 | Modo AR | UPDATE settings.ar_enabled |
| P6 | Logout confirm | Diálogo de confirmación |

## 8. Seguridad / RLS

| # | Caso | Resultado esperado |
|---|---|---|
| S1 | Alertas ajenas | User A no puede leer alertas de User B |
| S2 | Profile update | Solo el propio user puede actualizar su profile |
| S3 | Places lectura pública | Cualquier user lee places |
| S4 | Verify atómico | RPC `verify_place` se ejecuta como SECURITY DEFINER |

## 9. Smoke test end-to-end (5 min)

1. ✅ Registrar usuario nuevo
2. ✅ Ver Home con 0 alertas, 0 puntos
3. ✅ Ir a Alertas → simular 3 alertas → ver realtime
4. ✅ Volver a Home → contador en 3
5. ✅ Ir a Mapa → buscar "café" → tap → verificar (+5 pts)
6. ✅ Reportar nuevo lugar (+10 pts)
7. ✅ Dejar reseña (+3 pts)
8. ✅ Perfil → ver 18 puntos → editar nombre
9. ✅ Asistente → enviar mensaje → recibir respuesta
10. ✅ Logout → login → datos persisten
