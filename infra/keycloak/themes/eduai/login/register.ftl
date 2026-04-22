<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') ; section>
<#if section = "header">
    ${msg("registerTitle")}
<#elseif section = "form">

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  body { background:#0B3D2E !important; font-family:'Inter',system-ui,sans-serif !important; }

  .kc-login-wrap {
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    padding:2rem 1rem;position:relative;overflow:hidden;
  }
  .blob1,.blob2 {
    position:fixed;border-radius:50%;pointer-events:none;z-index:0;
  }
  .blob1 {
    top:-15%;right:-10%;width:50%;height:50%;
    background:radial-gradient(circle,#1B5E40,transparent 70%);
    opacity:0.3;filter:blur(80px);
    animation:pulseGlow 7s ease-in-out infinite;
  }
  .blob2 {
    bottom:-15%;left:-10%;width:45%;height:45%;
    background:radial-gradient(circle,#D4E157,transparent 70%);
    opacity:0.08;filter:blur(100px);
    animation:pulseGlow 9s ease-in-out infinite 2s;
  }
  @keyframes pulseGlow {
    0%,100%{transform:scale(1);opacity:0.15}
    50%{transform:scale(1.08);opacity:0.25}
  }
  .dot {
    position:fixed;border-radius:50%;pointer-events:none;z-index:0;background:#D4E157;
  }
  .dot-1 { top:20%;right:8%;width:8px;height:8px;opacity:0.3;animation:floatDot 4s ease-in-out infinite; }
  .dot-2 { top:55%;left:6%;width:6px;height:6px;opacity:0.2;animation:floatDot 5.5s ease-in-out infinite 1.5s; }
  .dot-3 { bottom:30%;right:18%;width:10px;height:10px;opacity:0.25;background:#81C784;animation:floatDot 6s ease-in-out infinite 3s; }
  @keyframes floatDot {
    0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}
  }

  .kc-inner { position:relative;z-index:10;width:100%;max-width:420px; }
  .kc-head { text-align:center;margin-bottom:2rem; }
  .kc-logo {
    width:48px;height:48px;border-radius:50%;background:#D4E157;
    margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 20px rgba(212,225,87,0.3);
  }
  .kc-badge {
    display:inline-flex;align-items:center;gap:6px;
    padding:4px 12px;border-radius:9999px;
    background:rgba(212,225,87,0.12);color:#D4E157;
    font-size:10px;font-weight:700;margin-bottom:12px;letter-spacing:0.02em;
  }
  .kc-head h1 { font-size:1.5rem;font-weight:900;color:#fff;margin:0 0 .35rem;letter-spacing:-0.02em; }
  .kc-head p { font-size:.875rem;color:rgba(255,255,255,0.4);margin:0; }
  .kc-head p span { color:#D4E157;font-weight:600; }

  .kc-card {
    background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:2rem;
    position:relative;overflow:hidden;
  }
  .kc-card::before {
    content:'';position:absolute;top:-64px;left:-64px;
    width:128px;height:128px;border-radius:50%;
    background:radial-gradient(circle,#D4E157,transparent);opacity:0.06;pointer-events:none;
  }

  .kc-label {
    display:block;font-size:.75rem;font-weight:600;
    color:rgba(255,255,255,0.5);margin-bottom:.4rem;
    text-transform:uppercase;letter-spacing:0.05em;
  }
  .kc-input {
    width:100%;box-sizing:border-box;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;padding:.75rem 1rem;
    font-size:.875rem;color:#fff;font-family:inherit;outline:none;transition:all .2s;
  }
  .kc-input::placeholder { color:rgba(255,255,255,0.2); }
  .kc-input:focus {
    border-color:rgba(212,225,87,0.5);
    box-shadow:0 0 0 3px rgba(212,225,87,0.1);
    background:rgba(255,255,255,0.06);
  }
  .kc-field { margin-bottom:1rem; }
  .kc-row { display:grid;grid-template-columns:1fr 1fr;gap:.75rem; }

  .kc-submit {
    width:100%;padding:.8rem;background:#D4E157;border:none;border-radius:12px;
    color:#0B3D2E;font-size:.875rem;font-weight:700;cursor:pointer;
    transition:all .2s;font-family:inherit;
    box-shadow:0 4px 20px -5px rgba(212,225,87,0.3);margin-top:.5rem;
  }
  .kc-submit:hover {
    background:#c9d64e;transform:translateY(-1px);
    box-shadow:0 6px 25px -5px rgba(212,225,87,0.4);
  }
  .kc-submit:active { transform:translateY(0); }

  .kc-divider { display:flex;align-items:center;gap:.75rem;margin:1.25rem 0; }
  .kc-divider-line { flex:1;height:1px;background:rgba(255,255,255,0.06); }
  .kc-divider-text {
    font-size:.6rem;color:rgba(255,255,255,0.2);white-space:nowrap;
    text-transform:uppercase;letter-spacing:0.1em;font-weight:500;
  }

  .kc-login-link {
    display:flex;align-items:center;justify-content:center;
    padding:.75rem;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);background:transparent;
    color:#D4E157;font-size:.8rem;font-weight:600;text-decoration:none;
    transition:all .2s;
  }
  .kc-login-link:hover {
    border-color:rgba(212,225,87,0.3);background:rgba(212,225,87,0.05);
  }

  .kc-secure {
    margin-top:1.25rem;display:flex;align-items:center;justify-content:center;gap:.5rem;
    padding:.6rem;border-radius:10px;border:1px solid rgba(255,255,255,0.04);
    background:rgba(255,255,255,0.02);
  }
  .kc-secure-dot { width:6px;height:6px;border-radius:50%;background:#D4E157;animation:pulse 2s infinite; }
  .kc-secure p { font-size:.65rem;color:rgba(255,255,255,0.25);font-weight:500;margin:0; }
  .kc-secure span { color:#D4E157;font-weight:600; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }

  .kc-alert {
    padding:.7rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:.8rem;
    background:rgba(239,68,68,.08);color:#f87171;border:1px solid rgba(239,68,68,.15);
  }

  .kc-animate { animation:fadeUp .5s ease-out both; }
  .kc-animate-d1 { animation-delay:.1s; }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}
  }

  #kc-header,#kc-header-wrapper,.pf-v5-c-brand,
  .pf-v5-c-login__main-header,.pf-v5-c-login__main-header-desc,
  .pf-v5-c-title,.pf-v5-c-login__footer,.pf-v5-c-login__info,
  #kc-info,#kc-locale,.pf-v5-c-login__header,
  [class*="pf-v5-c-brand"],img[src*="logo"],img[alt*="logo" i],img[alt*="keycloak" i],
  .pf-v5-c-page__header,.pf-v5-c-masthead,header.pf-v5-c-page__header,
  nav.pf-v5-c-nav,.pf-v5-c-page__sidebar,#kc-page-title { display:none!important; }

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
  <div class="dot dot-1"></div>
  <div class="dot dot-2"></div>
  <div class="dot dot-3"></div>

  <div class="kc-inner">
    <div class="kc-head kc-animate">
      <div class="kc-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B3D2E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div class="kc-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        Inscription gratuite
      </div>
      <h1>Créer un compte</h1>
      <p>Rejoignez la communauté <span>EduAI</span></p>
    </div>

    <div class="kc-card kc-animate kc-animate-d1">
      <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
        <div class="kc-alert">${kcSanitize(message.summary)?no_esc}</div>
      </#if>

      <form id="kc-register-form" action="${url.registrationAction}" method="post">
        <div class="kc-row">
          <div class="kc-field">
            <label for="firstName" class="kc-label">${msg("firstName")}</label>
            <input type="text" id="firstName" name="firstName"
                   value="${(register.formData.firstName!'')}"
                   class="kc-input" placeholder="Prénom" autocomplete="given-name" />
          </div>
          <div class="kc-field">
            <label for="lastName" class="kc-label">${msg("lastName")}</label>
            <input type="text" id="lastName" name="lastName"
                   value="${(register.formData.lastName!'')}"
                   class="kc-input" placeholder="Nom" autocomplete="family-name" />
          </div>
        </div>

        <div class="kc-field">
          <label for="email" class="kc-label">${msg("email")}</label>
          <input type="email" id="email" name="email"
                 value="${(register.formData.email!'')}"
                 class="kc-input" placeholder="votre@email.com" autocomplete="email" />
        </div>

        <#if !realm.registrationEmailAsUsername>
          <div class="kc-field">
            <label for="username" class="kc-label">${msg("username")}</label>
            <input type="text" id="username" name="username"
                   value="${(register.formData.username!'')}"
                   class="kc-input" placeholder="Nom d'utilisateur" autocomplete="username" />
          </div>
        </#if>

        <div class="kc-row">
          <div class="kc-field">
            <label for="password" class="kc-label">${msg("password")}</label>
            <input type="password" id="password" name="password"
                   class="kc-input" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <div class="kc-field">
            <label for="password-confirm" class="kc-label">${msg("passwordConfirm")}</label>
            <input type="password" id="password-confirm" name="password-confirm"
                   class="kc-input" placeholder="••••••••" autocomplete="new-password" />
          </div>
        </div>

        <button type="submit" class="kc-submit">
          Créer mon compte
        </button>
      </form>

      <div class="kc-divider">
        <div class="kc-divider-line"></div>
        <span class="kc-divider-text">Déjà inscrit ?</span>
        <div class="kc-divider-line"></div>
      </div>
      <a href="${url.loginUrl}" class="kc-login-link">
        Se connecter →
      </a>

      <div class="kc-secure">
        <div class="kc-secure-dot"></div>
        <p>Authentification sécurisée par <span>Keycloak</span></p>
      </div>
    </div>
  </div>
</div>

</#if>
</@layout.registrationLayout>
