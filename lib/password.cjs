const { randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
function hash(password, salt = randomBytes(16).toString("hex")) {
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
function verify(password, encoded) {
  const [salt, digest] = encoded.split(":");
  if (!salt || !/^[a-f0-9]{128}$/.test(digest)) return false;
  return timingSafeEqual(Buffer.from(hash(password, salt).split(":")[1], "hex"), Buffer.from(digest, "hex"));
}
module.exports = { hash, verify };
