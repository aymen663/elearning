'use client';
import { useEffect, useState } from 'react';
import { studentAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Award, BookOpen, Loader2, Trophy, Download, ChevronRight, Shield, Linkedin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/authStore';
import { QRCodeSVG } from 'qrcode.react';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatDate = (d) =>
    new Date(d || Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

const buildCertId = (cert) => {
    const suffix = String(cert?.course?._id || 'DEMO').slice(-6).toUpperCase();
    const year = new Date(cert?.completedAt || Date.now()).getFullYear();
    return `EDUAI-${suffix}-${year}`;
};

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        studentAPI.getCertificates()
            .then(({ data }) => {
                const list = data.certificates || [];
                setCertificates(list);
                if (list.length > 0) setSelected(list[0]);
            })
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Award className="w-7 h-7 text-amber-400" /> Mes certifications
                    </h1>
                    <p className="page-subtitle">Cours complétés à 100 %</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
            ) : certificates.length === 0 ? (
                <div className="card text-center py-20 max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-amber-600/10 flex items-center justify-center mx-auto mb-5">
                        <Trophy className="w-10 h-10 text-amber-500/40" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Aucune certification encore
                    </h2>
                    <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Terminez un cours à 100 % pour obtenir votre première certification.
                    </p>
                    <Link href="/courses" className="btn-primary mx-auto w-fit">
                        <BookOpen className="w-4 h-4" /> Explorer les cours
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sidebar list */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                            {certificates.length} certification(s)
                        </p>
                        {certificates.map((cert, i) => (
                            <button key={i} onClick={() => setSelected(cert)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3`}
                                style={{
                                    background: selected === cert ? 'rgba(251,191,36,0.06)' : 'var(--bg-card)',
                                    borderColor: selected === cert ? 'rgba(251,191,36,0.35)' : 'var(--border)',
                                    boxShadow: selected === cert ? '0 0 0 1px rgba(251,191,36,0.2)' : 'none',
                                }}>
                                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                                    style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
                                    <Award className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                        {cert.course?.title}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(cert.completedAt)}</p>
                                </div>
                                {selected === cert && <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>

                    {/* Certificate preview */}
                    {selected && (
                        <div className="flex-1 min-w-0">
                            <CertificateViewer cert={selected} studentName={user?.name} />
                        </div>
                    )}
                </div>
            )}
        </Sidebar>
    );
}

/* ─── Certificate viewer (wrapper with actions) ────────────────────────────── */
function CertificateViewer({ cert, studentName }) {
    const date = formatDate(cert?.completedAt);
    const certId = buildCertId(cert);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eduai.com';
    const verifyUrl = `${origin}/verify/${certId}`;
    const instructor = cert?.course?.instructor?.name || 'Marie Dubois';
    const lessonCount = cert?.course?.lessons?.length || cert?.lessonsCompleted || 0;
    const duration = cert?.course?.totalDuration || 0;
    const courseTitle = cert?.course?.title || 'Cours';

    const getLinkedInUrl = () => {
        const params = new URLSearchParams({
            startTask: 'CERTIFICATION_NAME',
            name: `${courseTitle} — EduAI`,
            organizationId: '0',
            issueYear: new Date(cert?.completedAt || Date.now()).getFullYear(),
            issueMonth: new Date(cert?.completedAt || Date.now()).getMonth() + 1,
            certUrl: verifyUrl,
            certId: certId,
        });
        return `https://www.linkedin.com/profile/add?${params}`;
    };

    const handlePrint = () => {
        const certHtml = document.getElementById('cert-printable')?.outerHTML;
        if (!certHtml) return;
        const win = window.open('', '_blank', 'width=1120,height=860');
        win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Certificat — ${courseTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    body{background:#f4f1ea;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Inter',sans-serif}
    ${CERT_PRINT_CSS}
    @media print{body{background:#f4f1ea;margin:0}.cert-shell{box-shadow:none!important}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
  ${certHtml}
  <script>window.onload=()=>{setTimeout(()=>{window.print();window.onafterprint=()=>window.close()},400)}<\/script>
</body>
</html>`);
        win.document.close();
    };

    return (
        <div>
            {/* Action bar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Aperçu du certificat
                    </p>
                    <p className="text-xs mt-0.5 font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {certId}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <a href={getLinkedInUrl()} target="_blank" rel="noopener noreferrer"
                        className="btn-nav text-xs px-3 py-2 gap-1.5">
                        <Linkedin className="w-3.5 h-3.5" /> Partager sur LinkedIn
                    </a>
                    <button onClick={handlePrint} className="btn-primary text-sm gap-2">
                        <Download className="w-4 h-4" /> Télécharger PDF
                    </button>
                </div>
            </div>

            {/* Certificate */}
            <div className="overflow-x-auto rounded-3xl shadow-2xl shadow-black/30">
                <CertContent
                    id="cert-printable"
                    studentName={studentName}
                    courseTitle={courseTitle}
                    date={date}
                    certId={certId}
                    verifyUrl={verifyUrl}
                    instructor={instructor}
                    lessonCount={lessonCount}
                    duration={duration}
                />
            </div>
            <p className="text-xs text-center mt-3 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Shield className="w-3 h-3" />
                Scannez le QR code pour vérifier l'authenticité de ce certificat.
            </p>
        </div>
    );
}

/* ─── The certificate itself ───────────────────────────────────────────────── */
function CertContent({ id, studentName, courseTitle, date, certId, verifyUrl, instructor, lessonCount, duration }) {
    const courseTitleUpper = courseTitle.toUpperCase();
    const directorName = 'Dr. Ahmed Ben Ali';

    return (
        <div id={id} className="cert-shell" style={{ minWidth: '700px' }}>
            <div className="cert-border-outer">
                <div className="cert-border-inner">

                    {/* SVG corner ornaments */}
                    {['tl', 'tr', 'bl', 'br'].map((pos) => (
                        <svg key={pos} className={`cert-corner cert-corner-${pos}`} viewBox="0 0 60 60" fill="none">
                            <path d={pos.includes('t')
                                ? (pos === 'tl' ? 'M2 58 L2 2 L58 2' : 'M58 58 L58 2 L2 2')
                                : (pos === 'bl' ? 'M2 2 L2 58 L58 58' : 'M58 2 L58 58 L2 58')}
                                stroke="url(#g-gold)" strokeWidth="2.5" strokeLinecap="round" />
                            <path d={pos.includes('t')
                                ? (pos === 'tl' ? 'M8 52 L8 8 L52 8' : 'M52 52 L52 8 L8 8')
                                : (pos === 'bl' ? 'M8 8 L8 52 L52 52' : 'M52 8 L52 52 L8 52')}
                                stroke="url(#g-gold)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
                            <circle cx={pos.includes('l') ? 8 : 52} cy={pos.includes('t') ? 8 : 52} r="3.5" fill="url(#g-gold)" />
                            <defs>
                                <linearGradient id="g-gold" x1="0" y1="0" x2="60" y2="60">
                                    <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
                                </linearGradient>
                            </defs>
                        </svg>
                    ))}

                    {/* ── Header ── */}
                    <div className="cert-header">
                        <div className="cert-logo">🎓 EduAI</div>
                        <div className="cert-tagline">Plateforme d'Apprentissage Intelligente</div>
                        <div className="cert-divider-gold"><span className="cert-divider-diamond">◆</span></div>
                        <div className="cert-type">CERTIFICAT DE RÉUSSITE</div>
                    </div>

                    {/* ── Body ── */}
                    <div className="cert-body">
                        <p className="cert-awarded-to">Ce certificat est décerné à</p>
                        <div className="cert-student-name">{studentName || 'L\'étudiant'}</div>
                        <div className="cert-name-underline" />
                        <p className="cert-completed-text">pour avoir complété avec succès le cours</p>

                        {/* Course title — academic style, NOT a button */}
                        <div className="cert-course-block">
                            <p className="cert-course-label">COURS COMPLÉTÉ</p>
                            <h2 className="cert-course-title-academic">{courseTitleUpper}</h2>
                        </div>

                        {/* Stats row */}
                        {(lessonCount > 0 || duration > 0) && (
                            <div className="cert-stats-row">
                                {lessonCount > 0 && (
                                    <div className="cert-stat">
                                        <span className="cert-stat-value">{lessonCount}</span>
                                        <span className="cert-stat-label">Leçons complétées</span>
                                    </div>
                                )}
                                {duration > 0 && (
                                    <div className="cert-stat">
                                        <span className="cert-stat-value">{duration}h</span>
                                        <span className="cert-stat-label">Durée totale</span>
                                    </div>
                                )}
                                <div className="cert-stat">
                                    <span className="cert-stat-value">100%</span>
                                    <span className="cert-stat-label">Score de complétion</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Seal + Date + QR ── */}
                    <div className="cert-seal-row">
                        {/* Gold seal */}
                        <div className="cert-seal-outer">
                            <div className="cert-seal-inner">
                                <span className="cert-seal-check">✓</span>
                                <span className="cert-seal-label">CERTIFIÉ</span>
                                <span className="cert-seal-year">{new Date().getFullYear()}</span>
                            </div>
                        </div>

                        {/* Date + ID */}
                        <div className="cert-date-block">
                            <p className="cert-date-label">Délivré le</p>
                            <p className="cert-date-value">{date}</p>
                            <div className="cert-id-badge">
                                <span className="cert-id-text">{certId}</span>
                            </div>
                        </div>

                        {/* QR */}
                        <div className="cert-qr-block">
                            <QRCodeSVG value={verifyUrl} size={76} level="M" fgColor="#312e81" bgColor="transparent" />
                            <p className="cert-qr-scan">Scan to verify</p>
                            <p className="cert-qr-url">eduai.com/verify</p>
                        </div>
                    </div>

                    {/* ── Signatures ── */}
                    <div className="cert-footer">
                        <div className="cert-sig">
                            <div className="cert-sig-cursive">{directorName}</div>
                            <div className="cert-sig-line" />
                            <div className="cert-sig-name-bold">{directorName}</div>
                            <div className="cert-sig-title">Directeur EduAI</div>
                        </div>
                        <div className="cert-footer-seal-center">
                            <div className="cert-footer-emblem">◆</div>
                            <p className="cert-footer-institution">EduAI</p>
                        </div>
                        <div className="cert-sig">
                            <div className="cert-sig-cursive">{instructor}</div>
                            <div className="cert-sig-line" />
                            <div className="cert-sig-name-bold">{instructor}</div>
                            <div className="cert-sig-title">Instructeur du cours</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ─── Print CSS ────────────────────────────────────────────────────────────── */
const CERT_PRINT_CSS = `
  .cert-shell{font-family:'Inter',sans-serif}
  .cert-border-outer{background:linear-gradient(135deg,#fdf8ee 0%,#f0ead8 50%,#fdf8ee 100%);border:5px solid transparent;border-image:linear-gradient(135deg,#f59e0b,#d97706,#b45309,#d97706,#f59e0b) 1;padding:14px}
  .cert-border-inner{border:1.5px solid rgba(245,158,11,0.4);padding:44px 56px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 20% 50%,rgba(245,158,11,0.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(79,70,229,0.03) 0%,transparent 60%)}
  .cert-corner{position:absolute;width:60px;height:60px}
  .cert-corner-tl{top:14px;left:14px}.cert-corner-tr{top:14px;right:14px}.cert-corner-bl{bottom:14px;left:14px}.cert-corner-br{bottom:14px;right:14px}
  .cert-header{text-align:center;margin-bottom:30px}
  .cert-logo{font-size:30px;font-weight:800;letter-spacing:3px;margin-bottom:4px;background:linear-gradient(135deg,#4f46e5,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .cert-tagline{font-size:10px;color:#9ca3af;letter-spacing:5px;text-transform:uppercase;margin-bottom:18px}
  .cert-divider-gold{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px}
  .cert-divider-gold::before,.cert-divider-gold::after{content:'';flex:1;max-width:130px;height:1px}
  .cert-divider-gold::before{background:linear-gradient(90deg,transparent,#d97706)}
  .cert-divider-gold::after{background:linear-gradient(90deg,#d97706,transparent)}
  .cert-divider-diamond{color:#d97706;font-size:10px}
  .cert-type{font-size:11px;font-weight:700;letter-spacing:8px;color:#92400e;text-transform:uppercase}
  .cert-body{text-align:center;margin-bottom:28px}
  .cert-awarded-to{font-size:13px;color:#6b7280;margin-bottom:10px;font-style:italic}
  .cert-student-name{font-family:'Playfair Display',Georgia,serif;font-size:46px;font-style:italic;font-weight:700;margin-bottom:8px;line-height:1.1;background:linear-gradient(135deg,#1e1b4b,#3730a3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .cert-name-underline{width:260px;height:1.5px;margin:0 auto 16px;background:linear-gradient(90deg,transparent,#d97706,transparent)}
  .cert-completed-text{font-size:13px;color:#6b7280;margin-bottom:16px}
  .cert-course-block{margin-bottom:16px}
  .cert-course-label{font-size:10px;font-weight:700;letter-spacing:4px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px}
  .cert-course-title-academic{font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:#1e1b4b;letter-spacing:1px;line-height:1.3}
  .cert-stats-row{display:inline-flex;align-items:center;gap:0;border:1px solid rgba(245,158,11,0.25);border-radius:12px;overflow:hidden;margin-top:16px}
  .cert-stat{padding:10px 20px;text-align:center;border-right:1px solid rgba(245,158,11,0.2)}
  .cert-stat:last-child{border-right:none}
  .cert-stat-value{display:block;font-size:18px;font-weight:700;color:#1e1b4b}
  .cert-stat-label{display:block;font-size:10px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-top:2px}
  .cert-seal-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding:0 20px}
  .cert-seal-outer{width:96px;height:96px;border-radius:50%;background:conic-gradient(from 0deg,#f59e0b,#e8920a,#b45309,#e8920a,#f59e0b);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(245,158,11,0.4),inset 0 1px 0 rgba(255,255,255,0.3)}
  .cert-seal-inner{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#fef9e7,#fde68a);display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid rgba(245,158,11,0.5)}
  .cert-seal-check{font-size:24px;color:#92400e;font-weight:900;line-height:1}
  .cert-seal-label{font-size:6.5px;font-weight:800;letter-spacing:2.5px;color:#78350f;margin-top:2px}
  .cert-seal-year{font-size:9px;font-weight:700;color:#92400e;margin-top:1px}
  .cert-date-block{text-align:center}
  .cert-date-label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px}
  .cert-date-value{font-size:15px;font-weight:600;color:#374151;margin-bottom:8px}
  .cert-id-badge{display:inline-flex;padding:4px 12px;background:rgba(79,70,229,0.06);border:1px solid rgba(79,70,229,0.2);border-radius:6px}
  .cert-id-text{font-size:11px;font-family:monospace;color:#4338ca;font-weight:600;letter-spacing:1px}
  .cert-qr-block{display:flex;flex-direction:column;align-items:center;gap:3px}
  .cert-qr-scan{font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
  .cert-qr-url{font-size:9px;color:#9ca3af}
  .cert-footer{display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid rgba(245,158,11,0.3);padding-left:30px;padding-right:30px}
  .cert-footer-seal-center{text-align:center}
  .cert-footer-emblem{font-size:16px;color:rgba(245,158,11,0.6)}
  .cert-footer-institution{font-size:10px;font-weight:700;letter-spacing:4px;color:#9ca3af;text-transform:uppercase;margin-top:2px}
  .cert-sig{text-align:center;min-width:160px}
  .cert-sig-cursive{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-style:italic;color:#374151;margin-bottom:8px;line-height:1.2}
  .cert-sig-line{width:150px;height:1px;margin:0 auto 6px;background:linear-gradient(90deg,transparent,rgba(107,114,128,0.6),transparent)}
  .cert-sig-name-bold{font-size:12px;font-weight:600;color:#374151;margin-bottom:2px}
  .cert-sig-title{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px}
`;
