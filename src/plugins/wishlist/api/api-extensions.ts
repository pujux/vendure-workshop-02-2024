import gql from "graphql-tag";

export const WishlistShopSchemaExtension = gql`
  type WishlistItem implements Node { # always implement Node interface for entity types
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    productVariant: ProductVariant!
    productVariantId: ID!
  }

  extend type Query {
    activeCustomerWishlist: [WishlistItem!]!
  }

  extend type Mutation {
    addToWishlist(productVariantId: ID!): [WishlistItem!]!
    removeFromWishlist(itemId: ID!): [WishlistItem!]!
  }
`;
