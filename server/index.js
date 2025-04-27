const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { ObjectId } = require("mongodb");
const { sendMail } = require("./mailer");
const connectDB = require("./db");
const { emailHtml } = require("./constants");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

const PORT = 8000;

const ACCESS_TOKEN_EXPIRY_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const VERIFICATION_TOKEN_EXPIRY_MINUTES = 10;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
const VERIFICATION_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "verification-secret";

const FRONTEND_URL = "https://auth-demo-176t.onrender.com";

const corsOptions = {
  origin: FRONTEND_URL, // Make sure this is your frontend's URL
  methods: ["GET", "POST", "DELETE", "PATCH"],
  credentials: true, // Allow cookies to be sent across origins
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Use CORS middleware to handle cross-origin requests
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies (if JWTs are stored in cookies)
app.use(cookieParser());

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRY_MINUTES}m`,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  });
};

const generateVerificationToken = (emailId) => {
  return jwt.sign({ emailId: emailId }, VERIFICATION_TOKEN_SECRET, {
    expiresIn: `${VERIFICATION_TOKEN_EXPIRY_MINUTES}m`,
  });
};

const verifyAccessToken = (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // Step 1: Try verifying Access Token
  if (accessToken) {
    try {
      jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
      return true; // Access Token is valid
    } catch (err) {
      // Access Token is invalid or expired
      // But don't return here, check Refresh Token next
    }
  }

  // Step 2: If no access token or invalid, check Refresh Token
  if (!refreshToken) {
    res.status(401).send("REFRESH_TOKEN_REQUIRED");
    return false;
  }

  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const userToken = jwt.decode(refreshToken);
    const newAccessToken = generateAccessToken({ emailId: userToken.emailId });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: "None",
      maxAge: ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000, // 15 minutes
      path: "/",
    });

    return true;
  } catch (err) {
    res.status(401).send("INVALID_OR_EXPIRED_REFRESH_TOKEN");
    return false;
  }
};

const checkAccess = async (req, res, role) => {
  const accessToken = req.cookies.accessToken;
  const emailId = jwt.decode(accessToken)?.emailId;
  const db = await connectDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ emailId });

  if (user) {
    if (user.roles.includes("ADMIN") || user.roles.includes(role)) {
      return true;
    } else {
      res.status(403).send("NOT_AUTHORIZED");
      return false;
    }
  }
  res.status(403).send("NOT_AUTHORIZED");
  return false;
};

app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send("REFRESH_TOKEN_REQUIRED");
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(404).send("INVALID_OR_EXPIRED_TOKEN");
    }
    const accessToken = generateAccessToken({ emailId: user.emailId });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Use secure cookies in production
      sameSite: "None", // Ensure proper SameSite policyc
      maxAge: ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000, // Set cookie to expire in 10 days (10 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
      path: "/",
    });
    res.status(200).json({ status: "OK" });
  });
});

app.post("/verify-email", async (req, res) => {
  try {
    const token = req.body.token;
    const userToken = jwt.decode(token);

    jwt.verify(token, VERIFICATION_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(200).send({ status: "TOKEN_INVALID_OR_EXPIRED" });
      }

      const db = await connectDB();
      const usersCollection = db.collection("users");

      const result = await usersCollection.updateOne(
        { emailId: userToken.emailId },
        {
          $set: {
            isVerified: true,
          },
        }
      );

      const accessToken = generateAccessToken({ emailId: userToken.emailId });
      const refreshToken = generateRefreshToken({
        emailId: userToken.emailId,
      });

      // Set the cookie for access token
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true, // Use secure cookies in production
        sameSite: "None", // Ensure proper SameSite policyc
        maxAge: ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000, // Set cookie to expire in 10 days (10 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Use secure cookies in production
        sameSite: "None", // Ensure proper SameSite policyc
        maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // Set cookie to expire in 10 days (10 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
        path: "/",
      });

      return res.status(200).json({
        status: "OK",
      });
    });
  } catch (e) {
    console.log(e);
  }
});

app.post("/resend-email", (req, res) => {
  const emailId = req.query.emailId;

  const verificationToken = generateVerificationToken(emailId);

  const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  sendMail({
    to: emailId,
    subject: "Confirm Your Email to Complete Registration",
    text: `Hi there,

      Thanks for signing up for the auth demo project!

      Please confirm your email address by clicking the link below:

      ${verificationLink}

      If you didn’t request this, you can safely ignore the email.

      Best regards,
      Aqeel
      `,
    html: emailHtml(verificationLink),
  });
  res.status(200).json({ status: "OK" });
});

app.post("/register", async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { emailId, password } = req.body;

    const user = await usersCollection.findOne({ emailId });

    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      const newUser = {
        emailId,
        password: hashed,
        roles: ["ADMIN"],
        isVerified: false,
      };
      const result = await usersCollection.insertOne(newUser);
      res.status(200).json({
        status: "OK",
        userId: result.insertedId,
      });

      const verificationToken = generateVerificationToken(emailId);

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

      sendMail({
        to: emailId,
        subject: "Confirm Your Email to Complete Registration",
        text: `Hi there,

      Thanks for signing up for the auth demo project!

      Please confirm your email address by clicking the link below:

      ${verificationLink}

      If you didn’t request this, you can safely ignore the email.

      Best regards,
      Aqeel
      `,
        html: emailHtml(verificationLink),
      });
    } else {
      res.status(200).json({ status: "EMAIL_ALREADY_EXISTS" });
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/userInfo", async (req, res) => {
  try {
    const isAuthenticated = verifyAccessToken(req, res);
    if (!isAuthenticated) return;

    const token = req.cookies.accessToken;
    const userToken = jwt.decode(token);

    const db = await connectDB();
    const usersCollection = db.collection("users");

    const emailId = userToken?.emailId;
    const user = await usersCollection.findOne(
      { emailId },
      {
        projection: { password: 0 }, // 0 means exclude
      }
    );

    res.status(200).json({ status: "OK", data: user });
  } catch (e) {
    console.log(e);
  }
});

app.delete("/deleteStudent", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  const isAuthorized = await checkAccess(req, res, "DELETE");
  if (!isAuthorized) return;

  const userId = req.query.id;

  const db = await connectDB();
  const usersCollection = db.collection("students");
  const user = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
  if (user.deletedCount) {
    res.status(200).json({ status: "OK" });
  } else {
    res.status(406).json({ status: "REQUEST_FAILED" });
  }
});

app.patch("/updateStudent", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  const isAuthorized = await checkAccess(req, res, "UPDATE");
  if (!isAuthorized) return;

  const { _id, ...studentInfo } = req.body;

  const db = await connectDB();
  const usersCollection = db.collection("students");

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(_id) }, // filter
    {
      $set: {
        ...studentInfo,
      },
    } // update
  );
  if (result.modifiedCount) {
    res.status(200).json({
      status: "OK",
    });
  } else {
    res.status(406).json({ status: "REQUEST_FAILED" });
  }
});

app.post("/addStudent", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  const isAuthorized = await checkAccess(req, res, "CREATE");
  if (!isAuthorized) return;

  const db = await connectDB();
  const usersCollection = db.collection("students");

  const studentInfo = req.body;

  const result = await usersCollection.insertOne(studentInfo);
  if (result.insertedId) {
    res.status(200).json({
      status: "OK",
      insertedId: result.insertedId,
    });
  } else {
    res.status(406).json({ status: "REQUEST_FAILED" });
  }
});

app.post("/addUser", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  const isAuthorized = await checkAccess(req, res, "ADMIN");
  if (!isAuthorized) return;

  const userInfo = req.body;

  const db = await connectDB();
  const usersCollection = db.collection("users");

  userInfo.password = await bcrypt.hash(userInfo.password, 10);
  userInfo.isVerified = false;

  const result = await usersCollection.insertOne(userInfo);

  res.status(200).json({ status: "OK" });
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false, // Set to true in production
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // Set to true in production
    path: "/",
  });

  // Optionally, you can also handle any session data or JWT invalidation here
  res.status(200).json({ status: "OK" });
});

app.get("/getStudents", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  try {
    const db = await connectDB();
    const studentsCollection = db.collection("students");

    const students = await studentsCollection.find({}).toArray();

    res.status(200).json({ status: "OK", data: students });
  } catch (e) {
    console.log(e);
  }
});

app.get("/getUsers", async (req, res) => {
  const isAuthenticated = verifyAccessToken(req, res);
  if (!isAuthenticated) return;

  try {
    const db = await connectDB();
    const studentsCollection = db.collection("users");

    const students = await studentsCollection
      .find(
        {},
        {
          projection: { password: 0 }, // 0 means exclude
        }
      )
      .toArray();
    res.status(200).json({ status: "OK", data: students });
  } catch (e) {
    console.log(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { emailId, password } = req.body;

    const user = await usersCollection.findOne({ emailId });

    if (user) {
      // if (!user.isVerified) return res.status(200).json({ status: "NOT_VERIFIED" });

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const accessToken = generateAccessToken({ emailId });
        const refreshToken = generateRefreshToken({ emailId });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true, // Use secure cookies in production
          sameSite: "None", // Ensure proper SameSite policyc
          maxAge: ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000, // Set cookie to expire in 10 days (10 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
          path: "/",
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true, // Use secure cookies in production
          sameSite: "None", // Ensure proper SameSite policyc
          maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // Set cookie to expire in 10 days (10 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
          path: "/",
        });

        res.status(200).json({ status: "OK" });
      } else {
        res.status(200).json({ status: "INVALID_CREDENTIALS" });
      }
    } else {
      res.status(200).json({ status: "INVALID_CREDENTIALS" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log("✅ Server is running!");
});
