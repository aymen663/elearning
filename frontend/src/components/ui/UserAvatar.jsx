'use client';
import Image from 'next/image';



const SIZES = {
    xs: { box: 'w-7 h-7', text: 'text-[10px]', radius: 'rounded-full' },
    sm: { box: 'w-9 h-9', text: 'text-xs', radius: 'rounded-full' },
    md: { box: 'w-11 h-11', text: 'text-sm', radius: 'rounded-full' },
    lg: { box: 'w-16 h-16', text: 'text-xl', radius: 'rounded-2xl' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', radius: 'rounded-2xl' },
};

export default function UserAvatar({ user, size = 'md', className = '', variant = 'default' }) {
    const { box, text, radius } = SIZES[size] || SIZES.md;
    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const src = user?.avatar;
    const bg = variant === 'green' ? '#16a34a' : '#1e293b';

    if (src) {
        return (
            <div className={`${box} ${radius} overflow-hidden flex-shrink-0 ${className}`}>
                <img
                    src={src}
                    alt={user?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {

                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div
                    className={`w-full h-full flex items-center justify-center font-bold text-white ${text}`}
                    style={{ display: 'none', background: bg }}
                >
                    {initials}
                </div>
            </div>
        );
    }


    return (
        <div
            className={`${box} ${radius} flex items-center justify-center font-bold text-white flex-shrink-0 ${text} ${className}`}
            style={{ background: bg }}
        >
            {initials}
        </div>
    );
}
