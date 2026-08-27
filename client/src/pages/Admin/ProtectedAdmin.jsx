import { Navigate } from "react-router-dom";
import Admin from "./Admin";

function ProtectedAdmin() {
  const token = sessionStorage.getItem(
    "uvaExplorerAdminToken"
  );

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Admin />;
}

export default ProtectedAdmin;