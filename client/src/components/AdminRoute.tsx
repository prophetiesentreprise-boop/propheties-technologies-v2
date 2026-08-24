import { useAuth } from "@/_core/hooks/useAuth";
import AdminLogin from "@/pages/AdminLogin";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <main className="min-h-screen bg-[#FBFCFF]" aria-busy="true" />;
  }

  return isAdmin ? <>{children}</> : <AdminLogin />;
}
