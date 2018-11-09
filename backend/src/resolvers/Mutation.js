const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");

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

    const item = await ctx.db.query.item({ where }, `{id, title}`);

    return ctx.db.mutation.deleteItem({ where }, info);
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
  }
};

module.exports = mutations;
