import { saveSettingsAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormCard, FileField, TextareaField, TextField } from "@/components/admin/form-card";
import { getAdminSettings } from "@/lib/data/admin";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div>
      <AdminPageHeader title="Pengaturan Website" description="Kelola identitas website, kontak, sosial media, dan metadata SEO." />
      <div className="max-w-3xl">
        <AdminFormCard title="Site settings" action={saveSettingsAction}>
          {settings?.id ? <input type="hidden" name="id" value={settings.id} /> : null}
          <TextField name="site_name" label="Nama website" defaultValue={settings?.site_name ?? "TravelNusa Indonesia"} required />
          <TextField name="logo_url" label="URL logo" defaultValue={settings?.logo_url} />
          <FileField name="logo" label="Upload logo" />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="email" label="Email" defaultValue={settings?.email} />
            <TextField name="phone" label="Phone" defaultValue={settings?.phone} />
          </div>
          <TextField name="whatsapp" label="WhatsApp" defaultValue={settings?.whatsapp} />
          <TextareaField name="address" label="Alamat" defaultValue={settings?.address} />
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="instagram_url" label="Instagram" defaultValue={settings?.instagram_url} />
            <TextField name="facebook_url" label="Facebook" defaultValue={settings?.facebook_url} />
            <TextField name="tiktok_url" label="TikTok" defaultValue={settings?.tiktok_url} />
          </div>
          <TextField name="meta_title" label="Meta title" defaultValue={settings?.meta_title} />
          <TextareaField name="meta_description" label="Meta description" defaultValue={settings?.meta_description} />
        </AdminFormCard>
      </div>
    </div>
  );
}
