"use client";

/* eslint-disable react-hooks/incompatible-library */

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { deleteRecordAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

type Row = Record<string, unknown> & { id: string };

export type AdminColumn = {
  key: string;
  header: string;
  format?: "currency" | "date" | "boolean" | "array";
};

function formatValue(value: unknown, format?: AdminColumn["format"]) {
  if (format === "currency") return formatCurrency(Number(value ?? 0));
  if (format === "date") return formatDate(String(value ?? ""));
  if (format === "boolean") return value ? "Ya" : "Tidak";
  if (format === "array") return Array.isArray(value) ? value.join(", ") : String(value ?? "-");
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function DataTable({
  data,
  columns,
  deleteTable,
  revalidatePath,
  itineraryBasePath,
}: {
  data: Row[];
  columns: AdminColumn[];
  deleteTable?: string;
  revalidatePath?: string;
  itineraryBasePath?: string;
}) {
  const tableColumns: ColumnDef<Row>[] = [
    ...columns.map(
      (column): ColumnDef<Row> => ({
      accessorKey: column.key,
      header: column.header,
      cell: ({ row }) => <span className="line-clamp-2">{formatValue(row.original[column.key], column.format)}</span>,
    })),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {itineraryBasePath ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={`${itineraryBasePath}/${row.original.id}/itinerary`}>Itinerary</Link>
            </Button>
          ) : null}
          {deleteTable ? (
            <form action={deleteRecordAction}>
              <input type="hidden" name="table" value={deleteTable} />
              <input type="hidden" name="id" value={row.original.id} />
              <input type="hidden" name="path" value={revalidatePath ?? "/admin"} />
              <Button type="submit" size="icon-sm" variant="destructive" aria-label="Hapus">
                <Trash2 />
              </Button>
            </form>
          ) : null}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4">
        <Input
          placeholder="Cari data..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
