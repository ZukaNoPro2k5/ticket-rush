import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../shared/AppError';

export interface AuthPayload {
  userId: number;
  role: 'customer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
}

/**
 * Soft auth — attaches req.user when a valid Bearer token is present,
 * but lets the request through even when there is no token.
 * Use on public endpoints that behave differently for logged-in users
 * (e.g. events list shows unpublished drafts to admins).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  if (!authHeader.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(authHeader.split(' ')[1], config.jwt.secret) as AuthPayload;
    req.user = payload;
  } catch {
    // Invalid/expired token — treat as unauthenticated, don't block
  }
  next();
}
