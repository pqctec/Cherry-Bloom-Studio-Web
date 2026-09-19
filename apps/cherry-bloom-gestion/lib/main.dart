import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_windows/webview_windows.dart' as win;

// App de gestion (ERP interno) de Cherry Bloom Studio: envuelve el panel
// /admin del sitio ya desplegado en Vercel (Android usa webview_flutter,
// Windows usa webview_windows). El login y los permisos de admin/empleado
// se manejan igual que en la web, dentro del webview.
const String kAdminUrl = 'https://cherry-bloom-studio-web-omega.vercel.app/admin';

void main() {
  runApp(const CherryBloomGestionApp());
}

class CherryBloomGestionApp extends StatelessWidget {
  const CherryBloomGestionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cherry Bloom Gestión',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.deepPurple),
      home: const WebViewScreen(url: kAdminUrl),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  final String url;
  const WebViewScreen({super.key, required this.url});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  WebViewController? _mobileController; // Android
  win.WebviewController? _windowsController; // Windows
  bool _loading = true;
  String? _windowsError;

  bool get _isWindows => !kIsWeb && Platform.isWindows;

  @override
  void initState() {
    super.initState();
    if (_isWindows) {
      _initWindows();
    } else {
      _initMobile();
    }
  }

  void _initMobile() {
    _mobileController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  Future<void> _initWindows() async {
    final controller = win.WebviewController();
    try {
      await controller.initialize();
      controller.loadingState.listen((state) {
        if (!mounted) return;
        setState(() => _loading = state == win.LoadingState.loading);
      });
      await controller.loadUrl(widget.url);
      if (!mounted) return;
      setState(() => _windowsController = controller);
    } catch (e) {
      if (!mounted) return;
      setState(() => _windowsError = e.toString());
    }
  }

  @override
  void dispose() {
    _windowsController?.dispose();
    super.dispose();
  }

  // Solo aplica en Android: intercepta el boton fisico/gesto de "atras" para
  // retroceder dentro del sitio en vez de cerrar la app de una. En Windows
  // no existe ese boton, asi que ni se usa (ver build()).
  Future<void> _handleBack(bool didPop) async {
    if (didPop) return;
    final canGoBack = await _mobileController?.canGoBack() ?? false;
    if (canGoBack) {
      await _mobileController!.goBack();
      return;
    }
    if (mounted) Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    if (_isWindows) {
      if (_windowsError != null) {
        body = Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'No se pudo iniciar el navegador integrado (WebView2).\n'
              'Instala "WebView2 Runtime" de Microsoft e intenta de nuevo.\n\n'
              'Detalle: $_windowsError',
              textAlign: TextAlign.center,
            ),
          ),
        );
      } else if (_windowsController == null) {
        body = const Center(child: CircularProgressIndicator());
      } else {
        body = win.Webview(_windowsController!);
      }
    } else {
      body = Stack(
        children: [
          if (_mobileController != null)
            WebViewWidget(controller: _mobileController!),
          if (_loading) const Center(child: CircularProgressIndicator()),
        ],
      );
    }

    if (_isWindows) {
      // Sin boton fisico de "atras" que interceptar en escritorio.
      return Scaffold(body: SafeArea(child: body));
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) => _handleBack(didPop),
      child: Scaffold(body: SafeArea(child: body)),
    );
  }
}
