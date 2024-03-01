import gql from "graphql-tag";

export const ProductSyncLogAdminSchemaExtension = gql`
  type ProductSyncLog implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
  }

  type ProductSyncLogList implements PaginatedList {
    items: [ProductSyncLog!]!
    totalItems: Int!
  }

  input ProductSyncInput {
    sku: String!
    stockOnHand: Int!
    price: Int!
  }

  extend type Query {
    productSyncLogs(options: ProductSyncLogListOptions): ProductSyncLogList!
    productSyncLog(id: ID!): ProductSyncLog
  }

  extend type Mutation {
    syncProductData(input: [ProductSyncInput!]!): Job!
  }

  # Auto-generated at runtime
  input ProductSyncLogListOptions
`;
