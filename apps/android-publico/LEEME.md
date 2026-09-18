# Cherry Bloom Studio — app de Android

Muestra tu web pública (https://cherry-bloom-studio-web-omega.vercel.app)
dentro de una app nativa de Android. No duplica el sitio — lo carga en
vivo, así que cualquier cambio que hagas en la web se refleja
automáticamente en la app, sin recompilar nada.

## Lo que necesitas (una sola vez)

**Android Studio** — gratis, en https://developer.android.com/studio. Si
ya lo usaste antes en esta PC (para otro proyecto), te lo saltas.

## Opción 1 — con Android Studio (más visual)

1. Descomprime esta carpeta.
2. Abre Android Studio → **Open** → selecciona la carpeta `android` que
   está aquí adentro.
3. Espera a que sincronice (la primera vez tarda unos minutos).
4. Conecta tu celular por USB (con Depuración USB activada en Ajustes →
   Opciones de desarrollador) o usa un emulador.
5. ▶ Run.

## Opción 2 — solo PowerShell, sin abrir Android Studio

```powershell
cd RUTA-DONDE-DESCOMPRIMISTE\android
.\gradlew.bat assembleDebug
```

El APK queda en:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

Ese archivo ya lo puedes copiar a tu celular e instalarlo directo
(activando "orígenes desconocidos" si te lo pide), o compartirlo.

## Para publicarla en Google Play (cuando quieras)

Necesitas una cuenta de **Google Play Console** (pago único de 25 USD, la
creas y pagas tú en https://play.google.com/console). Con eso: Build →
Generate Signed Bundle / APK, creas tu propia keystore (guárdala bien,
la necesitas para cada actualización futura), subes el `.aab` a Play
Console y completas la ficha.

## Ícono, nombre y copyright

El ícono ya está generado a partir de tu logo real. El nombre visible es
"Cherry Bloom Studio". El copyright quedó como placeholder — dime tu
nombre (o razón social) cuando lo tengas decidido y lo corrijo.

## Si cambias de dominio

Edita la línea `url:` en `capacitor.config.ts` (en la raíz de esta
carpeta) y vuelve a correr `npx cap sync android`.

---
*(La versión para iPhone se está armando en la otra conversación, la que
quedó vinculada a tu Mac — ahí es donde corresponde todo lo de Xcode.)*
