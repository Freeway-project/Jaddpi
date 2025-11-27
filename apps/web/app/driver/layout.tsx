import ProtectedDriverRoute from '../../components/auth/ProtectedDriverRoute';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedDriverRoute>
            {children}
        </ProtectedDriverRoute>
    );
}
