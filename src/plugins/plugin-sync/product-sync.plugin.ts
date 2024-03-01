import { PluginCommonModule, Type, VendurePlugin } from "@vendure/core";

import { ProductSyncService } from "./services/product-sync.service";
import { PRODUCT_SYNC_PLUGIN_OPTIONS, productSyncPermission } from "./constants";
import { PluginInitOptions } from "./types";
import { ProductSyncLog } from "./entities/product-sync-log.entity";
import { ProductSyncLogAdminSchemaExtension } from "./api/api-extensions";
import { AdminResolver } from "./api/admin.resolver";

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [ProductSyncLog],
  adminApiExtensions: { resolvers: [AdminResolver], schema: ProductSyncLogAdminSchemaExtension },
  providers: [ProductSyncService, { provide: PRODUCT_SYNC_PLUGIN_OPTIONS, useFactory: () => ProductSyncPlugin.options }],
  compatibility: "^2.0.0",
  configuration: (config) => {
    config.authOptions.customPermissions.push(productSyncPermission);
    return config;
  },
})
export class ProductSyncPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<ProductSyncPlugin> {
    this.options = options;
    return ProductSyncPlugin;
  }
}
