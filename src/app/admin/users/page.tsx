import { updateUserAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminProfiles } from "@/lib/data/admin";

export default async function AdminUsersPage() {
  const users = await getAdminProfiles();

  return (
    <div>
      <AdminPageHeader title="Users / Customer" description="Kelola role admin/customer dan status aktif user." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataTable
          data={users.map((item) => ({ ...item }))}
          columns={[
            { key: "full_name", header: "Nama" },
            { key: "phone", header: "Phone" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "created_at", header: "Dibuat", format: "date" },
          ]}
        />
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.full_name ?? user.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateUserAction} className="flex flex-col gap-3">
                  <input type="hidden" name="id" value={user.id} />
                  <select name="role" defaultValue={user.role} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                  <select name="status" defaultValue={user.status} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <Button type="submit">Update User</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
