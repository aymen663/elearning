import './globals.css';
import { Toaster } from 'react-hot-toast';
import KeycloakProvider from '@/lib/KeycloakProvider';

export const metadata = {
    title: 'EduAI – Plateforme E-Learning',
    description: 'Plateforme e-learning intelligente avec tuteur IA, quiz adaptatifs et suivi de progression.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body>
                <KeycloakProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#1c1c30',
                                color: '#e2e8f0',
                                border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: '12px',
                            },
                        }}
                    />
                </KeycloakProvider>
            </body>
        </html>
    );
}
