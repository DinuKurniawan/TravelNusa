import { saveGalleryAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, FileField, SelectField, TextField } from "@/components/admin/form-card";
import { getAdminGallery } from "@/lib/data/admin";

export default async function AdminGalleryPage() {
  const gallery = await getAdminGallery();

  return (
    <div>
      <AdminPageHeader title="Galeri" description="Upload dan kelola foto wisata yang tampil di halaman galeri." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah foto" action={saveGalleryAction}>
            <TextField name="title" label="Judul" required />
            <TextField name="image_url" label="URL gambar" />
            <FileField name="image" label="Upload foto" />
            <TextField name="category" label="Kategori" />
            <SelectField name="status" label="Status" options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
          </AdminFormCard>
          {gallery.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.title}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update foto" action={saveGalleryAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="title" label="Judul" defaultValue={item.title} required />
                  <TextField name="image_url" label="URL gambar" defaultValue={item.image_url} />
                  <FileField name="image" label="Upload foto" />
                  <TextField name="category" label="Kategori" defaultValue={item.category} />
                  <SelectField name="status" label="Status" defaultValue={item.status} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={gallery.map((item) => ({ ...item }))}
          columns={[
            { key: "title", header: "Judul" },
            { key: "category", header: "Kategori" },
            { key: "status", header: "Status" },
            { key: "created_at", header: "Dibuat", format: "date" },
          ]}
          deleteTable="gallery"
          revalidatePath="/admin/galeri"
        />
      </div>
    </div>
  );
}
