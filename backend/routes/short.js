const express = require("express");
const { prisma } = require("../prismadata");
const router = express.Router();
const { nanoid } = require("nanoid");
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/short", [authMiddleware], async (req, res) => {
  const { link, expiresAt } = req.body;
  let expiresInDays = 0;
  if (expiresAt && expiresAt != 0) {
    expiresInDays = new Date(
      Date.now() + (expiresAt || 30) * 24 * 60 * 60 * 1000
    );
  }
  const data = await prisma.url.create({
    data: {
      link,
      userId: req.user.id,
      short: nanoid(6),
      expiresAt: expiresInDays != 0 ? expiresInDays : undefined,
    },
    select: {
      link: true,
      short: true,
      createdAt: true,
      clicks: true,
      expiresAt: true,
    },
  });
  res.json(data);
});

router.get("/:short", async (req, res) => {
  const { short } = req.params;
  const data = await prisma.url.findFirstOrThrow({
    where: { short },
  });
  if (!data) return res.redirect("/");
  await prisma.url.update({
    where: { id: data.id },
    data: { clicks: data.clicks + 1 },
  });
  res.json({ success: true });
});

router.get("/:short", async (req, res) => {
  const { short } = req.params;
  const data = await prisma.url.findFirstOrThrow({
    where: { short },
  });
  if (!data) return res.redirect("/");
  await prisma.url.update({
    where: { id: data.id },
    data: { clicks: data.clicks + 1 },
  });
  res.json({ success: true });
});

router.get("/:short/stats", async (req, res) => {
  const { short } = req.params;
  const data = await prisma.url.findFirstOrThrow({
    where: { short },
    select: { link: true, short: true, clicks: true, createdAt: true },
  });
  if (!data) return res.redirect("/");
  res.json({ data, success: true });
});

// /stats/:shortUrl
module.exports = router;
