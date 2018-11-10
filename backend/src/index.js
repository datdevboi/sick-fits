const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const jwt = require("jsonwebtoken");

const server = createServer();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

server.express.use(async (req, res, next) => {
  const { userId } = req;
  if (!userId) {
    return next();
  }

  const user = await db.query.user(
    {
      where: {
        id: userId
      }
    },
    `{
    name
    id
    permissions
    email
    
  }`
  );

  req.user = user;

  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(
      `Server is now running on port: http://localhost:${deets.port}`
    );
  }
);
