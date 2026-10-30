import jwt from 'jsonwebtoken';

// JWT_SECRET MUST be set via environment variable in production.
// Never commit a real secret. The application will fail fast if it is missing.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[jwt] JWT_SECRET environment variable is not set. ' +
        'Set it in your Render environment variables before deploying.'
    );
  } else {
    // Development-only fallback — never used in production
    console.warn(
      '[jwt] WARNING: JWT_SECRET is not set. Using an insecure development fallback. ' +
        'Set JWT_SECRET before going to production.'
    );
  }
}

const SECRET = JWT_SECRET || 'DEV_ONLY_INSECURE_JWT_SECRET_REPLACE_BEFORE_PROD';

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
