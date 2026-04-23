<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
<#if section = "header">
    ${msg("loginAccountTitle")}
<#elseif section = "form">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif!important;background:#060e0a!important;min-height:100vh;overflow-x:hidden!important}

/* BG */
.bg{position:fixed;inset:0;z-index:0;overflow:hidden}
.bg-g{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none}
.bg-1{width:600px;height:600px;top:-15%;left:-10%;background:#0d4a30;opacity:.5;animation:drift 20s ease-in-out infinite}
.bg-2{width:500px;height:500px;bottom:-10%;right:-10%;background:#1a6b42;opacity:.3;animation:drift 25s ease-in-out infinite reverse}
.bg-3{width:300px;height:300px;top:40%;left:50%;background:#D4E157;opacity:.04;animation:drift 18s ease-in-out infinite 5s}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(212,225,87,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,225,87,.03) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,black,transparent)}

/* Particles */
.p{position:absolute;border-radius:50%;pointer-events:none}
.p1{width:4px;height:4px;background:#D4E157;top:20%;left:15%;opacity:.4;animation:float 6s ease-in-out infinite}
.p2{width:3px;height:3px;background:#81C784;top:60%;left:80%;opacity:.3;animation:float 8s ease-in-out infinite 2s}
.p3{width:5px;height:5px;background:#D4E157;top:75%;left:25%;opacity:.2;animation:float 7s ease-in-out infinite 4s}
.p4{width:3px;height:3px;background:#A5D6A7;top:30%;left:70%;opacity:.25;animation:float 9s ease-in-out infinite 1s}
.p5{width:4px;height:4px;background:#D4E157;top:85%;left:60%;opacity:.15;animation:float 6.5s ease-in-out infinite 3s}
.p6{width:2px;height:2px;background:#fff;top:15%;left:55%;opacity:.2;animation:float 10s ease-in-out infinite 6s}

/* Layout */
.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;position:relative;z-index:1}
.card{width:100%;max-width:420px;position:relative}

/* Header */
.hdr{text-align:center;margin-bottom:2rem;animation:slideUp .6s ease-out both}
.logo{display:inline-flex;align-items:center;gap:8px;margin-bottom:1.5rem}
.logo-i{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#D4E157,#9CCC65);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(212,225,87,.2)}
.logo-t{font-weight:800;font-size:1.2rem;color:#fff;letter-spacing:-.03em}
.hdr h1{font-size:1.9rem;font-weight:800;color:#fff;letter-spacing:-.03em;margin-bottom:.4rem}
.hdr h1 span{background:linear-gradient(135deg,#D4E157,#81C784);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr p{color:rgba(255,255,255,.35);font-size:.82rem;line-height:1.5}

/* Form card */
.fc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:2rem;backdrop-filter:blur(20px);position:relative;overflow:hidden;animation:slideUp .6s ease-out .15s both}
.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,225,87,.2),transparent)}
.fc::after{content:'';position:absolute;top:-80px;right:-80px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(212,225,87,.08),transparent);pointer-events:none}

/* Fields */
.fg{margin-bottom:1.1rem;position:relative}
.fg-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem}
.lb{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.06em}
.fgt{font-size:.68rem;color:rgba(212,225,87,.6);text-decoration:none;font-weight:500;transition:color .2s}
.fgt:hover{color:#D4E157}
.ip-wrap{position:relative}
.ip-ic{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);width:18px;height:18px;color:rgba(255,255,255,.2);transition:color .3s;pointer-events:none}
.ip{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;padding:.78rem 1rem .78rem 2.8rem;font-size:.85rem;color:#fff;font-family:inherit;outline:none;transition:all .3s ease}
.ip::placeholder{color:rgba(255,255,255,.15)}
.ip:focus{border-color:rgba(212,225,87,.4);background:rgba(255,255,255,.06);box-shadow:0 0 0 4px rgba(212,225,87,.06),0 4px 16px rgba(0,0,0,.1)}
.ip:focus ~ .ip-ic,.ip:focus + .ip-ic{color:rgba(212,225,87,.6)}
.fg:has(.ip:focus) .ip-ic{color:rgba(212,225,87,.6)}

/* Submit */
.btn{width:100%;padding:.85rem;background:linear-gradient(135deg,#D4E157,#9CCC65);border:none;border-radius:12px;color:#0a1f14;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .3s ease;font-family:inherit;position:relative;overflow:hidden;letter-spacing:-.01em}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,225,87,.25)}.btn:hover::before{opacity:1}
.btn:active{transform:translateY(0);box-shadow:0 2px 8px rgba(212,225,87,.15)}

/* Divider */
.sep{display:flex;align-items:center;gap:.75rem;margin:1.5rem 0}
.sep-l{flex:1;height:1px;background:rgba(255,255,255,.06)}
.sep-t{font-size:.6rem;color:rgba(255,255,255,.15);text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}

/* Social */
.soc{display:flex;gap:.5rem}
.sb{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:.72rem;border-radius:12px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);text-decoration:none;font-size:.78rem;font-weight:600;color:rgba(255,255,255,.5);transition:all .3s ease}
.sb:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.12);transform:translateY(-1px);color:rgba(255,255,255,.7)}
.sb svg{width:18px;height:18px;flex-shrink:0}

/* Bottom */
.btm{text-align:center;margin-top:1.75rem;animation:slideUp .6s ease-out .3s both}
.btm p{font-size:.8rem;color:rgba(255,255,255,.25)}
.btm a{color:#D4E157;font-weight:600;text-decoration:none;transition:all .2s;position:relative}
.btm a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1.5px;background:#D4E157;transition:width .3s}
.btm a:hover::after{width:100%}

/* Alert */
.al{padding:.7rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:.78rem;background:rgba(239,68,68,.06);color:#f87171;border:1px solid rgba(239,68,68,.12);backdrop-filter:blur(8px)}

/* Trust */
.trust{display:flex;align-items:center;justify-content:center;gap:.4rem;margin-top:1.25rem;padding:.6rem;border-radius:10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}
.trust-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.4);animation:pulse 2s infinite}
.trust span{font-size:.6rem;color:rgba(255,255,255,.2);font-weight:500}
.trust em{font-style:normal;color:rgba(212,225,87,.5);font-weight:600}

/* Animations */
@keyframes drift{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-20px)}50%{transform:translate(-20px,30px)}75%{transform:translate(20px,20px)}}
@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-20px) scale(1.2);opacity:.15}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

/* Hide Keycloak */
#kc-header,#kc-header-wrapper,.pf-v5-c-brand,.pf-v5-c-login__main-header,.pf-v5-c-title,.pf-v5-c-login__footer,.pf-v5-c-login__info,#kc-info,#kc-locale,.pf-v5-c-login__header,[class*="pf-v5-c-brand"],img[src*="logo"],img[alt*="logo" i],img[alt*="keycloak" i],.pf-v5-c-page__header,.pf-v5-c-masthead,nav.pf-v5-c-nav,.pf-v5-c-page__sidebar,#kc-page-title,.pf-v5-c-login__main-header-desc{display:none!important}
.pf-v5-c-login,.pf-v5-c-login__container,.pf-v5-c-login__main,.pf-v5-c-login__main-body,.pf-v5-l-grid,.pf-v5-l-grid__item,.pf-v5-l-split,.pf-v5-c-page,.pf-v5-c-page__main,.pf-v5-c-login__main-footer-band{all:unset!important;display:block!important;width:100%!important}
</style>

<div class="bg">
  <div class="bg-g bg-1"></div>
  <div class="bg-g bg-2"></div>
  <div class="bg-g bg-3"></div>
  <div class="grid-bg"></div>
  <div class="p p1"></div><div class="p p2"></div><div class="p p3"></div>
  <div class="p p4"></div><div class="p p5"></div><div class="p p6"></div>
</div>

<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="logo">
        <div class="logo-i"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a1f14" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
        <span class="logo-t">EduAI</span>
      </div>
      <h1>Bon <span>retour</span> !</h1>
      <p>Connectez-vous pour continuer votre apprentissage</p>
    </div>

    <div class="fc">
      <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
        <div class="al">${kcSanitize(message.summary)?no_esc}</div>
      </#if>

      <form id="kc-form-login" onsubmit="login.disabled=true;return true;" action="${url.loginAction}" method="post">
        <div class="fg">
          <label for="username" class="lb">
            <#if !realm.loginWithEmailAllowed>${msg("username")}
            <#elseif !realm.registrationEmailAsUsername>Email ou nom d'utilisateur
            <#else>Adresse email</#if>
          </label>
          <div class="ip-wrap">
            <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input tabindex="1" id="username" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username" class="ip" placeholder="vous@exemple.com"/>
          </div>
        </div>

        <div class="fg">
          <div class="fg-top">
            <label for="password" class="lb">Mot de passe</label>
            <#if realm.resetPasswordAllowed>
              <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="fgt">Oublié ?</a>
            </#if>
          </div>
          <div class="ip-wrap">
            <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input tabindex="2" id="password" name="password" type="password" autocomplete="current-password" class="ip" placeholder="••••••••"/>
          </div>
        </div>

        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
        <button tabindex="4" name="login" id="kc-login" type="submit" class="btn">Se connecter →</button>
      </form>

      <div class="sep"><div class="sep-l"></div><span class="sep-t">ou continuer avec</span><div class="sep-l"></div></div>

      <div class="soc">
        <#if social?? && social.providers?has_content>
          <#list social.providers as p>
            <#if p.alias="google"><a href="${p.loginUrl}" class="sb"><svg viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91c1.7-1.57 2.68-3.87 2.68-6.62z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.96 10.71c-.18-.59-.28-1.17-.28-1.71s.1-1.17.28-1.71V4.96H.96A9 9 0 000 9s0 0 0 0c0 1.45.35 2.83.96 4.04l3-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/></svg>Google</a></#if>
            <#if p.alias="github"><a href="${p.loginUrl}" class="sb"><svg viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>GitHub</a></#if>
          </#list>
        <#else>
          <a href="#" class="sb"><svg viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91c1.7-1.57 2.68-3.87 2.68-6.62z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.96 10.71c-.18-.59-.28-1.17-.28-1.71s.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/></svg>Google</a>
          <a href="#" class="sb"><svg viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>GitHub</a>
        </#if>
      </div>

      <div class="trust"><div class="trust-dot"></div><span>Connexion sécurisée par <em>Keycloak</em></span></div>
    </div>

    <div class="btm">
      <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
        <p>Pas encore de compte ? <a href="${url.registrationUrl}">Créer un compte</a></p>
      </#if>
    </div>
  </div>
</div>
</#if>
</@layout.registrationLayout>
