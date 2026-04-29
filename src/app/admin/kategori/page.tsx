import { saveCategoryAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, SelectField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminCategories } from "@/lib/data/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminPageHeader title="Kategori Wisata" description="Kelola kategori destinasi dan paket." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah kategori" action={saveCategoryAction}>
            <TextField name="name" label="Nama kategori" required />
            <TextField name="slug" label="Slug" required />
            <TextareaField name="description" label="Deskripsi" />
            <TextField name="icon" label="Icon lucide" />
            <SelectField name="type" label="Tipe" options={[{ label: "Destination", value: "destination" }, { label: "Package", value: "package" }]} />
          </AdminFormCard>
          {categories.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.name}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update kategori" action={saveCategoryAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="name" label="Nama kategori" defaultValue={item.name} required />
                  <TextField name="slug" label="Slug" defaultValue={item.slug} required />
                  <TextareaField name="description" label="Deskripsi" defaultValue={item.description} />
                  <TextField name="icon" label="Icon lucide" defaultValue={item.icon} />
                  <SelectField name="type" label="Tipe" defaultValue={item.type} options={[{ label: "Destination", value: "destination" }, { label: "Package", value: "package" }]} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={categories.map((item) => ({ ...item }))}
          columns={[
            { key: "name", header: "Nama" },
            { key: "slug", header: "Slug" },
            { key: "type", header: "Tipe" },
            { key: "created_at", header: "Dibuat", format: "date" },
          ]}
          deleteTable="categories"
          revalidatePath="/admin/kategori"
        />
      </div>
    </div>
  );
}
