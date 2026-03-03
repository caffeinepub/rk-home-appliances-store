import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Product = {
    id : Nat;
    name : Text;
    price : Float;
    description : Text;
    category : Text;
    inStock : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type CartItem = { productId : Nat; quantity : Nat };
  type Cart = List.List<CartItem>;

  // Products store
  let products = Map.empty<Nat, Product>();
  var productIdCounter = 0;

  // Carts store
  let carts = Map.empty<Principal, Cart>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Track if products have been seeded
  var productsSeeded = false;

  // Seed products
  public shared ({ caller }) func seedProducts() : async () {
    if (productsSeeded) {
      Runtime.trap("Products already seeded");
    };

    // Hardcoded products
    let initialProducts = [
      // Refrigerators
      {
        name = "Samsung 400L Double Door";
        price = 799.99;
        description = "Spacious fridge with frost-free freezer compartment.";
        category = "refrigerator";
      },
      {
        name = "LG 345L Single Door";
        price = 599.99;
        description = "Energy efficient single door refrigerator.";
        category = "refrigerator";
      },
      {
        name = "Whirlpool 500L Side-by-Side";
        price = 999.99;
        description = "High capacity fridge with water dispenser.";
        category = "refrigerator";
      },
      {
        name = "Haier 343L Convertible";
        price = 650.00;
        description = "Convertible freezer to fridge option.";
        category = "refrigerator";
      },
      // ACs
      {
        name = "Daikin 1.5 Ton Inverter";
        price = 499.99;
        description = "Energy efficient split AC with fast cooling mode.";
        category = "ac";
      },
      {
        name = "Voltas 2 Ton Window AC";
        price = 399.99;
        description = "Powerful cooling ideal for large spaces.";
        category = "ac";
      },
      {
        name = "Carrier 1 Ton Split AC";
        price = 350.00;
        description = "Affordable and compact cooling solution.";
        category = "ac";
      },
      {
        name = "Godrej 1.5 Ton 5-star";
        price = 550.00;
        description = "Premium AC with Wi-Fi connectivity and smart controls.";
        category = "ac";
      },
      // Fans
      {
        name = "Orient Storm 1200mm";
        price = 49.99;
        description = "High speed ceiling fan with copper motor.";
        category = "fan";
      },
      {
        name = "Bajaj Airmax Wall Fan";
        price = 34.99;
        description = "Adjustable wall-mount fan with three speed settings.";
        category = "fan";
      },
      {
        name = "Usha Mist Air Desk Fan";
        price = 39.99;
        description = "Compact desk fan with oscillation feature.";
        category = "fan";
      },
      {
        name = "Havells Standard Fan";
        price = 44.99;
        description = "Quiet and efficient ceiling fan.";
        category = "fan";
      },
      // Kitchen appliances
      {
        name = "Philips 750W Mixer Grinder";
        price = 69.99;
        description = "Powerful kitchen mixer with 3 jars.";
        category = "kitchen appliance";
      },
      {
        name = "Preethi Stainless Steel Rice Cooker";
        price = 59.99;
        description = "Safe and efficient electric rice cooker.";
        category = "kitchen appliance";
      },
      {
        name = "Bajaj Auto Pop-up Toaster";
        price = 24.99;
        description = "2-slice pop-up toaster with removable crumb tray.";
        category = "kitchen appliance";
      },
      {
        name = "Morphy Richards 17L Microwave Oven";
        price = 125.00;
        description = "Mechanical control solo microwave oven.";
        category = "kitchen appliance";
      },
    ];

    for (product in initialProducts.values()) {
      addProductHelper(product.name, product.price, product.description, product.category);
    };

    productsSeeded := true;
  };

  func addProductHelper(name : Text, price : Float, description : Text, category : Text) {
    let product : Product = {
      id = productIdCounter;
      name;
      price;
      description;
      category;
      inStock = true;
    };
    products.add(productIdCounter, product);
    productIdCounter += 1;
  };

  // Get all products
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  // Get products by category
  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { Text.equal(p.category, category) }
    ).sort();
  };

  // Add product (admin only)
  public shared ({ caller }) func addProduct(name : Text, price : Float, description : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    addProductHelper(name, price, description, category);
  };

  // Update product (admin only)
  public shared ({ caller }) func updateProduct(id : Nat, name : Text, price : Float, description : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let product : Product = {
      id;
      name;
      price;
      description;
      category;
      inStock = true;
    };
    products.add(id, product);
  };

  // Delete product (admin only)
  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  // Cart functions
  func getCartInternal(user : Principal) : Cart {
    switch (carts.get(user)) {
      case (null) { List.empty() };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func addItemToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };
    let cart = getCartInternal(caller);
    cart.add({ productId; quantity });
    carts.add(caller, cart);
  };

  public shared ({ caller }) func removeItemFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };
    let cart = getCartInternal(caller);
    let filteredCart = cart.filter(
      func(item) { item.productId != productId }
    );
    carts.add(caller, filteredCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    getCartInternal(caller).toArray();
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Admin check
  public query ({ caller }) func getIsAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
