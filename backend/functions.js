const axios = require("axios");

async function getLocation(ip) {
  if (ip === "::1" || ip === "127.0.0.1")
    return { error: "Localhost IP detected" };
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    return {
      country: response.data.country,
      city: response.data.city,
      region: response.data.regionName,
      isp: response.data.isp,
    };
  } catch (error) {
    return { error: "API lookup failed", details: error.message };
  }
}
const getReferrerName = (referer) => {
  if (!referer) return "Direct";
  try {
    return new URL(referer).hostname.replaceAll("www.", "").split(".")[0];
  } catch (error) {
    return "Unknown";
  }
};

module.exports = { getLocation, getReferrerName };
