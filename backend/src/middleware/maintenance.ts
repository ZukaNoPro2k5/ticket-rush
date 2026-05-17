import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/AppError';
import { getRuntimeSystemSettings } from '../config/runtimeSettings';

const BYPASS_PREFIXES = ['/api/health', '/metrics', '/api/admin', '/api/auth'];

export async function maintenanceGuard(req: Request, _res: Response, next: NextFunction) {
  if (BYPASS_PREFIXES.some((prefix) => req.path.startsWith(prefix))) return next();
  if (req.user?.role === 'admin') return next();

  const settings = await getRuntimeSystemSettings();
  if (!settings.maintenanceMode) return next();

  next(new AppError('Hệ thống đang bảo trì. Vui lòng quay lại sau.', 503, 'MAINTENANCE_MODE'));
}
