import { saveBlogAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, FileField, SelectField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminBlogPosts } from "@/lib/data/admin";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div>
      <AdminPageHeader title="Blog / Artikel" description="Kelola artikel, status draft/published, cover image, dan metadata SEO." />
      <div className="grid gap-6 xl:grid-cols-[500px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah artikel" action={saveBlogAction}>
            <TextField name="title" label="Judul" required />
            <TextField name="slug" label="Slug" />
            <TextareaField name="excerpt" label="Excerpt" />
            <TextareaField name="content" label="Konten" rows={8} required />
            <TextField name="cover_image_url" label="URL cover" />
            <FileField name="cover_image" label="Upload cover" />
            <TextField name="category" label="Kategori" />
            <SelectField name="status" label="Status" options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }]} />
            <TextField name="seo_title" label="SEO title" />
            <TextareaField name="seo_description" label="SEO description" />
          </AdminFormCard>
          {posts.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit {item.title}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update artikel" action={saveBlogAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <TextField name="title" label="Judul" defaultValue={item.title} required />
                  <TextField name="slug" label="Slug" defaultValue={item.slug} />
                  <TextareaField name="excerpt" label="Excerpt" defaultValue={item.excerpt} />
                  <TextareaField name="content" label="Konten" defaultValue={item.content} rows={8} required />
                  <TextField name="cover_image_url" label="URL cover" defaultValue={item.cover_image_url} />
                  <FileField name="cover_image" label="Upload cover" />
                  <TextField name="category" label="Kategori" defaultValue={item.category} />
                  <SelectField name="status" label="Status" defaultValue={item.status} options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }]} />
                  <TextField name="seo_title" label="SEO title" defaultValue={item.seo_title} />
                  <TextareaField name="seo_description" label="SEO description" defaultValue={item.seo_description} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={posts.map((item) => ({ ...item, author: item.profiles?.full_name }))}
          columns={[
            { key: "title", header: "Judul" },
            { key: "category", header: "Kategori" },
            { key: "status", header: "Status" },
            { key: "published_at", header: "Publish", format: "date" },
          ]}
          deleteTable="blog_posts"
          revalidatePath="/admin/blog"
        />
      </div>
    </div>
  );
}
