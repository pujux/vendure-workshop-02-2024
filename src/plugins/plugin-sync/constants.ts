import { PermissionDefinition } from "@vendure/core";

export const PRODUCT_SYNC_PLUGIN_OPTIONS = Symbol("PRODUCT_SYNC_PLUGIN_OPTIONS");
export const loggerCtx = "ProductSyncPlugin";
export const productSyncPermission = new PermissionDefinition({
  name: "ProductSync",
  description: "Allows access to the syncProductData mutation",
});
