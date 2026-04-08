import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'dart:io';

InAppLocalhostServer localhostServer = InAppLocalhostServer(documentRoot: 'assets/dist');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await localhostServer.start();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Habit RPG',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
      ),
      home: const WebWrapper(),
    );
  }
}

class WebWrapper extends StatefulWidget {
  const WebWrapper({super.key});

  @override
  State<WebWrapper> createState() => _WebWrapperState();
}

class _WebWrapperState extends State<WebWrapper> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Match theme
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri("http://localhost:8080/index.html")),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            transparentBackground: true,
            disableVerticalScroll: true,
            disableHorizontalScroll: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
          ),
          onWebViewCreated: (controller) {},
          onLoadStop: (controller, url) async {},
        ),
      ),
    );
  }
}
