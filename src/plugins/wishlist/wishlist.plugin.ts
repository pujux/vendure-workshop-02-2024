import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import { WishlistItem } from "./entities/wishlist-item.entity";
import "./types"; // not needed but good to explicitely have
import { WishlistService } from "./services/wishlist.service";
import { WishlistShopSchemaExtension } from "./api/api-extensions";
import { WishlistShopResolver } from "./api/wishlist.resolver";

@VendurePlugin({
  compatibility: "^2.0.0", // good practice to use, means 'is compatible with major version 2 of @vendure/core'
  imports: [PluginCommonModule],
  providers: [WishlistService],
  shopApiExtensions: { schema: WishlistShopSchemaExtension, resolvers: [WishlistShopResolver] },
  entities: [WishlistItem],
  configuration: (config) => {
    config.customFields.Customer.push({
      name: "wishlistItems",
      type: "relation",
      entity: WishlistItem,
      eager: false, // from typeORM: if true loads relation by default, cautious about to many eager queries
      list: true, // list of <entity>
      internal: true, // is not accessible through graphQL
    });
    return config;
  },
  // exports: [WishlistService], -> other plugins could use this service by adding this plugin in their 'imports'
})
export class WishlistPlugin {}
