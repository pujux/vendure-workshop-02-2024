import { WishlistItem } from "./entities/wishlist-item.entity";

// get types for custom fields by merging declarations
declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomCustomerFields {
    wishlistItems: WishlistItem[];
  }
}
