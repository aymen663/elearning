import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/User.js';

const KC_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KC_REALM = process.env.KEYCLOAK_REALM || 'elearning';


const jwks = jwksClient({
  jwksUri: `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600_000,
  rateLimit: true,
});

function getSigningKey(header) {
  return new Promise((resolve, reject) => {
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}


export const protect = async (req, res, next) => {
  try {
    const raw = req.headers.authorization;
    if (!raw?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé – Token manquant' });
    }
    const token = raw.split(' ')[1];


    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ message: 'Token invalide' });


    const publicKey = await getSigningKey(decoded.header);


    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });


    const realmRoles = payload.realm_access?.roles || [];
    let role = 'student';
    let hasExplicitRole = false;

    if (realmRoles.includes('admin')) { role = 'admin'; hasExplicitRole = true; }
    else if (realmRoles.includes('instructor')) { role = 'instructor'; hasExplicitRole = true; }

    const attrRole = payload.role?.[0] || payload.attributes?.role?.[0];
    if (attrRole && ['admin', 'instructor', 'student'].includes(attrRole)) {
      role = attrRole;
      hasExplicitRole = true;
    }

    const keycloakId = payload.sub;
    let email = payload.email || payload.preferred_username;
    if (!email || !email.includes('@')) {
      email = `${keycloakId}@no-email.local`;
    }
    const name = [payload.given_name, payload.family_name].filter(Boolean).join(' ')
      || payload.preferred_username
      || 'Utilisateur GitHub';


    let user = await User.findOne({ keycloakId });
    if (!user) user = await User.findOne({ email });

    if (!user) {
      const randomPwd = Math.random().toString(36).slice(-16);
      user = await User.create({
        keycloakId, name, email,
        password: randomPwd,
        role,
        avatar: payload.picture || '',
        provider: 'keycloak',
      });
    } else {


      let changed = false;
      if (!user.keycloakId) { user.keycloakId = keycloakId; changed = true; }
      if (hasExplicitRole && user.role !== role) { user.role = role; changed = true; }
      if (changed) await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {

    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};
