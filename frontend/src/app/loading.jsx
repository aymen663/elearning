import CubeLoader from '@/components/ui/CubeLoader';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <CubeLoader />
        </div>
    );
}
