'use client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { getKeycloak, resolveKcReady } from './keycloak';
import { useAuthStore } from './authStore';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function TokenSyncer({ children }) {
  const { syncKeycloakUser } = useAuthStore();
  const synced = useRef(false);

  useEffect(() => {
    const kc = getKeycloak();
    if (!kc) return;

    const trySync = () => {
      if (kc.authenticated && kc.token && !synced.current) {
        synced.current = true;
        syncKeycloakUser(kc);
      }
    };

    trySync();
    const id = setInterval(trySync, 500);

    const timeout = setTimeout(() => clearInterval(id), 5000);
    return () => { clearInterval(id); clearTimeout(timeout); };
  }, [syncKeycloakUser]);

  return children;
}

export default function KeycloakProvider({ children }) {
  const kc = getKeycloak();


  if (!kc) return children;

  return (
    <ReactKeycloakProvider
      authClient={kc}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : '',
        checkLoginIframe: false,
        pkceMethod: 'S256',
        redirectUri: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : '',
      }}
      onEvent={(eventType) => {
        // Resolve KC ready promise on any init outcome
        if (['onReady', 'onAuthSuccess', 'onAuthError', 'onInitError'].includes(eventType)) {
          resolveKcReady();
        }

        if (eventType === 'onAuthSuccess') {
          const kc = getKeycloak();
          if (kc?.authenticated && kc.token) {
            // Cache token in sessionStorage (cleared on tab close = safe)
            sessionStorage.setItem('kc_token_cache', kc.token);
            useAuthStore.setState({ token: kc.token });
            useAuthStore.getState().syncKeycloakUser(kc);
          }
        }

        if (eventType === 'onAuthLogout' || eventType === 'onTokenExpired') {
          sessionStorage.removeItem('kc_token_cache');
          useAuthStore.setState({ token: null });
        }
      }}
      onTokens={(tokens) => {

        if (tokens.token) {
          const store = useAuthStore.getState();
          if (store.user) {
            useAuthStore.setState({ token: tokens.token });
          }
        }
      }}
    >
      <TokenSyncer>{children}</TokenSyncer>
    </ReactKeycloakProvider>
  );
}
