const express = require("express");
const { prisma } = require("../prismadata");
const router = express.Router();
const { nanoid } = require("nanoid");
const authMiddleware = require("../middlewares/authMiddleware");
const QRCode = require("qrcode");
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
router.get("/:short/stats", [authMiddleware], async (req, res) => {
  const { short } = req.params;
  const data = await prisma.url.findFirst({
    where: { short, userId: req.user.id },
    select: {
      link: true,
      short: true,
      clicks: true,
      createdAt: true,
      expiresAt: true,
    },
  });
  if (!data)
    return res.json({
      message: "Short URL not found or unauthorized",
      success: false,
    });
  res.json({ data, success: true });
});
router.get("/:short/qr", [authMiddleware], async (req, res) => {
  try {
    const { short } = req.params;
    const data = await prisma.url.findFirst({
      where: { short, userId: req.user.id },
    });
    if (!data)
      return res.json({
        message: "Short URL not found or unauthorized",
        success: false,
      });
    const qrCode = await QRCode.toDataURL(
      `http://localhost:${process.env.PORT}/${data.short}`
    );
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
