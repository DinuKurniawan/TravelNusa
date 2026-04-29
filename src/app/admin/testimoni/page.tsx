import { saveTestimonialAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, FileField, SelectField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminTestimonials } from "@/lib/data/admin";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div>
      <AdminPageHeader title="Testimoni" description="Kelola testimoni customer, rating, foto, dan status publish." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah testimoni" action={saveTestimonialAction}>
            <TextField name="customer_name" label="Nama customer" required />
            <TextField name="customer_photo_url" label="URL foto" />
            <FileField name="customer_photo" label="Upload foto" />
            <TextField name="rating" label="Rating" type="number" defaultValue={5} required />
            <TextareaField name="content" label="Isi testimoni" required />
            <SelectField name="status" label="Status" options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
          </AdminFormCard>
          {testimonials.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.customer_name}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update testimoni" action={saveTestimonialAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="customer_name" label="Nama customer" defaultValue={item.customer_name} required />
                  <TextField name="customer_photo_url" label="URL foto" defaultValue={item.customer_photo_url} />
                  <FileField name="customer_photo" label="Upload foto" />
                  <TextField name="rating" label="Rating" type="number" defaultValue={item.rating} required />
                  <TextareaField name="content" label="Isi testimoni" defaultValue={item.content} required />
                  <SelectField name="status" label="Status" defaultValue={item.status} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={testimonials.map((item) => ({ ...item }))}
          columns={[
            { key: "customer_name", header: "Nama" },
            { key: "rating", header: "Rating" },
            { key: "status", header: "Status" },
            { key: "created_at", header: "Dibuat", format: "date" },
          ]}
          deleteTable="testimonials"
          revalidatePath="/admin/testimoni"
        />
      </div>
    </div>
  );
}
