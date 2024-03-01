import { Entity, Column } from "typeorm";
import { VendureEntity, DeepPartial } from "@vendure/core";

@Entity()
export class ProductSyncLog extends VendureEntity {
  constructor(input?: DeepPartial<ProductSyncLog>) {
    super(input);
  }

  @Column()
  name: string;
}
