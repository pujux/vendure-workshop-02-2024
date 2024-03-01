import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import {
  JobQueue,
  JobQueueService,
  ListQueryBuilder,
  ListQueryOptions,
  Logger,
  PaginatedList,
  ProductVariant,
  ProductVariantPrice,
  RequestContext,
  SerializedRequestContext,
  StockMovementService,
  TransactionalConnection,
} from "@vendure/core";

import { ProductSyncLog } from "../entities/product-sync-log.entity";
import { PRODUCT_SYNC_PLUGIN_OPTIONS, loggerCtx } from "../constants";
import { PluginInitOptions } from "../types";
import { ProductSyncInput } from "../gql";

@Injectable()
export class ProductSyncService implements OnModuleInit {
  private productSyncQueue: JobQueue<{ ctx: SerializedRequestContext; input: ProductSyncInput[] }>;

  constructor(
    private connection: TransactionalConnection,
    @Inject(PRODUCT_SYNC_PLUGIN_OPTIONS) private options: PluginInitOptions,
    private listQueryBuilder: ListQueryBuilder,
    private stockMovementService: StockMovementService,
    private jobQueueService: JobQueueService // private processContext: ProcessContext
  ) {}

  async onModuleInit() {
    this.productSyncQueue = await this.jobQueueService.createQueue({
      name: "sync-products",
      process: async (job) => {
        Logger.info(`Syncing ${job.data.input.length} products`, loggerCtx);
        const ctx = RequestContext.deserialize(job.data.ctx);

        const result = {
          updatedCount: 0,
          notFoundSKUs: [] as string[],
        };

        for (let i = 0; i < job.data.input.length; i++) {
          const input = job.data.input[i];

          let variantWasUpdated = false;
          let variant: ProductVariant | null = null;

          try {
            variant = await this.connection
              .getRepository(ctx, ProductVariant)
              // .findOne({ where: { sku: input.sku } });
              .createQueryBuilder("variant")
              .leftJoinAndSelect("variant.stockLevels", "stockLevel")
              .leftJoinAndSelect("variant.taxCategory", "taxCategory")
              .leftJoinAndSelect("variant.productVariantPrices", "prices")
              .where("variant.sku = :sku", { sku: input.sku })
              .andWhere("variant.deletedAt IS NULL")
              .getOne();
          } catch (e: any) {
            Logger.error(e.message, loggerCtx, e.stack);
          }

          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });

          if (variant === null) {
            result.notFoundSKUs.push(input.sku);
          } else {
            if (variant.productVariantPrices.length) {
              const firstPrice = variant.productVariantPrices[0];

              if (firstPrice.price !== input.price) {
                firstPrice.price = input.price;
                variantWasUpdated = true;
                await this.connection.getRepository(ctx, ProductVariantPrice).save(firstPrice);
              }
            }

            if (variant.stockLevels.length) {
              const oldStockLevel = variant.stockLevels[0];
              if (oldStockLevel.stockOnHand !== input.stockOnHand) {
                // oldStockLevel.stockOnHand = input.stockOnHand;
                variantWasUpdated = true;
                // await this.connection.getRepository(ctx, ProductVariant).save(variant);
                await this.stockMovementService.adjustProductVariantStock(ctx, variant.id, input.stockOnHand);
              }
            } else {
              Logger.warn(`No stock level found for variant with sku ${input.sku}`, loggerCtx);
            }

            if (variantWasUpdated) {
              result.updatedCount++;
            }
          }

          const progress = Math.floor((i / job.data.input.length) * 100);
          job.setProgress(progress);
        }

        return result;
      },
    });

    // if(this.processContext.isServer){
    //   /* run server code */
    // }
  }

  triggerProductSync(ctx: RequestContext, input: ProductSyncInput[]) {
    return this.productSyncQueue.add({
      ctx: ctx.serialize(),
      input,
    });
  }

  async findAll(ctx: RequestContext, options?: ListQueryOptions<ProductSyncLog>): Promise<PaginatedList<ProductSyncLog>> {
    return this.listQueryBuilder
      .build(ProductSyncLog, options, { ctx })
      .getManyAndCount()
      .then(([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  async findOne(ctx: RequestContext, id: string): Promise<ProductSyncLog | null> {
    return this.connection.getRepository(ctx, ProductSyncLog).findOne({ where: { id } });
  }
}
