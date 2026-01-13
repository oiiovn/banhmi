import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthProvider with ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _token != null;

  // Production API URL
  static const String baseUrl = 'https://api.websi.vn/api';
  
  // Development (uncomment to use localhost)
  // static const String baseUrl = 'http://localhost:8000/api';

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userJson = prefs.getString('user');
    if (userJson != null) {
      _user = json.decode(userJson);
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          _token = data['data']['token'];
          _user = data['data']['user'];
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', _token!);
          await prefs.setString('user', json.encode(_user));
          
          notifyListeners();
          return true;
        }
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Error logging in: $e');
      }
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
          'password_confirmation': password,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success']) {
          _token = data['data']['token'];
          _user = data['data']['user'];
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', _token!);
          await prefs.setString('user', json.encode(_user));
          
          notifyListeners();
          return true;
        }
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Error registering: $e');
      }
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    
    notifyListeners();
  }
}




