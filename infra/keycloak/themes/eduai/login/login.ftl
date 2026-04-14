<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
<#if section = "header">
    ${msg("loginAccountTitle")}
<#elseif section = "form">

<style>
  body { background:#0a0a0f !important; }
  .kc-login-wrap {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:2rem 1rem;
    position:relative;
    overflow:hidden;
  }
  .blob1,.blob2 {
    position:fixed;
    border-radius:50%;
    pointer-events:none;
    filter:blur(120px);
    z-index:0;
  }
  .blob1 { top:-10%;left:-10%;width:40%;height:40%;background:rgba(79,70,229,.20); }
  .blob2 { bottom:-10%;right:-10%;width:40%;height:40%;background:rgba(124,58,237,.20); }
  .kc-inner {
    position:relative;z-index:10;width:100%;max-width:400px;
  }
  .kc-head { text-align:center;margin-bottom:2rem; }
  .kc-logo {
    width:64px;height:64px;border-radius:16px;
    background:#0f0f1a;border:1px solid rgba(255,255,255,.05);
    margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 20px rgba(0,0,0,.2);
  }
  .kc-head h1 { font-size:1.75rem;font-weight:700;color:#fff;margin:0 0 .5rem; }
  .kc-head p  { font-size:.875rem;color:#94a3b8;margin:0; }
  .kc-head p span { color:#818cf8;font-weight:600; }
  .kc-card {
    background:rgba(15,15,26,.7);
    backdrop-filter:blur(24px);
    -webkit-backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,.06);
    border-radius:20px;
    box-shadow:0 25px 50px -12px rgba(0,0,0,.5);
    padding:2rem;
  }
  .kc-label {
    display:block;font-size:.875rem;font-weight:600;
    color:#cbd5e1;margin-bottom:.5rem;
  }
  .kc-input {
    width:100%;box-sizing:border-box;
    background:rgba(23,23,31,.9);
    border:1px solid rgba(255,255,255,.1);
    border-radius:12px;
    padding:.75rem 1rem;
    font-size:.9375rem;color:#f8fafc;
    outline:none;transition:all .2s;
  }
  .kc-input:focus {
    border-color:#6366f1;
    box-shadow:0 0 0 3px rgba(99,102,241,.25);
    background:rgba(23,23,31,1);
  }
  .kc-field { margin-bottom:1.25rem; }
  .kc-field-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem; }
  .kc-forgot { font-size:.75rem;color:#818cf8;text-decoration:none;font-weight:500; }
  .kc-forgot:hover { color:#a5b4fc; }
  .kc-remember { display:flex;align-items:center;gap:.5rem;margin-bottom:1.25rem; }
  .kc-remember input { width:16px;height:16px;accent-color:#6366f1; }
  .kc-remember label { font-size:.875rem;color:#94a3b8;cursor:pointer; }
  .kc-submit {
    width:100%;padding:.8rem;
    background:linear-gradient(to right,#6366f1,#8b5cf6);
    border:none;border-radius:12px;
    color:#fff;font-size:1rem;font-weight:600;cursor:pointer;
    transition:all .2s;
    box-shadow:0 4px 20px -5px rgba(99,102,241,.4);
  }
  .kc-submit:hover { background:linear-gradient(to right,#4f46e5,#7c3aed);transform:translateY(-1px); }
  .kc-divider {
    display:flex;align-items:center;gap:.75rem;margin:1.25rem 0;
  }
  .kc-divider-line { flex:1;height:1px;background:rgba(255,255,255,.1); }
  .kc-divider-text { font-size:.75rem;color:rgba(148,163,184,.6);white-space:nowrap; }
  .kc-social { display:flex;gap:1.5rem;flex-direction:row;justify-content:center; }
  .kc-social-btn {
    display:flex;align-items:center;justify-content:center;
    padding:0.5rem;border-radius:50%;
    border:none;
    background:transparent;
    cursor:pointer;
    transition:transform .2s;
    outline:none;
    box-shadow:none;
  }
  .kc-social-btn svg { width:28px;height:28px;flex-shrink:0;display:block; }
  .kc-social-btn:hover { background:transparent;transform:scale(1.1);border:none;outline:none;box-shadow:none; }
  .kc-social-btn:focus { outline:none;border:none;box-shadow:none; }
  .kc-register-link {
    display:flex;align-items:center;justify-content:center;margin-top:0.5rem;
    padding:.875rem;border-radius:12px;
    border:1px solid rgba(99,102,241,.3);
    background:rgba(99,102,241,.05);
    color:#818cf8;font-size:.875rem;font-weight:600;text-decoration:none;
    transition:all .2s;
  }
  .kc-register-link:hover { border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.1); }
  .kc-secure {
    margin-top:1.25rem;
    display:flex;align-items:center;justify-content:center;gap:.5rem;
    padding:.75rem;border-radius:12px;
    background:#0a0a0f;border:1px solid rgba(255,255,255,.05);
  }
  .kc-secure-dot { width:8px;height:8px;border-radius:50%;background:#10b981;animation:pulse 2s infinite; }
  .kc-secure p { font-size:.75rem;color:#64748b;font-weight:500;margin:0; }
  .kc-secure span { color:#818cf8;font-weight:600; }
  .kc-alert {
    padding:.75rem 1rem;border-radius:12px;margin-bottom:1rem;font-size:.875rem;
    background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2);
  }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
  /* Hide ALL Keycloak default shells and left logo/brand */
  #kc-header,#kc-header-wrapper,
  .pf-v5-c-brand,
  .pf-v5-c-login__main-header,
  .pf-v5-c-login__main-header-desc,
  .pf-v5-c-title,
  .pf-v5-c-login__footer,
  .pf-v5-c-login__info,
  #kc-info,
  #kc-locale,
  .pf-v5-c-login__header,
  [class*="pf-v5-c-brand"],
  img[src*="logo"],
  img[alt*="logo" i],
  img[alt*="keycloak" i],
  .pf-v5-c-page__header,
  .pf-v5-c-masthead,
  header.pf-v5-c-page__header,
  nav.pf-v5-c-nav,
  .pf-v5-c-page__sidebar,
  #kc-page-title { display:none!important; }

  .pf-v5-c-login,.pf-v5-c-login__container,
  .pf-v5-c-login__main,.pf-v5-c-login__main-body,
  .pf-v5-l-grid,.pf-v5-l-grid__item,.pf-v5-l-split,
  .pf-v5-c-page,.pf-v5-c-page__main,
  .pf-v5-c-login__main-footer-band {
    all:unset!important;display:block!important;width:100%!important;
  }
</style>

<div class="kc-login-wrap">
  <div class="blob1"></div>
  <div class="blob2"></div>
  <div class="kc-inner">

    <div class="kc-head">
      <div class="kc-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <h1>Connexion</h1>
      <p>Bienvenue sur <span>EduAI</span></p>
    </div>

    <div class="kc-card">
      <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
        <div class="kc-alert">${kcSanitize(message.summary)?no_esc}</div>
      </#if>

      <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
        <div class="kc-field">
          <label for="username" class="kc-label">
            <#if !realm.loginWithEmailAllowed>${msg("username")}
            <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
            <#else>${msg("email")}</#if>
          </label>
          <input tabindex="1" id="username" name="username"
                 value="${(login.username!'')}"
                 type="text" autofocus autocomplete="username"
                 class="kc-input" placeholder="votre@email.com" />
        </div>

        <div class="kc-field">
          <div class="kc-field-head">
            <label for="password" class="kc-label" style="margin:0">${msg("password")}</label>
            <#if realm.resetPasswordAllowed>
              <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="kc-forgot">Mot de passe oublié ?</a>
            </#if>
          </div>
          <input tabindex="2" id="password" name="password"
                 type="password" autocomplete="current-password"
                 class="kc-input" placeholder="••••••••" />
        </div>

        <#if realm.rememberMe && !usernameHidden??>
          <div class="kc-remember">
            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"
                   <#if login.rememberMe??>checked</#if>>
            <label for="rememberMe">Se souvenir de moi</label>
          </div>
        </#if>

        <input type="hidden" id="id-hidden-input" name="credentialId"
               <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

        <button tabindex="4" name="login" id="kc-login" type="submit" class="kc-submit">
          Se connecter
        </button>
      </form>

      <div class="kc-divider">
        <div class="kc-divider-line"></div>
        <span class="kc-divider-text">ou continuer avec</span>
        <div class="kc-divider-line"></div>
      </div>
      <div class="kc-social">
        <#if social?? && social.providers?has_content>
          <#list social.providers as p>
            <#if p.alias = "google">
              <a href="${p.loginUrl}" id="social-google" class="kc-social-btn" title="Google">
                <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91C16.58 14.25 17.64 11.94 17.64 9.2z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
                  <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.96 7.29C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              </a>
            </#if>
            <#if p.alias = "github">
              <a href="${p.loginUrl}" id="social-github" class="kc-social-btn" title="GitHub">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </#if>
          </#list>
        <#else>
          <a href="#" class="kc-social-btn" title="Google (config manquante)">
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91C16.58 14.25 17.64 11.94 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
              <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.96 7.29C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          </a>
          <a href="#" class="kc-social-btn" title="GitHub (config manquante)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </#if>
      </div>

      <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
        <div class="kc-divider">
          <div class="kc-divider-line"></div>
          <span class="kc-divider-text">Nouveau sur EduAI ?</span>
          <div class="kc-divider-line"></div>
        </div>
        <a tabindex="6" href="${url.registrationUrl}" class="kc-register-link">
          Créer un compte
        </a>
      </#if>

      <div class="kc-secure">
        <div class="kc-secure-dot"></div>
        <p>Authentification sécurisée par <span>Keycloak</span></p>
      </div>
    </div>

  </div>
</div>

</#if>
</@layout.registrationLayout>
