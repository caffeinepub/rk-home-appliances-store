import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    category: string;
    price: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItemToCart(productId: bigint, quantity: bigint): Promise<void>;
    addProduct(name: string, price: number, description: string, category: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getIsAdmin(): Promise<boolean>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    isCallerAdmin(): Promise<boolean>;
    removeItemFromCart(productId: bigint): Promise<void>;
    seedProducts(): Promise<void>;
    updateProduct(id: bigint, name: string, price: number, description: string, category: string): Promise<void>;
}
