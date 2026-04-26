'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Gamepad2, ArrowRight } from 'lucide-react';

/* ── Design Tokens ──────────────────────────────────────────────────────── */
const T = {
    card: {
        bg: '#ffffff',
        border: '1px solid #f1f5f9',
        radius: '24px',
        shadow: '0 4px 20px rgba(0,0,0,0.03)',
        shadowHover: '0 12px 30px rgba(0,0,0,0.08)',
    },
    text: {
        primary: '#111827',
        secondary: '#4b5563',
        muted: '#6b7280',
    },
};

const games = [
    {
        id: 'chess',
        name: 'Chess',
        description: 'Jouez aux échecs contre une IA — 3 niveaux de difficulté.',
        image: '/games/chess.png',
        difficulty: 'Facile',
        color: '#16a34a', // Green
        bgTag: '#f0fdf4',
        tags: ['Stratégie', 'IA'],
    },
    {
        id: 'memory',
        name: 'Memory',
        description: 'Testez votre mémoire en associant les paires le plus vite possible.',
        image: '/games/memory.png',
        difficulty: 'Facile',
        color: '#3b82f6', // Blue
        bgTag: '#eff6ff',
        tags: ['Mémoire', 'Rapidité'],
    },
    {
        id: 'mindcrash',
        name: 'MindCrash',
        description: 'Mémorisez la séquence et affrontez une IA neuronale.',
        image: '/games/mindcrash.png',
        difficulty: 'Moyen',
        color: '#ec4899', // Pink
        bgTag: '#fdf2f8',
        tags: ['Réflexes', 'Compétition'],
    },
    {
        id: 'scrabble',
        name: 'Scrabble',
        description: 'Formez des mots et marquez des points sur un plateau classique.',
        image: '/games/scrabble.png',
        difficulty: 'Facile',
        color: '#f59e0b', // Orange
        bgTag: '#fffbeb',
        tags: ['Vocabulaire', 'Réflexion'],
    },
];

export default function GamesPage() {
    const router = useRouter();
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <Sidebar>
            <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '40px' }}>

                {/* ── Header ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 32,
                    marginTop: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#f3e8ff', border: '1px solid #e9d5ff',
                        }}>
                            <Gamepad2 style={{ width: 28, height: 28, color: '#a855f7' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em', marginBottom: 2 }}>
                                Espace Jeux
                            </h1>
                            <p style={{ fontSize: 14, color: T.text.muted }}>
                                Détendez-vous et stimulez votre esprit avec nos mini-jeux
                            </p>
                        </div>
                    </div>

                    {/* Stats Pill */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 20px', borderRadius: 16,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                    }}>
                        <span style={{ fontSize: 24 }}>🔥</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>12</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Parties jouées
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Games Grid ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 24,
                }}>
                    {games.map((game) => {
                        const isHovered = hoveredId === game.id;
                        return (
                            <button
                                key={game.id}
                                onClick={() => router.push(`/games/${game.id}`)}
                                onMouseEnter={() => setHoveredId(game.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    padding: 0,
                                    borderRadius: T.card.radius,
                                    border: T.card.border,
                                    background: T.card.bg,
                                    boxShadow: isHovered ? T.card.shadowHover : T.card.shadow,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                {/* Banner Image with embedded badge */}
                                <div style={{
                                    height: 180,
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src={game.image} 
                                        alt={game.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'transform 0.4s ease'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        background: '#ffffff',
                                        color: game.color,
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        {game.difficulty}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{
                                        fontSize: 18, fontWeight: 800, color: T.text.primary,
                                        marginBottom: 8,
                                    }}>
                                        {game.name}
                                    </h3>
                                    <p style={{
                                        fontSize: 13, color: T.text.secondary,
                                        lineHeight: 1.5, marginBottom: 20, flex: 1,
                                    }}>
                                        {game.description}
                                    </p>

                                    {/* Footer: Tags + Jouer */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {game.tags.map(tag => (
                                                <span key={tag} style={{
                                                    padding: '4px 10px', borderRadius: 8, fontSize: 11,
                                                    fontWeight: 600,
                                                    background: game.bgTag,
                                                    color: game.color,
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            fontSize: 13, fontWeight: 700, color: game.color,
                                            transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
                                            transition: 'all 0.2s',
                                        }}>
                                            Jouer <ArrowRight style={{ width: 14, height: 14 }} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* ── Trophy Card (placed dynamically via CSS Grid) ── */}
                    <div style={{
                        gridColumn: '3',
                        alignSelf: 'end', // Prevents the card from stretching vertically
                        background: 'linear-gradient(135deg, #eefaf1 0%, #dcfce7 100%)',
                        borderRadius: T.card.radius,
                        border: '1px solid #bbf7d0',
                        padding: '28px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 30px rgba(22, 163, 74, 0.08)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Text and Button */}
                        <div style={{ flex: 1, position: 'relative', zIndex: 2, paddingRight: '12px' }}>
                            <h3 style={{
                                fontSize: 16, fontWeight: 700, color: '#065f46',
                                lineHeight: 1.4, marginBottom: 20
                            }}>
                                Relevez des défis, améliorez-vous et gagnez des badges !
                            </h3>
                            <button style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '10px 16px',
                                fontSize: 13,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.2)'; }}
                            >
                                Voir mes badges 🏅
                            </button>
                        </div>
                        
                        {/* Trophy Image */}
                        <div style={{
                            width: '110px',
                            height: '110px',
                            flexShrink: 0,
                            position: 'relative',
                            marginRight: '-10px'
                        }}>
                            <img 
                                src="/games/trophy.png" 
                                alt="Trophy" 
                                style={{ 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '180px', 
                                    height: '180px', 
                                    maxWidth: 'none',
                                    objectFit: 'cover',
                                    mixBlendMode: 'multiply',
                                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 65%)',
                                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 65%)',
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </Sidebar>
    );
}
