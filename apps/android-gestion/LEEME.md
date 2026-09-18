# Cherry Bloom Gestión — app de Android (tu ERP)

Abre directo tu panel de administración
(https://cherry-bloom-studio-web-omega.vercel.app/admin) dentro de una app
nativa de Android. Usas el mismo usuario y clave que ya tienes, no es una
cuenta aparte.

## Opción 1 — con Android Studio

1. Descomprime esta carpeta.
2. Abre Android Studio → **Open** → selecciona la carpeta `android` de
   aquí adentro.
3. Espera a que sincronice.
4. Conecta tu celular (Depuración USB activada) o usa un emulador.
5. ▶ Run.

## Opción 2 — solo PowerShell

```powershell
cd RUTA-DONDE-DESCOMPRIMISTE\android
.\gradlew.bat assembleDebug
```

APK en:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## Importante: es tu panel interno

No tiene sentido subirla a Google Play — cualquiera podría descargarla
(aunque igual necesitaría tu usuario y clave para entrar). Lo normal es
instalarla solo en tu celular directo desde aquí, sin pasar por la tienda.

---
*(La versión para iPhone se arma en la otra conversación, vinculada a tu
Mac.)*
