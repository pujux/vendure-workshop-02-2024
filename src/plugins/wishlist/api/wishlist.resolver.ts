import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Allow, Ctx, Permission, RequestContext, Transaction } from "@vendure/core";

import { WishlistService } from "../services/wishlist.service";
import { MutationAddToWishlistArgs, MutationRemoveFromWishlistArgs } from "../gql";

@Resolver()
export class WishlistShopResolver {
  constructor(private wishlistService: WishlistService) {}

  @Query()
  @Allow(Permission.Owner) // means access needs to be taken care of by the called functions - is equivalent to Permission.Public
  activeCustomerWishlist(@Ctx() ctx: RequestContext) {
    return this.wishlistService.getWishlistItems(ctx);
  }

  @Mutation()
  @Transaction()
  @Allow(Permission.Owner)
  async addToWishlist(@Ctx() ctx: RequestContext, @Args() { productVariantId }: MutationAddToWishlistArgs) {
    return this.wishlistService.addItem(ctx, productVariantId);
  }

  @Mutation()
  @Transaction()
  @Allow(Permission.Owner)
  async removeFromWishlist(@Ctx() ctx: RequestContext, @Args() { itemId }: MutationRemoveFromWishlistArgs) {
    return this.wishlistService.removeItem(ctx, itemId);
  }
}
