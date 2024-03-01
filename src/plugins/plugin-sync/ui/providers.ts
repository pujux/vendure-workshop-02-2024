import { addActionBarItem, addNavMenuItem } from "@vendure/admin-ui/core";

export default [
  addActionBarItem({
    id: "test-button",
    label: "Test Button",
    locationId: "order-list",
    onClick: (e) => console.log(e),
  }),
  addNavMenuItem(
    {
      id: "my-menu-section",
      label: "My Menu Section",
      routerLink: ["/extensions/my-extension"],
    },
    "sales"
  ),
];
