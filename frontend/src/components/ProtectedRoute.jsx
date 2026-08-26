import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-mint-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  return children;
}
