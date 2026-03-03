# RK Home Appliances Store

## Current State
Empty workspace -- no prior app code exists.

## Requested Changes (Diff)

### Add
- Full e-commerce storefront for home appliances
- Product catalog with 4 categories: Refrigerators, Air Conditioners, Fans, Kitchen Appliances
- 4-5 products per category (roughly 18 products total), each with: name, price, description, category, stock status
- Category filter tabs on the storefront
- Shopping cart (add/remove items, view total)
- Product detail modal/view
- Admin panel (protected by a simple admin flag) to: add, edit, delete products

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Product data type: id, name, price, description, category, inStock
   - CRUD operations: getProducts, addProduct, updateProduct, deleteProduct
   - Cart operations: addToCart, removeFromCart, getCart, clearCart
   - Seed with initial 18 products across 4 categories
   - Admin check via caller identity

2. Frontend:
   - Storefront page: header with cart icon, category filter tabs, product grid
   - Product card with name, price, description, add-to-cart button
   - Cart sidebar/modal
   - Admin panel page: product list table with edit/delete, add product form
   - Navigation between storefront and admin panel
