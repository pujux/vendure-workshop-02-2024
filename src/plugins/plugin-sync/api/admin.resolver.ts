import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { Allow, Ctx, Job, ListQueryOptions, PaginatedList, RequestContext, Transaction } from "@vendure/core";

import { ProductSyncService } from "../services/product-sync.service";
import { ProductSyncLog } from "../entities/product-sync-log.entity";
import { MutationSyncProductDataArgs } from "../gql";
import { productSyncPermission } from "../constants";

@Resolver()
export class AdminResolver {
  constructor(private productSyncService: ProductSyncService) {}

  @Query()
  productSyncLogs(@Ctx() ctx: RequestContext, @Args() args: { options: ListQueryOptions<ProductSyncLog> }): Promise<PaginatedList<ProductSyncLog>> {
    return this.productSyncService.findAll(ctx, args.options || undefined);
  }

  @Query()
  productSyncLog(@Ctx() ctx: RequestContext, @Args() args: { id: string }): Promise<ProductSyncLog | null> {
    return this.productSyncService.findOne(ctx, args.id);
  }

  @Mutation()
  @Transaction() // doesn't need to be a transaction as we are just adding a job to the queue, but it's not bad to have it
  @Allow(productSyncPermission.Permission)
  syncProductData(@Ctx() ctx: RequestContext, @Args() { input }: MutationSyncProductDataArgs): Promise<Job> {
    return this.productSyncService.triggerProductSync(ctx, input);
  }
}
