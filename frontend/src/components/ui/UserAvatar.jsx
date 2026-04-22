'use client';
import Image from 'next/image';



const SIZES = {
    xs: { box: 'w-7 h-7', text: 'text-[10px]', radius: 'rounded-full' },
    sm: { box: 'w-9 h-9', text: 'text-xs', radius: 'rounded-full' },
    md: { box: 'w-11 h-11', text: 'text-sm', radius: 'rounded-full' },
    lg: { box: 'w-16 h-16', text: 'text-xl', radius: 'rounded-2xl' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', radius: 'rounded-2xl' },
};

export default function UserAvatar({ user, size = 'md', className = '' }) {
    const { box, text, radius } = SIZES[size] || SIZES.md;
    const initial = user?.name?.[0]?.toUpperCase() || '?';
    const src = user?.avatar;

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
                    className={`w-full h-full bg-gradient-to-br from-violet-400 to-teal-600 flex items-center justify-center font-bold text-white ${text}`}
                    style={{ display: 'none' }}
                >
                    {initial}
                </div>
            </div>
        );
    }


    return (
        <div
            className={`${box} ${radius} bg-gradient-to-br from-violet-400 to-teal-600 flex items-center justify-center font-bold text-white flex-shrink-0 ${text} ${className}`}
        >
            {initial}
        </div>
    );
}
