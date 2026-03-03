import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Nat;
    name : Text;
    price : Float;
    description : Text;
    category : Text;
    inStock : Bool;
  };

  type CartItem = { productId : Nat; quantity : Nat };
  type Cart = List.List<CartItem>;
  type CartMap = Map.Map<Principal, Cart>;

  public type UserProfile = {
    name : Text;
  };

  type OldState = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, Cart>;
    productIdCounter : Nat;
    productsSeeded : Bool;
  };

  type NewState = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, Cart>;
    productIdCounter : Nat;
    productsSeeded : Bool;
  };

  public func run(old : OldState) : NewState {
    // Attempt migration but keep old state in case of failure
    old;
  };
};
