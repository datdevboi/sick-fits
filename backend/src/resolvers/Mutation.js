const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const mutations = {
  createItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  deleteItem: async (parent, args, ctx, info) => {
    const where = { id: args.id };

    const item = await ctx.db.query.item(
      { where },
      `{id, title user {
      id
    }}`
    );

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );

    if (ownsItem || hasPermissions) {
      return ctx.db.mutation.deleteItem({ where }, info);
    } else {
      throw new Error("You don't own this item");
    }
  },
  signup: async (parent, args, ctx, info) => {
    // lowecase their email
    args.email = args.email.toLowerCase();
    // hash the password
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return user;
  },
  signin: async (parent, { email, password }, ctx, info) => {
    const user = await ctx.db.query.user({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error("No user with that email exist");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return user;
  },
  signout: (parent, args, ctx, info) => {
    ctx.response.clearCookie("token");

    return {
      message: "Goodbye"
    };
  },
  requestReset: async (parent, { email }, ctx, info) => {
    const user = await ctx.db.query.user({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error("No user with that email exist");
    }

    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      data: { resetToken, resetTokenExpiry },
      where: {
        email
      }
    });

    const mailRes = await transport.sendMail({
      from: "sickfits@gmail.com",
      to: email,
      subject: "Password Reset",
      text: "Click link to reset password",
      html: makeANiceEmail(
        `Click here to reset password \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Link</a>`
      )
    });

    return {
      message: "Reset token sent"
    };
  },
  resetPassword: async (
    parent,
    { resetToken, password, confirmPassword },
    ctx,
    info
  ) => {
    if (password !== confirmPassword) {
      throw new Error(`Passwords don't match`);
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) {
      throw new Error("this token is invalid or expired");
    }

    password = await bcrypt.hash(password, 10);

    const updatedUser = await ctx.db.mutation.updateUser({
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      },
      where: {
        email: user.email
      }
    });

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    return updatedUser;
  },
  updatePermissions: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }

    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );

    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  addToCart: async (parent, args, ctx, info) => {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be signed in");
    }

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });

    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + 1
          }
        },
        info
      );
    }

    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  removeFromCart: async (parent, args, ctx, info) => {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user {
      id
    }}`
    );

    if (!cartItem) throw new Error("No CartItem found");

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("Cheating huhhh");
    }

    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id
        }
      },
      info
    );
  },
  createOrder: async (parent, { token }, ctx, info) => {
    // 1. Make sure user is signed in!
    const { userId } = ctx.request;
    if (!userId) throw new Error("You must be signed in");

    const user = await ctx.db.query.user(
      {
        where: {
          id: userId
        }
      },
      ` {id name email cart {
      id quantity item {
        title
        price
        id
        description
        image
      }
    }}`
    );
    // 2. recalculate the total for the price
    const amount = user.cart.reduce((tally, cartItem) => {
      return tally + cartItem.quantity * cartItem.item.price;
    }, 0);

    console.log(`Going to charge for a total amount of ${amount}`);

    // 3. Ceate the stripe charge
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "USD",
      source: token
    });
    // 4. convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        quantity: cartItem.quantity,
        user: {
          connect: {
            id: userId
          }
        },
        ...cartItem.item
      };

      delete orderItem.id;

      return orderItem;
    });

    // 5. create the order

    const order = await ctx.db.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: {
          create: orderItems
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    });
    // 6. clean up the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    // 7. Return the order to the client
    return order;
  }
};

module.exports = mutations;
