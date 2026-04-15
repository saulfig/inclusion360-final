# Inclusion 360

Aplicación móvil de accesibilidad diseñada para personas con discapacidades auditivas y físicas. Ofrece traducción de lengua de señas en tiempo real, mapa de espacios accesibles, asistente de IA y sistema de alertas ambientales.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/) v8 o superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalado globalmente
- Para iOS: Xcode (solo en macOS) o la app **Expo Go** en un dispositivo físico
- Para Android: Android Studio con un emulador configurado, o la app **Expo Go** en un dispositivo físico

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/<tu-usuario>/inclusion-360.git
cd inclusion-360

# Instalar dependencias
pnpm install
```

## Ejecutar la app

```bash
# Iniciar el servidor de desarrollo
pnpm start

# O directamente en una plataforma específica
pnpm android   # Emulador o dispositivo Android
pnpm ios       # Simulador iOS (solo macOS)
pnpm web       # Navegador web
```

Una vez que el servidor esté corriendo, escanea el código QR con la app **Expo Go** (iOS/Android) o presiona `a` para Android / `i` para iOS en la terminal.

## Estructura del proyecto

```
inclusion-360/
├── app/
│   ├── _layout.tsx          # Layout raíz y stack de navegación
│   ├── login.tsx            # Pantalla de autenticación
│   ├── alert-config.tsx     # Modal de configuración de alerta
│   └── (tabs)/
│       ├── _layout.tsx      # Layout del tab bar
│       ├── index.tsx        # Pantalla principal (Inicio)
│       ├── traductor.tsx    # Traductor de lengua de señas
│       ├── mapa.tsx         # Mapa inclusivo con AR
│       ├── chat.tsx         # Asistente de IA
│       ├── alertas.tsx      # Historial de alertas
│       └── perfil.tsx       # Perfil y ajustes
├── components/
│   ├── ActionCard.tsx       # Tarjeta de acción rápida
│   ├── AlertaCard.tsx       # Tarjeta de alerta reciente
│   ├── HeaderProfile.tsx    # Cabecera con info del usuario
│   └── ui/
│       ├── IconSymbol.tsx   # Wrapper de iconos (SF Symbols → MaterialIcons)
│       └── TabBarBackground.tsx
├── constants/
│   └── Colors.ts            # Paleta de colores del tema
└── assets/                  # Imágenes, fuentes e íconos
```

## Permisos requeridos

- **Cámara**: para el módulo de traducción de señas y el mapa con AR
- **Micrófono**: para la detección de sonidos ambientales (alertas)

Los permisos se solicitan automáticamente al acceder a cada funcionalidad.

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Expo | ~55 | Framework principal |
| React Native | 0.83 | UI nativa |
| Expo Router | ~55 | Navegación basada en archivos |
| Expo Camera | ~55 | Cámara para el traductor de señas |
| React Native Reanimated | ~4.2 | Animaciones fluidas |
| TypeScript | ^5.3 | Tipado estático |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm start` | Inicia el servidor Metro |
| `pnpm android` | Abre en Android |
| `pnpm ios` | Abre en iOS |
| `pnpm web` | Abre en navegador |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm test` | Ejecuta los tests con Jest |
# inclusion360-final
