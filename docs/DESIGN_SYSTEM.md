# DESIGN_SYSTEM.md — Design System & UI Guidelines
# AI Hire Buddy

**Versi:** 1.0.0  
**Tanggal:** 2026-06-09  
**Base:** shadcn/ui new-york style, slate base color, Tailwind v4, lucide-react  
**Repo:** https://github.com/bernandotorrez/ai-hire-buddy-59

---

## Daftar Isi

1. [Fondasi: CSS Variables & Token System](#1-fondasi-css-variables--token-system)
2. [Palet Warna](#2-palet-warna)
3. [Tipografi](#3-tipografi)
4. [Spacing & Layout System](#4-spacing--layout-system)
5. [Komponen UI](#5-komponen-ui)
6. [Panduan Ikon (lucide-react)](#6-panduan-ikon-lucide-react)
7. [Panduan Aksesibilitas](#7-panduan-aksesibilitas)
8. [Loading States & Skeleton Screen](#8-loading-states--skeleton-screen)
9. [Optimistic UI Patterns](#9-optimistic-ui-patterns)
10. [AI Feature UI Patterns](#10-ai-feature-ui-patterns)

---

## 1. Fondasi: CSS Variables & Token System

Sistem desain ini dibangun di atas CSS variables yang didefinisikan di `src/styles.css`, konsisten dengan konfigurasi `components.json` repo (new-york style, slate base, cssVariables: true).

Semua komponen shadcn/ui menggunakan CSS variables ini secara otomatis. Jangan hardcode warna hex di komponen — selalu gunakan CSS variables atau Tailwind utility class yang memetakan ke variables.

```css
/* src/styles.css — tema light (default) */
:root {
  --background: oklch(1 0 0);            /* #ffffff */
  --foreground: oklch(0.129 0.042 264.695); /* #0f172a slate-950 */

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);

  --primary: oklch(0.208 0.042 265.755);  /* slate-900 */
  --primary-foreground: oklch(0.984 0.003 247.858); /* slate-50 */

  --secondary: oklch(0.968 0.007 247.896); /* slate-100 */
  --secondary-foreground: oklch(0.208 0.042 265.755);

  --muted: oklch(0.968 0.007 247.896);    /* slate-100 */
  --muted-foreground: oklch(0.554 0.046 257.417); /* slate-500 */

  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);

  --destructive: oklch(0.577 0.245 27.325); /* red-600 */
  --destructive-foreground: oklch(1 0 0);

  --border: oklch(0.929 0.013 255.508);   /* slate-200 */
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.208 0.042 265.755);

  --radius: 0.375rem;                     /* 6px — new-york style */
}

/* Tema dark */
.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.984 0.003 247.858);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --border: oklch(0.279 0.041 260.031);
  --input: oklch(0.279 0.041 260.031);
}
```

### 1.1 Extended Semantic Tokens (Custom)

Tambahkan token semantik khusus untuk AI Hire Buddy di `src/styles.css`:

```css
:root {
  /* Status lamaran */
  --status-applied: oklch(0.629 0.028 255.105);   /* slate-500 */
  --status-reviewed: oklch(0.452 0.1 264);         /* blue-600 */
  --status-interviewed: oklch(0.726 0.144 75);     /* amber-500 */
  --status-accepted: oklch(0.527 0.154 150);       /* green-600 */
  --status-rejected: oklch(0.577 0.245 27.325);    /* red-600 */

  /* AI Score gradient */
  --score-high: oklch(0.527 0.154 150);            /* hijau ≥ 80% */
  --score-medium: oklch(0.726 0.144 75);           /* kuning 50-79% */
  --score-low: oklch(0.577 0.245 27.325);          /* merah < 50% */

  /* AI badge */
  --ai-primary: oklch(0.42 0.18 290);              /* violet-600 */
  --ai-surface: oklch(0.94 0.04 290);              /* violet-50 */

  /* Skill badge */
  --skill-match: oklch(0.527 0.154 150);           /* hijau */
  --skill-match-surface: oklch(0.962 0.044 150);   /* hijau muda */
  --skill-gap: oklch(0.635 0.176 38);              /* oranye */
  --skill-gap-surface: oklch(0.975 0.04 38);       /* oranye muda */
}
```

---

## 2. Palet Warna

### 2.1 Warna Primer (Slate-based)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--primary` (slate-900) | `#0f172a` | Button primary, teks heading utama |
| `--primary-foreground` | `#f8fafc` | Teks di atas background primer |
| `--background` | `#ffffff` | Background halaman utama |
| `--foreground` (slate-950) | `#020617` | Teks utama body |

### 2.2 Warna Sekunder & Netral (Slate Scale)

| Warna | Hex | Tailwind Class | Penggunaan |
|-------|-----|----------------|------------|
| Slate-50 | `#f8fafc` | `bg-slate-50` | Background alternatif, card subtle |
| Slate-100 | `#f1f5f9` | `bg-secondary` | Muted background, disabled state |
| Slate-200 | `#e2e8f0` | `border` / `bg-border` | Border default, divider |
| Slate-400 | `#94a3b8` | `text-slate-400` | Placeholder, disabled text |
| Slate-500 | `#64748b` | `text-muted-foreground` | Teks sekunder, caption |
| Slate-700 | `#334155` | `text-slate-700` | Teks body |
| Slate-900 | `#0f172a` | `bg-primary` / `text-primary` | Elemen utama |

### 2.3 Warna Status Lamaran

| Status | Warna Background | Warna Teks | Hex (approx) |
|--------|-----------------|------------|--------------|
| Applied | `bg-slate-100` | `text-slate-600` | Abu-abu netral |
| Reviewed | `bg-blue-50` | `text-blue-700` | `#1d4ed8` |
| Interviewed | `bg-amber-50` | `text-amber-700` | `#b45309` |
| Accepted | `bg-green-50` | `text-green-700` | `#15803d` |
| Rejected | `bg-red-50` | `text-red-700` | `#b91c1c` |

### 2.4 Warna AI Match Score

| Range | Warna | Tailwind | Interpretasi |
|-------|-------|----------|--------------|
| ≥ 80% | Hijau | `text-green-700 bg-green-50` | Sangat cocok |
| 50–79% | Kuning | `text-amber-700 bg-amber-50` | Cukup cocok |
| < 50% | Merah | `text-red-700 bg-red-50` | Kurang cocok |

### 2.5 Warna AI Feature

| Penggunaan | Warna | Tailwind |
|------------|-------|----------|
| AI Badge label | Violet | `bg-violet-50 text-violet-700 border-violet-200` |
| AI generating indicator | Violet pulse | `text-violet-600` |
| AI-generated content border | Violet | `border-l-4 border-violet-400` |

---

## 3. Tipografi

### 3.1 Font Family

Repo ini menggunakan system font stack default dari shadcn/ui new-york — tidak ada custom font yang di-load dari external, sehingga meminimalkan network request.

```css
/* Sudah terinject via shadcn/ui base styles */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
             sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

Untuk display heading khusus (opsional, tambahkan di `src/styles.css` jika diinginkan):
```css
/* Optional: Geist Sans via @next/font tidak tersedia di TanStack — gunakan Vite plugin atau import manual */
```

### 3.2 Skala Tipografi

| Elemen | Tailwind Class | Size | Weight | Line Height |
|--------|----------------|------|--------|-------------|
| Display / Hero | `text-4xl font-bold` | 36px | 700 | 40px |
| H1 (halaman title) | `text-3xl font-bold` | 30px | 700 | 36px |
| H2 (section title) | `text-2xl font-semibold` | 24px | 600 | 32px |
| H3 (card title) | `text-xl font-semibold` | 20px | 600 | 28px |
| H4 (subsection) | `text-lg font-medium` | 18px | 500 | 28px |
| Body Large | `text-base` | 16px | 400 | 24px |
| Body Default | `text-sm` | 14px | 400 | 20px |
| Caption / Label | `text-xs` | 12px | 400 | 16px |
| Code | `font-mono text-sm` | 14px | 400 | 20px |

### 3.3 Panduan Penggunaan

- Gunakan `font-semibold` untuk label form, tombol, dan judul card — bukan `font-bold`.
- `text-muted-foreground` untuk teks sekunder (timestamp, caption, placeholder).
- `text-destructive` untuk pesan error validasi form.
- Hindari teks kurang dari 12px untuk body content (aksesibilitas).
- Teks AI-generated: gunakan font-normal dengan ukuran `text-sm` dalam area khusus (lihat AI UI patterns).

---

## 4. Spacing & Layout System

### 4.1 Spacing Scale

Mengikuti skala default Tailwind (kelipatan 4px):

| Token | Value | Penggunaan Umum |
|-------|-------|-----------------|
| `space-1` | 4px | Micro gap (ikon + teks) |
| `space-2` | 8px | Gap antar elemen inline |
| `space-3` | 12px | Padding badge, gap elemen tight |
| `space-4` | 16px | Padding card, gap standar |
| `space-6` | 24px | Padding section, gap antar card |
| `space-8` | 32px | Gap antar section besar |
| `space-12` | 48px | Spacing halaman utama |
| `space-16` | 64px | Hero section padding |

### 4.2 Grid & Layout

```
Container max-width: max-w-7xl (1280px) dengan px-4 sm:px-6 lg:px-8
```

**Layout Halaman Publik (Job Seeker):**
- Single column untuk mobile (< 768px)
- Grid 2 kolom untuk tablet (768px–1024px): sidebar filter + list lowongan
- Grid 3 kolom untuk desktop (> 1024px): sidebar + list + detail preview

**Layout Dashboard HR:**
- Sidebar tetap 240px lebar + main content area
- Sidebar collapse di mobile menjadi bottom navigation atau hamburger

**Layout Grid Lowongan:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

**Layout Detail Pelamar:**
```
grid grid-cols-1 lg:grid-cols-3 gap-6
Col 1-2: profil + CV viewer
Col 3: aksi (ubah status, AI tools)
```

### 4.3 Breakpoints Responsive

| Breakpoint | Min Width | Target Device |
|------------|-----------|---------------|
| `sm` | 640px | Ponsel landscape, tablet kecil |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop / Desktop kecil |
| `xl` | 1280px | Desktop standar |
| `2xl` | 1536px | Desktop besar |

### 4.4 Border Radius

Mengikuti `--radius: 0.375rem` (6px) dari new-york style:

| Elemen | Class | Value |
|--------|-------|-------|
| Button, Badge, Input | `rounded-md` | 6px |
| Card | `rounded-lg` | 8px |
| Dialog / Modal | `rounded-xl` | 12px |
| Avatar | `rounded-full` | 50% |
| Skeleton | `rounded-md` | 6px |

---

## 5. Komponen UI

Semua komponen menggunakan shadcn/ui (new-york style) yang sudah terkonfigurasi di repo. Path komponen: `@/components/ui/`.

### 5.1 Button

Gunakan komponen `Button` dari `@/components/ui/button`.

**Variants yang Digunakan:**

```tsx
// Primary — aksi utama (CTA)
<Button variant="default">Lamar Sekarang</Button>

// Secondary — aksi sekunder
<Button variant="secondary">Lihat Profil</Button>

// Outline — aksi tersier, filter toggle
<Button variant="outline">Filter</Button>

// Destructive — hapus, reject
<Button variant="destructive">Hapus Lowongan</Button>

// Ghost — aksi tersembunyi, ikon saja
<Button variant="ghost" size="icon"><Pencil /></Button>

// Link — navigasi inline
<Button variant="link">Lihat Semua</Button>
```

**Sizes:**

```tsx
<Button size="default">Normal</Button>   // h-9 px-4
<Button size="sm">Kecil</Button>         // h-8 px-3
<Button size="lg">Besar</Button>         // h-10 px-6
<Button size="icon">...</Button>         // h-9 w-9
```

**Loading State:**

```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Memproses...
</Button>
```

**AI Action Button (khusus):**

```tsx
// Tombol aksi AI — selalu outline dengan warna violet
<Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
  <Sparkles className="mr-2 h-4 w-4" />
  Generate dengan AI
</Button>
```

---

### 5.2 Card

Gunakan `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` dari `@/components/ui/card`.

**Job Card (halaman publik):**

```tsx
<Card className="hover:shadow-md transition-shadow cursor-pointer">
  <CardHeader className="pb-2">
    <div className="flex items-start justify-between">
      <CardTitle className="text-lg">{job.title}</CardTitle>
      <Badge variant="outline">{job.job_type}</Badge>
    </div>
    <CardDescription>{job.company_name}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />{job.location}
      </span>
      <span className="flex items-center gap-1">
        <Banknote className="h-3 w-3" />{formatSalary(job.salary_min, job.salary_max)}
      </span>
    </div>
  </CardContent>
  <CardFooter className="text-xs text-muted-foreground">
    Batas: {formatDate(job.deadline)}
  </CardFooter>
</Card>
```

**Applicant Card (HR Dashboard):**

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-3">
      <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
      <div>
        <CardTitle className="text-base">{applicant.full_name}</CardTitle>
        <CardDescription>{applicant.headline}</CardDescription>
      </div>
      <MatchScoreBadge score={applicant.ai_match_score} className="ml-auto" />
    </div>
  </CardHeader>
</Card>
```

---

### 5.3 Badge

Gunakan `Badge` dari `@/components/ui/badge`.

**Status Lamaran:**

```tsx
const statusConfig = {
  applied:     { label: "Melamar",    className: "bg-slate-100 text-slate-700 border-slate-300" },
  reviewed:    { label: "Ditinjau",   className: "bg-blue-50 text-blue-700 border-blue-200" },
  interviewed: { label: "Interview",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted:    { label: "Diterima",   className: "bg-green-50 text-green-700 border-green-200" },
  rejected:    { label: "Ditolak",    className: "bg-red-50 text-red-700 border-red-200" },
};

<Badge variant="outline" className={statusConfig[status].className}>
  {statusConfig[status].label}
</Badge>
```

**Job Type:**

```tsx
const jobTypeConfig = {
  'full-time': "bg-slate-900 text-white",
  'part-time': "bg-slate-200 text-slate-800",
  'remote':    "bg-green-50 text-green-700 border-green-200",
  'contract':  "bg-orange-50 text-orange-700 border-orange-200",
};
```

**AI Match Score Badge:**

```tsx
function MatchScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <Badge variant="outline" className="text-muted-foreground">Menunggu</Badge>;
  const color = score >= 80 ? "bg-green-50 text-green-700 border-green-200"
              : score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-red-50 text-red-700 border-red-200";
  return <Badge variant="outline" className={color}>{score}% Match</Badge>;
}
```

**Skill Badges (untuk C6 Skill Gap Analyzer):**

```tsx
// Skill yang dimiliki
<Badge className="bg-green-50 text-green-700 border border-green-200">
  <CheckCircle className="mr-1 h-3 w-3" /> {skill}
</Badge>

// Skill yang kurang
<Badge className="bg-orange-50 text-orange-700 border border-orange-200">
  <AlertCircle className="mr-1 h-3 w-3" /> {skill}
</Badge>
```

**AI Generated Badge:**

```tsx
<Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs">
  <Sparkles className="mr-1 h-3 w-3" /> Dibuat AI
</Badge>
```

---

### 5.4 Form

Gunakan `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` dari `@/components/ui/form`. Semua form menggunakan React Hook Form + Zod (sudah ada di repo).

**Pola Standar:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const jobSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  location: z.string().min(2, "Lokasi wajib diisi"),
  // ...
});

function JobForm() {
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Posisi</FormLabel>
              <FormControl>
                <Input placeholder="contoh: Frontend Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Simpan</Button>
      </form>
    </Form>
  );
}
```

**File Upload (untuk CV):**

```tsx
// Komponen custom upload dengan drag-and-drop
<div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
  <p className="text-sm text-muted-foreground">
    Drag & drop CV Anda di sini, atau{" "}
    <span className="text-primary underline">klik untuk memilih</span>
  </p>
  <p className="text-xs text-muted-foreground mt-1">PDF atau DOCX, maks. 5MB</p>
</div>
```

---

### 5.5 Table

Gunakan `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` dari `@/components/ui/table`.

**Applicant Table (HR Dashboard):**

```tsx
<div className="rounded-lg border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Kandidat</TableHead>
        <TableHead>Posisi</TableHead>
        <TableHead>Tanggal Melamar</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>AI Match</TableHead>
        <TableHead className="sr-only">Aksi</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {applicants.map((applicant) => (
        <TableRow key={applicant.id} className="cursor-pointer hover:bg-muted/50">
          {/* ... */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

**Skeleton Table Row:**

```tsx
<TableRow>
  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
</TableRow>
```

---

### 5.6 Dialog / Modal

Gunakan `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` dari `@/components/ui/dialog`.

**Standar:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Ubah Status Lamaran</DialogTitle>
      <DialogDescription>
        Pilih status baru untuk kandidat ini.
      </DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
      <Button onClick={handleSave}>Simpan</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 5.7 Select & Dropdown

Gunakan `Select` dari `@/components/ui/select` untuk form select standar. Gunakan `DropdownMenu` dari `@/components/ui/dropdown-menu` untuk aksi kontekstual.

**Status Selector (HR):**

```tsx
<Select value={status} onValueChange={handleStatusChange}>
  <SelectTrigger className="w-40">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="reviewed">Ditinjau</SelectItem>
    <SelectItem value="interviewed">Interview</SelectItem>
    <SelectItem value="accepted">Diterima</SelectItem>
    <SelectItem value="rejected">Ditolak</SelectItem>
  </SelectContent>
</Select>
```

---

### 5.8 Textarea

Gunakan `Textarea` dari `@/components/ui/textarea` untuk input teks panjang (cover letter editor, deskripsi lowongan).

**Cover Letter Editor:**

```tsx
<Textarea
  className="min-h-[300px] font-mono text-sm resize-y"
  placeholder="Cover letter akan muncul di sini..."
  {...field}
/>
```

---

### 5.9 Progress

Gunakan `Progress` dari `@/components/ui/progress` untuk indikator proses AI.

```tsx
// Indeterminate progress (tanpa nilai pasti)
<div className="space-y-2">
  <p className="text-sm text-muted-foreground">Menganalisis CV...</p>
  <Progress value={undefined} className="animate-pulse" />
</div>
```

---

### 5.10 Separator

```tsx
import { Separator } from "@/components/ui/separator";

<Separator className="my-6" />
<Separator orientation="vertical" className="h-6 mx-2" />
```

---

### 5.11 Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar className="h-10 w-10">
  <AvatarImage src={user.avatar_url} alt={user.full_name} />
  <AvatarFallback className="bg-slate-200 text-slate-700">
    {getInitials(user.full_name)}
  </AvatarFallback>
</Avatar>
```

---

### 5.12 Toast (Sonner)

Gunakan `sonner` (sudah ada di package.json) via `toast` function. Setup Toaster di root layout.

```tsx
import { toast } from "sonner";

// Sukses
toast.success("Lamaran berhasil dikirim!");

// Error
toast.error("Gagal memproses CV. Silakan coba lagi.");

// Loading (untuk AI operations)
const toastId = toast.loading("AI sedang menganalisis...");
// Setelah selesai:
toast.dismiss(toastId);
toast.success("Analisis selesai!");

// AI Error dengan detail
toast.error("Fitur AI tidak tersedia saat ini", {
  description: "Silakan coba beberapa saat lagi.",
  action: { label: "Coba Lagi", onClick: handleRetry },
});
```

---

## 6. Panduan Ikon (lucide-react)

Gunakan `lucide-react` (sudah di package.json `^0.575.0`). Selalu gunakan ukuran yang konsisten.

### 6.1 Ukuran Standar

| Konteks | Class | Size |
|---------|-------|------|
| Ikon dalam tombol | `h-4 w-4` | 16px |
| Ikon dalam badge | `h-3 w-3` | 12px |
| Ikon navigasi sidebar | `h-5 w-5` | 20px |
| Ikon empty state | `h-12 w-12` | 48px |
| Ikon hero/feature | `h-8 w-8` | 32px |

### 6.2 Mapping Ikon per Fitur

| Fitur / Elemen | Ikon Lucide | Import |
|----------------|-------------|--------|
| Lowongan / Pekerjaan | `Briefcase` | `import { Briefcase } from "lucide-react"` |
| Lokasi | `MapPin` | `MapPin` |
| Tipe pekerjaan | `Clock` | `Clock` |
| Gaji | `Banknote` | `Banknote` |
| CV / Dokumen | `FileText` | `FileText` |
| Upload | `Upload` | `Upload` |
| AI / Sparkle | `Sparkles` | `Sparkles` |
| Analisis | `BarChart2` | `BarChart2` |
| Match score | `Target` | `Target` |
| Interview | `MessageSquare` | `MessageSquare` |
| Karir | `TrendingUp` | `TrendingUp` |
| Skill | `Zap` | `Zap` |
| Skill gap | `AlertCircle` | `AlertCircle` |
| Skill match | `CheckCircle2` | `CheckCircle2` |
| Status: accepted | `CheckCircle` | `CheckCircle` |
| Status: rejected | `XCircle` | `XCircle` |
| Profil user | `User` | `User` |
| Perusahaan | `Building2` | `Building2` |
| Pengaturan | `Settings` | `Settings` |
| Loading / Spinner | `Loader2` | `Loader2` (+ `animate-spin`) |
| Hapus | `Trash2` | `Trash2` |
| Edit | `Pencil` | `Pencil` |
| Tambah | `Plus` | `Plus` |
| Filter | `SlidersHorizontal` | `SlidersHorizontal` |
| Cari | `Search` | `Search` |
| Kirim | `Send` | `Send` |
| Salin | `Copy` | `Copy` |
| Simpan | `Save` | `Save` |
| Chat / Konsultasi | `MessageCircle` | `MessageCircle` |
| Riwayat | `History` | `History` |
| Notifikasi | `Bell` | `Bell` |
| Keluar | `LogOut` | `LogOut` |
| Dashboard | `LayoutDashboard` | `LayoutDashboard` |
| Pelamar | `Users` | `Users` |
| Refresh / Hitung ulang | `RefreshCw` | `RefreshCw` |
| Bintang / Highlight | `Star` | `Star` |

### 6.3 Aturan Penggunaan

- Ikon selalu disertai teks label yang visible (kecuali `size="icon"` button — harus ada `aria-label`).
- Gunakan warna `currentColor` (default lucide) — jangan override warna ikon secara langsung.
- Untuk loading state, gunakan `Loader2` dengan class `animate-spin`.

```tsx
// Benar
<Button size="icon" aria-label="Edit lowongan">
  <Pencil className="h-4 w-4" />
</Button>

// Juga benar
<Button>
  <Sparkles className="mr-2 h-4 w-4" />
  Generate dengan AI
</Button>
```

---

## 7. Panduan Aksesibilitas

### 7.1 Keyboard Navigation

- Semua elemen interaktif harus dapat difokus dan dioperasikan via keyboard (Tab, Enter, Space, Arrow keys, Escape).
- Komponen shadcn/ui berbasis Radix UI sudah menangani fokus dan ARIA secara otomatis.
- Modal/Dialog: fokus trap aktif saat dibuka; tekan Escape untuk menutup.
- Dropdown menu: Arrow keys untuk navigasi; Enter untuk select; Escape untuk close.

### 7.2 ARIA & Semantik HTML

```tsx
// Gunakan landmark yang tepat
<main>
  <section aria-labelledby="jobs-heading">
    <h2 id="jobs-heading">Lowongan Tersedia</h2>
  </section>
</main>

// Status update dinamis
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Loading state
<div role="status" aria-label="Memuat data...">
  <Skeleton />
</div>
```

### 7.3 Kontras Warna

- Teks body di atas background putih: rasio kontras ≥ 7:1 (WCAG AAA).
- Teks muted (`text-muted-foreground`) di atas background: ≥ 4.5:1 (WCAG AA).
- Elemen interaktif (tombol, link) harus memiliki focus ring yang jelas: gunakan default Tailwind `ring` utility.

### 7.4 Form Accessibility

```tsx
// Label selalu terhubung ke input
<FormLabel htmlFor="job-title">Judul Posisi</FormLabel>
<Input id="job-title" aria-describedby="job-title-error" />
<FormMessage id="job-title-error" role="alert" />

// Required fields
<FormLabel>
  Email <span aria-hidden="true" className="text-destructive">*</span>
</FormLabel>
```

### 7.5 Gambar & Ikon

```tsx
// Ikon dekoratif
<CheckCircle aria-hidden="true" className="h-4 w-4" />

// Ikon fungsional (standalone)
<Button size="icon" aria-label="Hapus lamaran">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 8. Loading States & Skeleton Screen

### 8.1 Prinsip Skeleton

- Gunakan `Skeleton` dari `@/components/ui/skeleton` untuk setiap konten yang di-fetch.
- Skeleton harus mencerminkan layout nyata konten — bukan hanya bar lurus.
- Jangan tampilkan spinner kosong tanpa konteks.
- Gunakan `animate-pulse` (sudah default di Skeleton component).

### 8.2 Job Card Skeleton

```tsx
function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-3 w-32" />
      </CardFooter>
    </Card>
  );
}
```

### 8.3 Profile Skeleton

```tsx
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
```

### 8.4 Applicant Table Skeleton

```tsx
function ApplicantTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {["Kandidat", "Posisi", "Tanggal", "Status", "AI Match"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 8.5 Dashboard Stats Skeleton

```tsx
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
```

### 8.6 AI Insights Panel Skeleton

```tsx
function AIInsightsSkeleton() {
  return (
    <Card className="border-violet-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
```

---

## 9. Optimistic UI Patterns

### 9.1 Kapan Menggunakan Optimistic UI

Gunakan optimistic update untuk aksi yang:
- Sering dilakukan berulang kali (contoh: ubah status lamaran)
- Jarang gagal dalam kondisi normal
- Memiliki dampak visual yang jelas bagi user
- Tidak memiliki konsekuensi signifikan jika di-rollback (tidak menyebabkan biaya/kerugian nyata)

**Gunakan optimistic UI untuk:**
- Update status lamaran oleh HR (Applied → Reviewed → dll.)
- Submit lamaran oleh job seeker (langsung tampil di riwayat)
- Toggle status lowongan (active ↔ draft)

**Jangan gunakan optimistic UI untuk:**
- Pembayaran atau transaksi finansial
- Operasi AI (hasil tidak dapat diprediksi)
- Operasi yang memerlukan validasi server yang ketat (file upload)

### 9.2 Pola Implementasi (TanStack Query)

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, newStatus }: UpdateStatusPayload) =>
      updateApplicationStatus(applicationId, newStatus),

    // Optimistic update — langsung update cache sebelum server konfirmasi
    onMutate: async ({ applicationId, newStatus }) => {
      // Cancel query yang sedang berjalan
      await queryClient.cancelQueries({ queryKey: ["applications"] });

      // Snapshot state sebelumnya untuk rollback
      const previousApplications = queryClient.getQueryData(["applications"]);

      // Update cache secara optimistic
      queryClient.setQueryData(["applications"], (old: Application[]) =>
        old?.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      return { previousApplications };
    },

    // Rollback jika gagal
    onError: (err, variables, context) => {
      queryClient.setQueryData(["applications"], context?.previousApplications);
      toast.error("Gagal mengubah status. Perubahan dibatalkan.");
    },

    // Invalidate query untuk sinkronisasi dengan server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
```

### 9.3 Visual Feedback Optimistic

```tsx
// Tampilkan badge dengan opacity berkurang selama pending
<Badge
  className={cn(
    statusConfig[status].className,
    isPending && "opacity-60 pointer-events-none"
  )}
>
  {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
  {statusConfig[status].label}
</Badge>
```

---

## 10. AI Feature UI Patterns

### 10.1 AI Action Button Pattern

Setiap tombol yang memicu AI harus konsisten secara visual:

```tsx
// Tombol AI — selalu ada ikon Sparkles, warna violet
<Button
  variant="outline"
  className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
  onClick={handleAIAction}
  disabled={isGenerating}
>
  {isGenerating ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Sparkles className="mr-2 h-4 w-4" />
  )}
  {isGenerating ? "Sedang Diproses..." : "Generate dengan AI"}
</Button>
```

### 10.2 AI-Generated Content Badge

Setiap konten yang dihasilkan AI harus diberi label yang jelas:

```tsx
// Label badge di sudut kiri atas atau bawah konten AI
<div className="relative">
  <div className="absolute top-2 right-2">
    <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-xs font-normal">
      <Sparkles className="mr-1 h-3 w-3" />
      Dibuat AI
    </Badge>
  </div>
  <div className="border-l-4 border-violet-300 pl-4 py-2">
    {aiGeneratedContent}
  </div>
</div>
```

### 10.3 Streaming Text UI (untuk C1 Cover Letter & C5 Career Advisor)

```tsx
function StreamingText({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div className="relative min-h-[100px]">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse align-middle" />
        )}
      </p>
      {isStreaming && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
    </div>
  );
}
```

### 10.4 AI Progress Indicator (untuk C2, C3, C6)

```tsx
// Untuk operasi AI yang tidak bisa di-stream
function AIProgressIndicator({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-violet-600 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">AI Sedang Bekerja</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
```

**Contoh penggunaan:**

```tsx
{isAnalyzing && (
  <AIProgressIndicator message="Membandingkan skill Anda dengan kebutuhan posisi ini..." />
)}
```

### 10.5 AI Match Score Display (untuk C di dashboard HR)

```tsx
function AIMatchScoreDisplay({ score, summary }: { score: number; summary: string }) {
  const color = score >= 80 ? "text-green-700" : score >= 50 ? "text-amber-600" : "text-red-600";
  const bgColor = score >= 80 ? "bg-green-50 border-green-200"
                : score >= 50 ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200";

  return (
    <Card className={cn("border", bgColor)}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("text-4xl font-bold", color)}>{score}%</div>
          <div>
            <div className="text-sm font-medium">AI Match Score</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-500" />
              Dihitung oleh AI
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
```

### 10.6 Chat UI — Career Path Advisor (C5)

```tsx
// UI chat sederhana — satu pertanyaan per sesi
function CareerAdvisorChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-medium">Konsultasi Karir AI</p>
          <p className="text-xs text-muted-foreground">Tanya apapun tentang karir Anda</p>
        </div>
      </div>

      {/* Input area */}
      <div className="relative">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Contoh: Saya 3 tahun di marketing, ingin pindah ke product management, apa yang harus saya persiapkan?"
          className="min-h-[80px] pr-12 resize-none"
          disabled={isStreaming}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8"
          onClick={handleSend}
          disabled={!question.trim() || isStreaming}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Streaming answer */}
      {(answer || isStreaming) && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Advisor
              </Badge>
            </div>
            <StreamingText content={answer} isStreaming={isStreaming} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 10.7 Skill Gap Results (C6)

```tsx
function SkillGapResults({ matched, gaps }: SkillGapProps) {
  return (
    <div className="space-y-6">
      {/* Skill yang dimiliki */}
      <div>
        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Skill yang Sudah Anda Miliki ({matched.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {matched.map((skill) => (
            <Badge key={skill} className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skill gap */}
      <div>
        <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Skill yang Perlu Dikembangkan ({gaps.length})
        </h4>
        <div className="space-y-3">
          {gaps.map((item) => (
            <Card key={item.skill} className="border-orange-200">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                    {item.skill}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ~{item.estimated_time}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.resource_types.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 10.8 Error Fallback Pattern (semua fitur AI)

```tsx
// Komponen error fallback — tampilkan saat AI gagal
function AIErrorFallback({ featureName, onRetry }: { featureName: string; onRetry: () => void }) {
  return (
    <Card className="border-dashed border-destructive/50">
      <CardContent className="py-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive/60 mb-3" />
        <p className="text-sm font-medium text-destructive mb-1">
          {featureName} tidak tersedia saat ini
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Layanan AI mengalami gangguan sementara. Fitur lainnya tetap berjalan normal.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3 w-3" />
          Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 10.9 Rate Limit Warning

```tsx
// Tampilkan saat user mendekati atau mencapai batas rate limit
function RateLimitWarning({ remaining, resetTime }: { remaining: number; resetTime: string }) {
  if (remaining > 3) return null;

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-md text-sm",
      remaining === 0
        ? "bg-red-50 text-red-700 border border-red-200"
        : "bg-amber-50 text-amber-700 border border-amber-200"
    )}>
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        {remaining === 0
          ? `Batas penggunaan tercapai. Tersedia kembali ${resetTime}.`
          : `Sisa ${remaining} penggunaan hari ini.`
        }
      </div>
    </div>
  );
}
```
