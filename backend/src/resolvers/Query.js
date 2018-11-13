const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me: (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
  },
  users: async (parent, args, ctx, info) => {
    const userId = ctx.request.userId;
    if (!userId) {
      throw new Error("User needs to be signed in");
    }

    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    return ctx.db.query.users({}, info);
  },
  order: async (parent, { id }, ctx, info) => {
    const userId = ctx.request.userId;
    if (!userId) {
      throw new Error("User needs to be signed in");
    }
    const order = await ctx.db.query.order(
      {
        where: {
          id
        }
      },
      info
    );

    const ownsOrder = order.user.id === userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      "ADMIN"
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You can not see this bud");
    }

    return order;
  }
};

module.exports = Query;
