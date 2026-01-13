import 'package:flutter/foundation.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/category.dart';

class ProductProvider with ChangeNotifier {
  List<Product> _products = [];
  List<Category> _categories = [];
  bool _isLoading = false;

  List<Product> get products => _products;
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;

  // Production API URL
  static const String baseUrl = 'https://api.websi.vn/api';
  
  // Development (uncomment to use localhost)
  // static const String baseUrl = 'http://localhost:8000/api';

  Future<void> fetchCategories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/categories'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          _categories = (data['data'] as List)
              .map((json) => Category.fromJson(json))
              .toList();
          notifyListeners();
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching categories: $e');
      }
    }
  }

  Future<void> fetchProducts({int? categoryId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      String url = '$baseUrl/products';
      if (categoryId != null) {
        url += '?category_id=$categoryId';
      }

      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          _products = (data['data'] as List)
              .map((json) => Product.fromJson(json))
              .toList();
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching products: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}




