import { verifyToken } from './jwt';

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    
    if (!payload) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(user) {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireRole(user, allowedRoles) {
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}