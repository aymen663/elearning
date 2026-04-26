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
.p1{width:10px;height:10px;background:#D4E157;top:15%;left:5%;opacity:.4;animation:floatY 4s ease-in-out infinite}
.p2{width:8px;height:8px;background:#D4E157;top:25%;right:8%;opacity:.25;animation:floatY 5s ease-in-out infinite 1s}
.p3{width:12px;height:12px;background:#D4E157;bottom:20%;left:12%;opacity:.3;animation:floatY 6s ease-in-out infinite 2s}
.p4{width:6px;height:6px;background:#D4E157;top:60%;right:4%;opacity:.35;animation:floatY 4.5s ease-in-out infinite .5s}
.p5{width:8px;height:8px;background:#D4E157;top:45%;left:3%;opacity:.2;animation:floatY 5.5s ease-in-out infinite 1.5s}
.p6{width:6px;height:6px;background:#4CAF50;bottom:30%;right:15%;opacity:.3;animation:floatY 3.5s ease-in-out infinite 3s}
.p7{width:8px;height:8px;background:#81C784;top:10%;right:35%;opacity:.2;animation:floatY 4.8s ease-in-out infinite 2.5s}


/* Split layout */
.split-wrap{min-height:100vh;display:flex;position:relative;z-index:1}
.left-panel{display:none;width:50%;flex-direction:column;justify-content:center;align-items:center;padding:3rem;background:transparent;text-align:center;gap:1.5rem}
.left-panel .illust{width:320px;height:320px;object-fit:cover;border-radius:50%;animation:floatImg 6s ease-in-out infinite;border:3px solid rgba(212,225,87,.15);box-shadow:0 0 60px rgba(212,225,87,.08),0 20px 40px rgba(0,0,0,.3)}
.left-panel h2{font-size:1.8rem;font-weight:800;color:#fff;line-height:1.3;max-width:380px}
.left-panel h2 em{font-style:normal;color:#D4E157}
.left-panel .sub{color:rgba(255,255,255,.35);font-size:.82rem;max-width:340px;line-height:1.6}
.pills{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-top:.5rem}
.pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(212,225,87,.06);border:1px solid rgba(212,225,87,.12);font-size:.65rem;font-weight:600;color:rgba(255,255,255,.45)}
.pill svg{width:14px;height:14px;color:#D4E157;opacity:.8}
.stats-row{display:flex;gap:2.5rem;margin-top:1rem}
.stat{text-align:center}
.stat strong{display:block;font-size:1.2rem;font-weight:800;color:#fff}
.stat span{font-size:.6rem;color:rgba(255,255,255,.25)}

@media(min-width:900px){.left-panel{display:flex}}

.right-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:2rem}
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
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

#kc-header,#kc-header-wrapper,.pf-v5-c-brand,.pf-v5-c-login__main-header,.pf-v5-c-title,.pf-v5-c-login__footer,.pf-v5-c-login__info,#kc-info,#kc-locale,.pf-v5-c-login__header,[class*="pf-v5-c-brand"],img[src*="logo"],img[alt*="logo" i],img[alt*="keycloak" i],.pf-v5-c-page__header,.pf-v5-c-masthead,nav.pf-v5-c-nav,.pf-v5-c-page__sidebar,#kc-page-title,.pf-v5-c-login__main-header-desc{display:none!important}
.pf-v5-c-login,.pf-v5-c-login__container,.pf-v5-c-login__main,.pf-v5-c-login__main-body,.pf-v5-l-grid,.pf-v5-l-grid__item,.pf-v5-l-split,.pf-v5-c-page,.pf-v5-c-page__main,.pf-v5-c-login__main-footer-band{all:unset!important;display:block!important;width:100%!important}
.light-mode .ip:focus { border-color: #059669 !important; box-shadow: 0 0 0 4px rgba(5,150,105,0.15) !important; }
.light-mode .ip-ic { color: #9CA3AF !important; }
.light-mode .fg:has(.ip:focus) .ip-ic { color: #059669 !important; }
.light-mode .sb svg[fill="rgba(255,255,255,.5)"] { fill: #111827 !important; }
</style>

<div class="bg">
  <div class="bg-g bg-1"></div>
  <div class="bg-g bg-2"></div>
  <div class="bg-g bg-3"></div>
  <div class="grid-bg"></div>
  <div class="p p1"></div><div class="p p2"></div><div class="p p3"></div>
  <div class="p p4"></div><div class="p p5"></div><div class="p p6"></div>
  <div class="p p7"></div>
</div>

<div class="split-wrap">
  <!-- LEFT PANEL -->
  <div class="left-panel">
    <img src="${url.resourcesPath}/img/login-illustration.png" alt="E-learning" class="illust" />
    <h2>Apprenez avec <em>intelligence</em>, progressez avec <em>passion</em>.</h2>
    <p class="sub">Rejoignez des milliers d'étudiants qui transforment leur avenir grâce à nos cours interactifs et notre tuteur IA.</p>
    <div class="pills">
      <div class="pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10h16V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="12" cy="15" r="2"/></svg>Tuteur IA</div>
      <div class="pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Quiz adaptatifs</div>
      <div class="pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Suivi en temps réel</div>
    </div>
    <div class="stats-row">
      <div class="stat"><strong>260+</strong><span>Cours</span></div>
      <div class="stat"><strong>5 340+</strong><span>Étudiants</span></div>
      <div class="stat"><strong>99%</strong><span>Satisfaction</span></div>
    </div>
  </div>

  <!-- RIGHT PANEL -->
  <div class="right-panel">
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
</div>

<style>
body.light-mode { background: linear-gradient(135deg, #EEF2F0 0%, #E2E8E5 50%, #D1D8D4 100%) !important; }
.light-mode .fc { background: #FFFFFF !important; border: 1.5px solid #059669 !important; box-shadow: 0 10px 40px rgba(0,0,0,0.06) !important; padding: 2.5rem !important; border-radius: 24px !important; backdrop-filter: none !important; }
.light-mode .fc::before { display: none !important; }
.light-mode .fc::after { display: none !important; }
.light-mode .left-panel h2, .light-mode .hdr h1, .light-mode .stat strong, .light-mode .logo-t, .light-mode .btm p { color: #111827 !important; }
.light-mode .sub, .light-mode .hdr p, .light-mode .stat span, .light-mode .lb, .light-mode .sep-t, .light-mode .trust span { color: #4B5563 !important; }
.light-mode .ip { background: #FFFFFF !important; border: 1.5px solid rgba(5,150,105,0.4) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important; color: #111827 !important; }
.light-mode .ip::placeholder { color: #9CA3AF !important; }
.light-mode .btn { background: #059669 !important; color: #ffffff !important; }
.light-mode .btn:hover { box-shadow: 0 8px 30px rgba(5,150,105,.25) !important; }
.light-mode .sb { background: #FFFFFF !important; border: 1.5px solid rgba(0,0,0,0.08) !important; color: #4B5563 !important; }
.light-mode .sb:hover { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.12) !important; color: #111827 !important; }
.light-mode .p { background: #059669 !important; }
.light-mode .bg-1 { background: #F0FDF4 !important; opacity: 0.8 !important; }
.light-mode .bg-2 { background: #ECFDF5 !important; opacity: 0.8 !important; }
.light-mode .bg-3 { background: #059669 !important; opacity: 0.04 !important; }
.light-mode .grid-bg { background-image: linear-gradient(rgba(5,150,105,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(5,150,105,.04) 1px,transparent 1px) !important; }
.light-mode .left-panel h2 em { color: #059669 !important; }
.light-mode .hdr h1 span { background: #059669 !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
.light-mode .pill { background: rgba(5,150,105,0.08) !important; border: 1px solid rgba(5,150,105,0.12) !important; color: #4B5563 !important; }
.light-mode .pill svg { color: #059669 !important; }
.light-mode .logo-i { background: #059669 !important; box-shadow: 0 8px 24px rgba(5,150,105,.2) !important; }
.light-mode .btm a { color: #059669 !important; }
.light-mode .btm a::after { background: #059669 !important; }
.light-mode .fgt { color: #059669 !important; }
.light-mode .trust-dot { background: #059669 !important; box-shadow: 0 0 8px rgba(5,150,105,.4) !important; }
.light-mode .trust em { color: #059669 !important; }
</style>
<script>
(function() {
    var match = document.cookie.match(new RegExp('(^| )eduai_theme=([^;]+)'));
    if (match && match[2] === 'light') {
        document.body.classList.add('light-mode');
    }
})();
</script>

</#if>
</@layout.registrationLayout>
