

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/server.ts
import "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR (50),
    email VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor',
    created_at TIMESTAMP  DEFAULT NOW(),
    updated_at TIMESTAMP  DEFAULT NOW()
    )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(30) NOT NULL,
        status VARCHAR(30) DEFAULT 'open',
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP  DEFAULT NOW(),
        updated_at TIMESTAMP  DEFAULT NOW()
        )
        `);
    console.log("DB connected Successfully");
  } catch (err) {
    console.log("DB error", err);
  }
};

// src/app.ts
import express from "express";

// src/modules/users/users.route.ts
import { Router } from "express";

// src/modules/users/users.service.ts
import bcrypt from "bcryptjs";
var craeteUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  if (role && !["contributor", "maintainer"].includes(role)) {
    throw new Error("Invalid role");
  }
  const result = await pool.query(`
    INSERT INTO users(name,email,password,role)
    VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var userService = {
  craeteUserIntoDB
};

// src/utility/serverResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var serverResponse_default = sendResponse;

// src/modules/users/users.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.craeteUserIntoDB(req.body);
    serverResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error
      });
    }
  }
};
var userController = {
  createUser
};

// src/modules/users/users.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var loginIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE email=$1`,
    [email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credintial!");
  }
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credintial!");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  loginIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginIntoDB(req.body);
    serverResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error
      });
    }
  }
};
var authContributor = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authContributor.loginUser);
var authRouter = router2;

// src/modules/issues/issue.route.ts
import { Router as Router3 } from "express";

// src/modules/issues/issue.service.ts
var createIssueIntoDB = async (payload, reporterId) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
    INSERT INTO issues(
    title,description,type,reporter_id
    ) VALUES($1,$2,$3,$4) RETURNING *
    
    `, [title, description, type, reporterId]);
  return result;
};
var getAllIssueFromDB = async (payload) => {
  const { sort = "newest", type, status } = payload;
  const conditions = [];
  const value = [];
  if (type) {
    value.push(type);
    conditions.push(`type=$${value.length}`);
  }
  if (status) {
    value.push(status);
    conditions.push(`status=$${value.length}`);
  }
  let query = `SELECT * FROM issues`;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(query, value);
  const reporterId = [
    ...new Set(result.rows.map((issue) => issue.reporter_id))
  ];
  const userResult = await pool.query(`
           SELECT id,name,role
           FROM users
           WHERE id=ANY($1)
            `, [reporterId]);
  const users = /* @__PURE__ */ new Map();
  userResult.rows.forEach((user) => {
    users.set(user.id, user);
  });
  const issuesWithReportrDetail = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: users.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return issuesWithReportrDetail;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
  const reporterId = [
    ...new Set(result.rows.map((issue) => issue.reporter_id))
  ];
  const userResult = await pool.query(`
           SELECT id,name,role
           FROM users
           WHERE id=ANY($1)
            `, [reporterId]);
  const users = /* @__PURE__ */ new Map();
  userResult.rows.forEach((user) => {
    users.set(user.id, user);
  });
  const issuesWithReportrDetail = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: users.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return issuesWithReportrDetail;
};
var updateIssueFromDB = async (payload, id) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(`
    UPDATE issues
    SET
   
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status),
    updated_at=CURRENT_TIMESTAMP
   WHERE id=$5 RETURNING *

    `, [title, description, type, status, id]);
  console.log("payload", payload);
  console.log("status", status);
  console.log("result.rows[0]", result.rows[0]);
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
    DELETE FROM ISSUES WHERE id=$1`, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Unauthorized!");
    }
    const reporterId = req.user.id;
    const result = await issueService.createIssueIntoDB(req.body, reporterId);
    serverResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error
      });
    }
  }
};
var getAllIssue = async (req, res) => {
  const { sort, type, status } = req.query;
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    serverResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (err) {
    if (err instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: err.message,
        error: err
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error: err
      });
    }
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (result.length === 0) {
      serverResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issues not found",
        data: {}
      });
    }
    serverResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  } catch (err) {
    if (err instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: err.message,
        error: err
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error: err
      });
    }
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueFromDB(req.body, id);
    if (result.rows === 0) {
      serverResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    serverResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error
      });
    }
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      serverResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    serverResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: {}
    });
  } catch (error) {
    if (error instanceof Error) {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      });
    } else {
      serverResponse_default(res, {
        statusCode: 500,
        success: false,
        message: "Unknown error",
        error
      });
    }
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      console.log("this is protected route");
      const token = req.headers.authorization;
      if (!token) {
        return serverResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthrized!!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(`
    SELECT * FROM users WHERE email=$1`, [decoded.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return serverResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "Users not found"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return serverResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden"
        });
      }
      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth;

// src/middlewares/checkPermission.ts
var checkPermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
    const issue = result.rows[0];
    if (!issue) {
      return serverResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found"
      });
    }
    if (!req.user) {
      throw new Error("Unauthorized!");
    }
    if (req.user.role === "maintainer") {
      return next();
    }
    if (req.user.role === "contributor" && req.body.status !== void 0) {
      return serverResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Contributor can not update status"
      });
    }
    if (req.user.role === "contributor" && issue.status === "open" && issue.reporter_id === req.user.id) {
      return next();
    }
    return serverResponse_default(res, {
      statusCode: 403,
      success: false,
      message: "Forbidden"
    });
  } catch (err) {
    next(err);
  }
};

// src/middlewares/checkDeletePermission.ts
var checkDeletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1
    `, [id]);
    const issue = result.rows[0];
    if (!issue) {
      return serverResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found"
      });
    }
    if (!req.user) {
      throw new Error("Unauthorized!");
    }
    if (req.user.role === "maintainer") {
      return next();
    }
    return serverResponse_default(res, {
      statusCode: 403,
      success: false,
      message: "Forbidden"
    });
  } catch (err) {
    next(err);
  }
};

// src/modules/issues/issue.route.ts
var router3 = Router3();
router3.post("/", auth_default("contributor", "maintainer"), issueController.createIssue);
router3.get("/", issueController.getAllIssue);
router3.get("/:id", issueController.getSingleIssue);
router3.patch("/:id", auth_default("contributor", "maintainer"), checkPermission, issueController.updateIssue);
router3.delete("/:id", auth_default("contributor", "maintainer"), checkDeletePermission, issueController.deleteIssue);
var issueRoute = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "Express Server",
    "author": "next level"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map