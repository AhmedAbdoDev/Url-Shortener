const express = require("express");
const { prisma } = require("../prismadata");
const router = express.Router();
const { nanoid } = require("nanoid");
const authMiddleware = require("../middlewares/authMiddleware");
const QRCode = require("qrcode");
const UAParser = require("ua-parser-js");
const { getReferrerName, getLocation } = require("../functions");
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
  res.json({ data, success: true });
});
router.get("/:short", async (req, res) => {
  const { short } = req.params;
  const data = await prisma.url.findFirst({
    where: { short },
  });
  if (!data) return res.redirect("/");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  ip = ip.replace(/^::ffff:/, "");
  const geo = await getLocation(ip);
  const referrer = getReferrerName(req.headers.referer);
  const country = geo?.country || "Unknown";
  try {
    await prisma.visit.create({
      data: {
        urlId: data.id,
        country,
        userAgent: req.headers["user-agent"],
        referrer,
      },
    });
    await prisma.url.update({
      where: { id: data.id },
      data: { clicks: data.clicks + 1 },
    });
    // res.json({ success: true });
    res.redirect(data.link);
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
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
      visits: true,
      updatedAt: true,
    },
  });
  if (!data)
    return res.json({
      message: "Short URL not found or unauthorized",
      success: false,
    });
  const { countryStats, browserStats, osStats, deviceStats, referrerStats } =
    data.visits.reduce(
      (acc, visit) => {
        const parser = new UAParser(visit.userAgent);
        const country = visit.country;
        const browser = parser.getBrowser().name;
        const os = parser.getOS().name;
        const device = parser.getDevice().type || "Desktop";
        const referrer = visit.referrer || "Direct";
        acc.countryStats[country] = (acc.countryStats[country] || 0) + 1;
        acc.browserStats[browser] = (acc.browserStats[browser] || 0) + 1;
        acc.osStats[os] = (acc.osStats[os] || 0) + 1;
        acc.deviceStats[device] = (acc.deviceStats[device] || 0) + 1;
        acc.referrerStats[referrer] = (acc.referrerStats[referrer] || 0) + 1;
        return acc;
      },
      {
        countryStats: {},
        browserStats: {},
        osStats: {},
        deviceStats: {},
        referrerStats: {},
      }
    );
  res.json({
    totalClicks: data.clicks,
    createdAt: data.createdAt,
    lastClickAt: data.updatedAt,
    countryStats,
    browserStats,
    deviceStats,
    osStats,
    referrerStats,
    success: true,
  });
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
    res.json({ qrCode, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});
module.exports = router;
