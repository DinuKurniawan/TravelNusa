import Link from "next/link";

import { saveItineraryAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { AdminFormCard, TextareaField, TextField } from "@/components/admin/form-card";
import { Button } from "@/components/ui/button";
import { getAdminItineraries } from "@/lib/data/admin";

export default async function AdminItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itineraries = await getAdminItineraries(id);

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin/paket">Kembali ke paket</Link>
        </Button>
      </div>
      <AdminPageHeader title="Itinerary Paket" description="Kelola itinerary harian untuk paket travel." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <AdminFormCard title="Tambah itinerary" action={saveItineraryAction}>
            <input type="hidden" name="package_id" value={id} />
            <TextField name="day_number" label="Hari ke-" type="number" required />
            <TextField name="title" label="Judul kegiatan" required />
            <TextareaField name="description" label="Deskripsi kegiatan" required />
            <TextField name="location" label="Lokasi" />
            <TextField name="time" label="Waktu" />
          </AdminFormCard>
          {itineraries.map((item) => (
            <details key={item.id} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Edit hari {item.day_number}</summary>
              <div className="mt-4">
                <AdminFormCard title="Update itinerary" action={saveItineraryAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="package_id" value={id} />
                  <TextField name="day_number" label="Hari ke-" type="number" defaultValue={item.day_number} required />
                  <TextField name="title" label="Judul kegiatan" defaultValue={item.title} required />
                  <TextareaField name="description" label="Deskripsi kegiatan" defaultValue={item.description} required />
                  <TextField name="location" label="Lokasi" defaultValue={item.location} />
                  <TextField name="time" label="Waktu" defaultValue={item.time} />
                </AdminFormCard>
              </div>
            </details>
          ))}
        </div>
        <DataTable
          data={itineraries.map((item) => ({ ...item }))}
          columns={[
            { key: "day_number", header: "Hari" },
            { key: "title", header: "Judul" },
            { key: "location", header: "Lokasi" },
            { key: "time", header: "Waktu" },
          ]}
          deleteTable="package_itineraries"
          revalidatePath={`/admin/paket/${id}/itinerary`}
        />
      </div>
    </div>
  );
}
