class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final int categoryId;
  final bool isAvailable;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.image,
    required this.categoryId,
    required this.isAvailable,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      image: json['image'],
      categoryId: json['category_id'],
      isAvailable: json['is_available'] ?? true,
    );
  }
}





