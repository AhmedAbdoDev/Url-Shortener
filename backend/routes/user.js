const express = require("express");
const { prisma } = require("../prismadata");
const { hashSync, genSaltSync, compareSync } = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  let user = await prisma.user.findFirst({
    where: { email },
  });
  if (user) {
    return res.status(400).json({
      message: "Email already exists. Please choose another.",
      success: false,
    });
  }
  user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashSync(password, genSaltSync(10)),
    },
  });
  res.status(201).json({
    message: "User created successfully",
    success: true,
  });
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user || !compareSync(password, user?.password))
      return res
        .status(400)
        .json({ message: "Invalid email or password", success: false });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", [authMiddleware], async (req, res) => {
  let user = await prisma.user.findFirst({
    where: { id: req.user.id },
    select: {
      username: true,
      email: true,
      createdAt: true,
    },
  });
  if (user) {
    let links = await prisma.url.findMany({
      where: { userId: req.user.id },
      select: {
        link: true,
        short: true,
        clicks: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        visits: true,
      },
    });
    links = links.map((link) => ({
      ...link,
      visits: link.visits.map(({ userAgent, referer, country, createdAt }) => ({
        userAgent,
        referer,
        country,
        createdAt,
      })),
    }));
    user.links = links;
  }
  res.json(user);
});
module.exports = router;
