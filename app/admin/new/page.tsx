import AdminItemForm from "../AdminItemForm";
import { requireAdmin } from "../../../lib/auth";

export default async function NewAdminItemPage() {
  await requireAdmin();
  return <AdminItemForm />;
}
