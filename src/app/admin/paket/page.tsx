import { savePackageAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, CheckboxField, FileField, SelectField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminDestinations, getAdminPackages } from "@/lib/data/admin";

export default async function AdminPackagesPage() {
  const [destinations, packages] = await Promise.all([getAdminDestinations(), getAdminPackages()]);
  const destinationOptions = destinations.map((item) => ({ label: item.name, value: item.id }));

  return (
    <div>
      <AdminPageHeader title="Paket Travel" description="Kelola paket, harga, durasi, fasilitas, status, dan gambar utama." />
      <div className="grid gap-6 xl:grid-cols-[500px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah paket" action={savePackageAction}>
            <TextField name="name" label="Nama paket" required />
            <TextField name="slug" label="Slug" />
            <SelectField name="destination_id" label="Destinasi" options={destinationOptions} />
            <TextareaField name="short_description" label="Deskripsi singkat" />
            <TextareaField name="description" label="Deskripsi paket" rows={5} required />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="price" label="Harga" type="number" required />
              <TextField name="discount_price" label="Harga diskon" type="number" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField name="duration_days" label="Durasi hari" type="number" required />
              <TextField name="duration_nights" label="Durasi malam" type="number" defaultValue={0} />
              <TextField name="quota" label="Kuota" type="number" required />
            </div>
            <TextareaField name="included" label="Termasuk" />
            <TextareaField name="excluded" label="Tidak termasuk" />
            <TextField name="main_image_url" label="URL gambar utama" />
            <FileField name="main_image" label="Upload gambar utama" />
            <TextareaField name="gallery_urls" label="URL galeri" />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="rating" label="Rating" type="number" defaultValue={0} />
              <TextField name="total_reviews" label="Total review" type="number" defaultValue={0} />
            </div>
            <CheckboxField name="is_featured" label="Featured" />
            <SelectField name="status" label="Status" options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
          </AdminFormCard>
          {packages.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.name}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update paket" action={savePackageAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="name" label="Nama paket" defaultValue={item.name} required />
                  <TextField name="slug" label="Slug" defaultValue={item.slug} />
                  <SelectField name="destination_id" label="Destinasi" defaultValue={item.destination_id} options={destinationOptions} />
                  <TextareaField name="short_description" label="Deskripsi singkat" defaultValue={item.short_description} />
                  <TextareaField name="description" label="Deskripsi paket" defaultValue={item.description} rows={5} required />
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="price" label="Harga" type="number" defaultValue={item.price} required />
                    <TextField name="discount_price" label="Harga diskon" type="number" defaultValue={item.discount_price} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <TextField name="duration_days" label="Durasi hari" type="number" defaultValue={item.duration_days} required />
                    <TextField name="duration_nights" label="Durasi malam" type="number" defaultValue={item.duration_nights} />
                    <TextField name="quota" label="Kuota" type="number" defaultValue={item.quota} required />
                  </div>
                  <TextareaField name="included" label="Termasuk" defaultValue={item.included} />
                  <TextareaField name="excluded" label="Tidak termasuk" defaultValue={item.excluded} />
                  <TextField name="main_image_url" label="URL gambar utama" defaultValue={item.main_image_url} />
                  <FileField name="main_image" label="Upload gambar utama" />
                  <TextareaField name="gallery_urls" label="URL galeri" defaultValue={item.gallery_urls} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="rating" label="Rating" type="number" defaultValue={item.rating} />
                    <TextField name="total_reviews" label="Total review" type="number" defaultValue={item.total_reviews} />
                  </div>
                  <CheckboxField name="is_featured" label="Featured" defaultChecked={item.is_featured} />
                  <SelectField name="status" label="Status" defaultValue={item.status} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={packages.map((item) => ({ ...item, destination: item.destinations?.name }))}
          columns={[
            { key: "name", header: "Nama" },
            { key: "destination", header: "Destinasi" },
            { key: "price", header: "Harga", format: "currency" },
            { key: "duration_days", header: "Hari" },
            { key: "quota", header: "Kuota" },
            { key: "status", header: "Status" },
          ]}
          deleteTable="travel_packages"
          revalidatePath="/admin/paket"
          itineraryBasePath="/admin/paket"
        />
      </div>
    </div>
  );
}
