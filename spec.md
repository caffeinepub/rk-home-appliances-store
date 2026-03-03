# RK Home Appliances Store

## Current State
- Backend has 16 seeded products across 4 categories: refrigerator, ac, fan, kitchen appliance
- Frontend has category filters: All, Refrigerators, Air Conditioners, Fans, Kitchen Appliances
- **Bug**: Backend category value is `"kitchen appliance"` but frontend filter compares against `"Kitchen Appliances"` -- kitchen appliances never show when filtered
- The 4 existing kitchen products are: Philips Mixer Grinder, Preethi Rice Cooker, Bajaj Toaster, Morphy Richards Microwave
- Backend uses a `productsSeeded` flag and `localStorage("rk_seeded")` to prevent re-seeding

## Requested Changes (Diff)

### Add
- 4 new kitchen appliance products: Air Fryer, Coffee Maker, Electric Kettle, Blender
- Total kitchen appliances will be 8 products

### Modify
- Fix all existing kitchen appliance category values from `"kitchen appliance"` to `"Kitchen Appliances"` in backend seed data
- Fix all other category values to match frontend filter labels exactly:
  - `"refrigerator"` → `"Refrigerators"`
  - `"ac"` → `"Air Conditioners"`
  - `"fan"` → `"Fans"`
  - `"kitchen appliance"` → `"Kitchen Appliances"`
- Update frontend seed key from `"rk_seeded"` to `"rk_seeded_v2"` so re-seeding triggers on next load

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` seed data: fix all category strings to match frontend labels exactly, add 4 new kitchen appliance products
2. Update `StorePage.tsx`: change localStorage key to `"rk_seeded_v2"` so new products get seeded
3. Regenerate backend (Motoko compile)
4. Deploy
