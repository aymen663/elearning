<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') ; section>
<#if section = "header">
    ${msg("registerTitle")}
<#elseif section = "form">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif!important;background:#060e0a!important;min-height:100vh;overflow-x:hidden!important}

.bg{position:fixed;inset:0;z-index:0;overflow:hidden}
.bg-g{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none}
.bg-1{width:600px;height:600px;top:-15%;left:-10%;background:#0d4a30;opacity:.5;animation:drift 20s ease-in-out infinite}
.bg-2{width:500px;height:500px;bottom:-10%;right:-10%;background:#1a6b42;opacity:.3;animation:drift 25s ease-in-out infinite reverse}
.bg-3{width:300px;height:300px;top:40%;left:50%;background:#D4E157;opacity:.04;animation:drift 18s ease-in-out infinite 5s}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(212,225,87,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,225,87,.03) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,black,transparent)}

.p{position:absolute;border-radius:50%;pointer-events:none}
.p1{width:4px;height:4px;background:#D4E157;top:20%;left:15%;opacity:.4;animation:float 6s ease-in-out infinite}
.p2{width:3px;height:3px;background:#81C784;top:60%;left:80%;opacity:.3;animation:float 8s ease-in-out infinite 2s}
.p3{width:5px;height:5px;background:#D4E157;top:75%;left:25%;opacity:.2;animation:float 7s ease-in-out infinite 4s}
.p4{width:3px;height:3px;background:#A5D6A7;top:30%;left:70%;opacity:.25;animation:float 9s ease-in-out infinite 1s}
.p5{width:4px;height:4px;background:#D4E157;top:85%;left:60%;opacity:.15;animation:float 6.5s ease-in-out infinite 3s}
.p6{width:2px;height:2px;background:#fff;top:15%;left:55%;opacity:.2;animation:float 10s ease-in-out infinite 6s}

.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;position:relative;z-index:1}
.card{width:100%;max-width:460px;position:relative}

.hdr{text-align:center;margin-bottom:1.75rem;animation:slideUp .6s ease-out both}
.logo{display:inline-flex;align-items:center;gap:8px;margin-bottom:1.25rem}
.logo-i{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#D4E157,#9CCC65);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(212,225,87,.2)}
.logo-t{font-weight:800;font-size:1.2rem;color:#fff;letter-spacing:-.03em}
.hdr h1{font-size:1.9rem;font-weight:800;color:#fff;letter-spacing:-.03em;margin-bottom:.4rem}
.hdr h1 span{background:linear-gradient(135deg,#D4E157,#81C784);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr p{color:rgba(255,255,255,.35);font-size:.82rem;line-height:1.5}

.fc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:2rem;backdrop-filter:blur(20px);position:relative;overflow:hidden;animation:slideUp .6s ease-out .15s both}
.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,225,87,.2),transparent)}
.fc::after{content:'';position:absolute;top:-80px;right:-80px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(212,225,87,.08),transparent);pointer-events:none}

.fg{margin-bottom:.9rem;position:relative}
.lb{display:block;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
.ip-wrap{position:relative}
.ip-ic{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);width:18px;height:18px;color:rgba(255,255,255,.2);transition:color .3s;pointer-events:none}
.ip{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;padding:.72rem 1rem .72rem 2.8rem;font-size:.84rem;color:#fff;font-family:inherit;outline:none;transition:all .3s ease}
.ip-s{padding-left:1rem}
.ip::placeholder{color:rgba(255,255,255,.15)}
.ip:focus{border-color:rgba(212,225,87,.4);background:rgba(255,255,255,.06);box-shadow:0 0 0 4px rgba(212,225,87,.06),0 4px 16px rgba(0,0,0,.1)}
.fg:has(.ip:focus) .ip-ic{color:rgba(212,225,87,.6)}

.row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.row .fg{margin-bottom:0}

.btn{width:100%;padding:.82rem;background:linear-gradient(135deg,#D4E157,#9CCC65);border:none;border-radius:12px;color:#0a1f14;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .3s ease;font-family:inherit;position:relative;overflow:hidden;letter-spacing:-.01em;margin-top:.3rem}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,225,87,.25)}.btn:hover::before{opacity:1}
.btn:active{transform:translateY(0)}

.trust{display:flex;align-items:center;justify-content:center;gap:.4rem;margin-top:1.25rem;padding:.6rem;border-radius:10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}
.trust-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.4);animation:pulse 2s infinite}
.trust span{font-size:.6rem;color:rgba(255,255,255,.2);font-weight:500}
.trust em{font-style:normal;color:rgba(212,225,87,.5);font-weight:600}

.btm{text-align:center;margin-top:1.75rem;animation:slideUp .6s ease-out .3s both}
.btm p{font-size:.8rem;color:rgba(255,255,255,.25)}
.btm a{color:#D4E157;font-weight:600;text-decoration:none;position:relative}
.btm a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1.5px;background:#D4E157;transition:width .3s}
.btm a:hover::after{width:100%}

.al{padding:.65rem .9rem;border-radius:10px;margin-bottom:.9rem;font-size:.78rem;background:rgba(239,68,68,.06);color:#f87171;border:1px solid rgba(239,68,68,.12)}

@keyframes drift{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-20px)}50%{transform:translate(-20px,30px)}75%{transform:translate(20px,20px)}}
@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-20px) scale(1.2);opacity:.15}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

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
      <h1>Créer un <span>compte</span></h1>
      <p>Rejoignez EduAI et commencez à apprendre gratuitement</p>
    </div>

    <div class="fc">
      <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
        <div class="al">${kcSanitize(message.summary)?no_esc}</div>
      </#if>

      <form id="kc-register-form" action="${url.registrationAction}" method="post">
        <div class="row" style="margin-bottom:.9rem">
          <div class="fg">
            <label for="firstName" class="lb">Prénom</label>
            <div class="ip-wrap">
              <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" id="firstName" name="firstName" value="${(register.formData.firstName!'')}" class="ip" placeholder="Prénom" autocomplete="given-name"/>
            </div>
          </div>
          <div class="fg">
            <label for="lastName" class="lb">Nom</label>
            <div class="ip-wrap">
              <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" id="lastName" name="lastName" value="${(register.formData.lastName!'')}" class="ip" placeholder="Nom" autocomplete="family-name"/>
            </div>
          </div>
        </div>

        <div class="fg">
          <label for="email" class="lb">Adresse email</label>
          <div class="ip-wrap">
            <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input type="email" id="email" name="email" value="${(register.formData.email!'')}" class="ip" placeholder="vous@exemple.com" autocomplete="email"/>
          </div>
        </div>

        <#if !realm.registrationEmailAsUsername>
          <div class="fg">
            <label for="username" class="lb">Nom d'utilisateur</label>
            <div class="ip-wrap">
              <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
              <input type="text" id="username" name="username" value="${(register.formData.username!'')}" class="ip" placeholder="votre_pseudo" autocomplete="username"/>
            </div>
          </div>
        </#if>

        <div class="row" style="margin-bottom:.9rem">
          <div class="fg">
            <label for="password" class="lb">Mot de passe</label>
            <div class="ip-wrap">
              <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="password" name="password" class="ip" placeholder="••••••••" autocomplete="new-password"/>
            </div>
          </div>
          <div class="fg">
            <label for="password-confirm" class="lb">Confirmer</label>
            <div class="ip-wrap">
              <svg class="ip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <input type="password" id="password-confirm" name="password-confirm" class="ip" placeholder="••••••••" autocomplete="new-password"/>
            </div>
          </div>
        </div>

        <button type="submit" class="btn">Créer mon compte →</button>
      </form>

      <div class="trust"><div class="trust-dot"></div><span>Inscription sécurisée par <em>Keycloak</em></span></div>
    </div>

    <div class="btm">
      <p>Déjà inscrit ? <a href="${url.loginUrl}">Se connecter</a></p>
    </div>
  </div>
</div>
</#if>
</@layout.registrationLayout>
