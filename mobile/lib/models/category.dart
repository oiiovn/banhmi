class Category {
  final int id;
  final String name;
  final String? description;
  final String? image;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.image,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      image: json['image'],
    );
  }
}




