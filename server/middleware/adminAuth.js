import jwt from "jsonwebtoken";

const allowedOrigins = [
  'https://hadibookstore.shop',
  'https://www.hadibookstore.shop',
  'https://api.hadibookstore.shop',
  'https://admin-panel-alpha-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

const addCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    try {
      const url = new URL(origin);
      if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname.endsWith('.vercel.app') ||
        url.hostname.endsWith('.hadibookstore.shop') ||
        allowedOrigins.includes(origin) ||
        (process.env.ADMIN_URL && origin === process.env.ADMIN_URL)
      ) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
    } catch (e) {
      // ignore
    }
  }
};

const adminAuth = async (req, res, next) => {
  let token = req.cookies.token;

  // If no cookie token, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    addCorsHeaders(req, res);
    return res.status(401).json({
      success: false,
      message: "Not authorized - Please login first",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token has required fields
    if (!tokenDecode?.id) {
      addCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Attach to req.user and req.userId
    req.user = { id: tokenDecode.id };
    req.userId = tokenDecode.id;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    addCorsHeaders(req, res);
    return res.status(401).json({
      success: false,
      message: "Session expired - Please login again",
    });
  }
};

export default adminAuth;