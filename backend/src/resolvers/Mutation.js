const mutations = {
  createItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    );

    return item;
  },
  updateItem: async (parent, args, ctx, info) => {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.query.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  }
};

module.exports = mutations;
