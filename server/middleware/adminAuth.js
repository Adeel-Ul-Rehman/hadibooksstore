import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allowedOrigins = [
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
  let token = req.cookies?.token;

  // If no cookie token, check Authorization header (Bearer token)
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

    if (!tokenDecode?.id) {
      addCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const adminId = parseInt(tokenDecode.id, 10);
    if (isNaN(adminId)) {
      addCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: "Access denied - Administrator privileges required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      addCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin account not found",
      });
    }

    // Attach verified admin to request
    req.user = { id: admin.id, email: admin.email, name: admin.name, role: 'admin' };
    req.userId = admin.id;

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    addCorsHeaders(req, res);
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token - Please login again",
    });
  }
};

export default adminAuth;