import { useAuth } from "@/_core/hooks/useAuth";
import NotFound from "@/pages/NotFound";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <main className="min-h-screen bg-[#FBFCFF]" aria-busy="true" />;
  }

  return isAdmin ? <>{children}</> : <NotFound />;
}
