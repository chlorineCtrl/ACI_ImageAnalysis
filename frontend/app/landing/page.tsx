import UploadAndDetect from "../components/UploadAndDetect";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <UploadAndDetect />
    </ProtectedRoute>
  );
}
