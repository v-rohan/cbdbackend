import { AffiliateNetworkController } from "./controller/AffiliateNetworkController";
import { UserController } from "./controller/UserController";

export const Routes = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save",
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
  },
  {
    method: "get",
    route: "/networks",
    controller: AffiliateNetworkController,
    action: "getAllNetworks",
  },
  {
    method: "get",
    route: "/networks/:id",
    controller: AffiliateNetworkController,
    action: "getNetworkById",
  },
  {
    method: "post",
    route: "/networks",
    controller: AffiliateNetworkController,
    action: "createNetwork",
  },
  {
    method: "put",
    route: "/networks/:id",
    controller: AffiliateNetworkController,
    action: "updateNetworkById",
  },
  {
    method: "delete",
    route: "/networks/:id",
    controller: AffiliateNetworkController,
    action: "deleteNetworkById",
  },
];
