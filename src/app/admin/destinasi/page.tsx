import { saveDestinationAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, CheckboxField, FileField, SelectField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminCategories, getAdminDestinations } from "@/lib/data/admin";

export default async function AdminDestinationsPage() {
  const [categories, destinations] = await Promise.all([getAdminCategories(), getAdminDestinations()]);
  const categoryOptions = categories.map((item) => ({ label: item.name, value: item.id }));

  return (
    <div>
      <AdminPageHeader title="Destinasi" description="Tambah, edit, hapus, upload gambar, dan atur publish/draft." />
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah destinasi" action={saveDestinationAction}>
            <TextField name="name" label="Nama destinasi" required />
            <TextField name="slug" label="Slug" />
            <SelectField name="category_id" label="Kategori" options={categoryOptions} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="province" label="Provinsi" required />
              <TextField name="city" label="Kota" required />
            </div>
            <TextField name="address" label="Alamat" />
            <TextareaField name="description" label="Deskripsi" rows={5} required />
            <TextareaField name="facilities" label="Fasilitas (pisahkan baris/koma)" />
            <TextField name="main_image_url" label="URL gambar utama" />
            <FileField name="main_image" label="Upload gambar utama" />
            <TextareaField name="gallery_urls" label="URL galeri (pisahkan baris/koma)" />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="latitude" label="Latitude" />
              <TextField name="longitude" label="Longitude" />
            </div>
            <CheckboxField name="is_featured" label="Featured" />
            <SelectField name="status" label="Status" options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
          </AdminFormCard>
          {destinations.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.name}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update destinasi" action={saveDestinationAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="name" label="Nama destinasi" defaultValue={item.name} required />
                  <TextField name="slug" label="Slug" defaultValue={item.slug} />
                  <SelectField name="category_id" label="Kategori" defaultValue={item.category_id} options={categoryOptions} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="province" label="Provinsi" defaultValue={item.province} required />
                    <TextField name="city" label="Kota" defaultValue={item.city} required />
                  </div>
                  <TextField name="address" label="Alamat" defaultValue={item.address} />
                  <TextareaField name="description" label="Deskripsi" defaultValue={item.description} rows={5} required />
                  <TextareaField name="facilities" label="Fasilitas" defaultValue={item.facilities} />
                  <TextField name="main_image_url" label="URL gambar utama" defaultValue={item.main_image_url} />
                  <FileField name="main_image" label="Upload gambar utama" />
                  <TextareaField name="gallery_urls" label="URL galeri" defaultValue={item.gallery_urls} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="latitude" label="Latitude" defaultValue={item.latitude} />
                    <TextField name="longitude" label="Longitude" defaultValue={item.longitude} />
                  </div>
                  <CheckboxField name="is_featured" label="Featured" defaultChecked={item.is_featured} />
                  <SelectField name="status" label="Status" defaultValue={item.status} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={destinations.map((item) => ({ ...item, category: item.categories?.name }))}
          columns={[
            { key: "name", header: "Nama" },
            { key: "province", header: "Provinsi" },
            { key: "city", header: "Kota" },
            { key: "category", header: "Kategori" },
            { key: "is_featured", header: "Featured", format: "boolean" },
            { key: "status", header: "Status" },
          ]}
          deleteTable="destinations"
          revalidatePath="/admin/destinasi"
        />
      </div>
    </div>
  );
}
