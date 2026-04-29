/* eslint-disable jsx-a11y/alt-text */

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { TicketBundle } from "@/lib/ticket";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#17313a",
    backgroundColor: "#f8fffc",
    fontFamily: "Helvetica",
  },
  frame: {
    borderWidth: 1,
    borderColor: "#b7ddd4",
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#087b6f",
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 700,
    color: "#0f2832",
  },
  codeBox: {
    width: 150,
    borderWidth: 1,
    borderColor: "#d7ebe5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  qr: {
    width: 98,
    height: 98,
    marginBottom: 8,
  },
  code: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0f766e",
  },
  grid: {
    flexDirection: "row",
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  sectionTitle: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: 700,
    color: "#0f766e",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#edf4f2",
    paddingBottom: 7,
    marginBottom: 7,
  },
  label: {
    fontSize: 8,
    color: "#68858a",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#16333b",
  },
  total: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f766e",
  },
  note: {
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: "#ecfdf7",
    padding: 12,
    color: "#315a5d",
  },
});

function DetailRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={strong ? styles.total : styles.value}>{value}</Text>
    </View>
  );
}

export function TicketPDF({ bundle }: { bundle: TicketBundle }) {
  const { booking, payment, ticket, qrCodeDataUrl } = bundle;
  const packageName = booking.travel_packages?.name ?? "Paket TravelNusa";
  const destination = booking.travel_packages?.destinations
    ? `${booking.travel_packages.destinations.name}, ${booking.travel_packages.destinations.city}`
    : "Indonesia";

  return (
    <Document title={`E-Ticket ${ticket?.ticket_code ?? booking.booking_code}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>TravelNusa Indonesia</Text>
              <Text style={styles.title}>E-Ticket TravelNusa</Text>
              <Text style={styles.value}>Tunjukkan tiket ini kepada petugas saat keberangkatan.</Text>
            </View>
            <View style={styles.codeBox}>
              {qrCodeDataUrl ? <Image src={qrCodeDataUrl} style={styles.qr} /> : null}
              <Text style={styles.code}>{ticket?.ticket_code ?? "-"}</Text>
              <Text style={styles.label}>{booking.booking_code}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <DetailRow label="Nama" value={booking.full_name} />
              <DetailRow label="Email" value={booking.email} />
              <DetailRow label="WhatsApp" value={booking.phone} />
              <DetailRow label="Booking Code" value={booking.booking_code} />
              <DetailRow label="Ticket Code" value={ticket?.ticket_code ?? "-"} />
            </View>
            <View style={styles.column}>
              <Text style={styles.sectionTitle}>Perjalanan</Text>
              <DetailRow label="Paket" value={packageName} />
              <DetailRow label="Destinasi" value={destination} />
              <DetailRow label="Tanggal Berangkat" value={formatDate(booking.departure_date)} />
              <DetailRow label="Jumlah Peserta" value={`${booking.participant_count} peserta`} />
              <DetailRow label="Tanggal Terbit" value={formatDateTime(ticket?.issued_at)} />
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>Pembayaran</Text>
            <DetailRow label="Status Pembayaran" value={payment?.payment_status ?? "-"} />
            <DetailRow label="Status Tiket" value={ticket?.ticket_status ?? "-"} />
            <DetailRow label="Total Pembayaran" value={formatCurrency(booking.total_price)} strong />
          </View>

          <View style={styles.note}>
            <Text>
              Catatan: Tunjukkan tiket ini kepada petugas saat keberangkatan. Tiket hanya valid untuk nama,
              tanggal, dan paket yang tercantum.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
