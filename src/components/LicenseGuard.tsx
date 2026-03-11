import { Navigate } from "react-router-dom";

const LicenseGuard = ({ children }: { children: React.ReactNode }) => {
  const valid = sessionStorage.getItem("license_valid") === "true";
  if (!valid) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default LicenseGuard;
