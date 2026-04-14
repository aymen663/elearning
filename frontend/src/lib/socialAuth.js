import api from './api';


export async function handleSocialLogin(provider, credential) {
    try {
        const { data } = await api.post('/auth/social', { provider, credential });

        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (err) {
        console.error(`Social login (${provider}) failed:`, err.response?.data?.message || err.message);
        return null;
    }
}
