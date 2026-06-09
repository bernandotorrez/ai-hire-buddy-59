# TASKS.md — Development Task Breakdown

# AI Hire Buddy

**Versi:** 1.0.0  
**Tanggal:** 2026-06-09  
**Repo:** https://github.com/bernandotorrez/ai-hire-buddy-59

---

## Konvensi Label

| Label        | Arti                                                  |
| ------------ | ----------------------------------------------------- |
| `[SECURITY]` | Tugas terkait keamanan — wajib selesai sebelum launch |
| `[PERF]`     | Tugas terkait optimasi performa                       |
| `[AI]`       | Tugas terkait integrasi fitur AI                      |
| `[DEPLOY]`   | Tugas terkait konfigurasi deployment Vercel           |
| `[DB]`       | Tugas database / Supabase backend                     |
| `[FE]`       | Tugas frontend / UI                                   |

**Estimasi mengacu pada developer tunggal dengan familiarity TanStack + Supabase.**

## Status Progress

- `[x]` selesai
- `[~]` selesai sebagian / MVP sudah ada, tetapi belum memenuhi seluruh detail task
- tanpa tanda berarti belum dikerjakan

---

## Ringkasan Fase

| Fase      | Nama                                       | Est. Total   |
| --------- | ------------------------------------------ | ------------ |
| Phase 1   | Setup & Security Foundation                | ~2 hari      |
| Phase 2   | Core Features (A & B)                      | ~6 hari      |
| Phase 3   | AI Integration Core (CV Parsing, Matching) | ~3 hari      |
| Phase 4   | AI Value-Add Features (C1–C6)              | ~6 hari      |
| Phase 5   | Vercel Deployment & Configuration          | ~1 hari      |
| Phase 6   | Performance Optimization                   | ~2 hari      |
| Phase 7   | Testing & Security Hardening               | ~2 hari      |
| **Total** |                                            | **~22 hari** |

---

## Phase 1: Setup & Security Foundation

> **Tujuan:** Memastikan fondasi proyek aman, konfigurasi database lengkap dengan RLS, dan auth flow berjalan sebelum satu baris fitur ditulis.

---

### [~] TASK-1.1 `[DB]` `[SECURITY]`

**Nama:** Inisialisasi Schema Database Supabase

**Deskripsi:** Buat semua tabel di Supabase dengan kolom yang tepat sesuai PRD. Urutan pembuatan penting karena relasi FK. Buat file migrasi SQL di `supabase/migrations/`.

**Tabel yang dibuat:**

1. `companies`
2. `profiles` (FK ke `auth.users`)
3. `profile_educations` (FK ke `profiles`)
4. `profile_experiences` (FK ke `profiles`)
5. `jobs` (FK ke `companies`, `profiles`)
6. `applications` (FK ke `jobs`, `profiles`)
7. `application_status_logs` (FK ke `applications`, `profiles`)
8. `cover_letters` (FK ke `applications`, `profiles`)
9. `interview_questions` (FK ke `applications`, `profiles`, `jobs`)
10. `ai_career_consultations` (FK ke `profiles`)
11. `ai_insights_cache` (FK ke `jobs`)

**Output:** File `supabase/migrations/0001_initial_schema.sql` berisi semua DDL.

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** —

---

### [~] TASK-1.2 `[DB]` `[SECURITY]`

**Nama:** Implementasi Row Level Security (RLS) untuk Semua Tabel

**Deskripsi:** Aktifkan RLS di semua tabel dan definisikan policy untuk setiap kombinasi operasi (SELECT, INSERT, UPDATE, DELETE) dan role (anonymous, job_seeker, hr_recruiter). Tidak boleh ada tabel tanpa policy eksplisit.

**Policy yang harus dibuat:**

- `profiles`: self-read/write; HR baca profil pelamar di lowongannya
- `companies`: public SELECT; HR INSERT/UPDATE untuk perusahaannya
- `jobs`: public SELECT (active only); HR CRUD untuk lowongan miliknya
- `profile_educations`, `profile_experiences`: self CRUD only
- `applications`: job seeker self INSERT + SELECT; HR SELECT lamaran di lowongannya; service role UPDATE untuk AI score
- `application_status_logs`: read by involved parties; INSERT via service role only
- `cover_letters`: author + HR yang menerima lamaran
- `interview_questions`: HR self CRUD
- `ai_career_consultations`: self CRUD only
- `ai_insights_cache`: HR read; service role write only

**Output:** File `supabase/migrations/0002_rls_policies.sql`

**Estimasi:** 6 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1

---

### [x] TASK-1.3 `[DB]` `[PERF]`

**Nama:** Buat Database Indexes

**Deskripsi:** Tambahkan indexes pada kolom yang sering digunakan untuk filter, sort, dan join.

**Indexes yang dibuat:**

```sql
-- jobs
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);

-- applications
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_ai_match_score ON applications(ai_match_score DESC);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- ai_career_consultations
CREATE INDEX idx_ai_career_consultations_user_created ON ai_career_consultations(user_id, created_at DESC);

-- ai_insights_cache
CREATE INDEX idx_ai_insights_cache_job_id ON ai_insights_cache(job_id);
CREATE INDEX idx_ai_insights_cache_updated_at ON ai_insights_cache(updated_at DESC);
```

**Output:** File `supabase/migrations/0003_indexes.sql`

**Estimasi:** 1 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1

---

### [x] TASK-1.4 `[DB]` `[SECURITY]`

**Nama:** Setup Supabase Storage Bucket untuk CV

**Deskripsi:** Buat storage bucket `cvs` di Supabase dengan konfigurasi privat (bukan public). Set policy storage yang mengizinkan job seeker mengupload CV miliknya, dan HR membaca CV pelamar ke lowongannya via signed URL.

**Konfigurasi:**

- Bucket name: `cvs`
- Public: `false`
- File size limit: 5MB
- Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Storage RLS: job seeker INSERT ke path `{user_id}/`; HR SELECT via signed URL dengan expiry 1 jam

**Output:** File `supabase/migrations/0004_storage_setup.sql`

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.2

---

### [~] TASK-1.5 `[FE]` `[SECURITY]`

**Nama:** Setup Supabase Client & Auth di Frontend

**Deskripsi:** Konfigurasi Supabase client di `src/lib/supabase.ts` menggunakan Anon Key (dari env variable). Implementasi auth store (Supabase session listener) yang mengintegrasikan dengan TanStack Router untuk route protection.

**File yang dibuat/diubah:**

- `src/lib/supabase.ts` — Supabase client singleton
- `src/lib/auth.ts` — helper fungsi (getCurrentUser, requireAuth, requireRole)
- `.env.example` — dokumentasi env variables

**Aturan:**

- Hanya gunakan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di frontend
- Service Role Key tidak boleh ada di frontend sama sekali
- Gunakan `@supabase/supabase-js` yang sudah ada di package.json

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** —

---

### [~] TASK-1.6 `[FE]` `[SECURITY]`

**Nama:** Implementasi Authentication Pages & Route Guards

**Deskripsi:** Buat halaman login, register, dan lupa password. Implementasi TanStack Router `beforeLoad` guards untuk semua route yang memerlukan autentikasi atau role tertentu.

**Halaman yang dibuat:**

- `/auth/login` — form email + password
- `/auth/register` — pilih role (job_seeker / hr_recruiter) + form registrasi
- `/auth/forgot-password` — email reset (menggunakan Supabase built-in)
- `/auth/callback` — callback handler untuk OAuth/magic link

**Route guards:**

- `/dashboard/*` — wajib login + role `hr_recruiter`
- `/profile`, `/applications` — wajib login + role `job_seeker`
- `/jobs/[id]/apply` — wajib login

**Pola guard (konsisten dengan TanStack Router):**

```typescript
// src/routes/dashboard/route.tsx
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const session = await requireHRRole(context.supabase);
    if (!session) throw redirect({ to: "/auth/login" });
  },
});
```

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.5

---

### [x] TASK-1.7 `[DB]` `[SECURITY]`

**Nama:** Setup Trigger & Function Database untuk Profile Auto-Create

**Deskripsi:** Buat trigger Supabase yang secara otomatis membuat record di tabel `profiles` ketika user baru mendaftar via `auth.users`. Role default ditentukan dari metadata registrasi.

**Output:**

```sql
-- supabase/migrations/0005_profile_trigger.sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Estimasi:** 1 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-1.2

---

## Phase 2: Core Features (A & B)

> **Tujuan:** Bangun semua halaman publik (job seeker) dan halaman dashboard HR tanpa fitur AI terlebih dahulu.

---

### [~] TASK-2.1 `[FE]` `[PERF]`

**Nama:** Layout Utama & Navigasi

**Deskripsi:** Buat layout utama yang digunakan di semua halaman: navbar, sidebar HR dashboard, dan bottom nav mobile. Implementasi dark/light mode toggle (opsional, jika ada waktu).

**Komponen yang dibuat:**

- `src/components/layout/Navbar.tsx` — navigasi publik
- `src/components/layout/DashboardLayout.tsx` — layout HR dengan sidebar
- `src/components/layout/Sidebar.tsx` — sidebar HR (navigasi ke Lowongan, Pelamar)
- `src/routes/__root.tsx` — root layout dengan Toaster (Sonner)

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.6

---

### [~] TASK-2.2 `[FE]` `[PERF]`

**Nama:** Halaman Utama — Daftar Lowongan (SSR)

**Deskripsi:** Buat halaman publik daftar lowongan dengan SSR via TanStack Start. Implementasi filter (posisi, lokasi, tipe pekerjaan), pencarian, dan cursor-based pagination.

**File yang dibuat:**

- `src/routes/index.tsx` — halaman utama (SSR loader)
- `src/components/jobs/JobCard.tsx` — card lowongan
- `src/components/jobs/JobCardSkeleton.tsx` — skeleton
- `src/components/jobs/JobFilters.tsx` — komponen filter
- `src/components/jobs/JobList.tsx` — list dengan pagination
- `src/lib/queries/jobs.ts` — TanStack Query hooks untuk jobs

**Persyaratan:**

- SSR dengan TanStack Start `loader`
- Dehydrate/hydrate TanStack Query dari server ke client
- `staleTime: 5 * 60 * 1000`
- Hanya ambil field yang ditampilkan di list view (tidak `select('*')`)
- Skeleton screen saat loading

**Estimasi:** 6 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-2.1

---

### [~] TASK-2.3 `[FE]` `[PERF]`

**Nama:** Halaman Detail Lowongan (SSR)

**Deskripsi:** Halaman detail satu lowongan dengan informasi lengkap dan tombol "Lamar Sekarang".

**File yang dibuat:**

- `src/routes/jobs/$jobId.tsx` — route detail
- `src/components/jobs/JobDetail.tsx` — konten detail
- `src/components/jobs/ApplyButton.tsx` — tombol lamar dengan state handler

**Logika tombol "Lamar Sekarang":**

- Belum login → redirect ke `/auth/login`
- Sudah melamar → disabled + label "Sudah Dilamar"
- Sudah login, belum melamar → buka flow lamaran (modal atau halaman)

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.2

---

### [~] TASK-2.4 `[FE]`

**Nama:** Halaman Profil Job Seeker

**Deskripsi:** Buat halaman profil yang dapat diisi manual oleh job seeker. Implementasi form dengan React Hook Form + Zod. Termasuk section pendidikan (multiple entries) dan pengalaman kerja (multiple entries) dengan tambah/hapus dinamis.

**File yang dibuat:**

- `src/routes/profile/index.tsx` — halaman profil
- `src/components/profile/ProfileForm.tsx` — form utama
- `src/components/profile/EducationSection.tsx` — section pendidikan
- `src/components/profile/ExperienceSection.tsx` — section pengalaman
- `src/components/profile/SkillsInput.tsx` — input tags skill
- `src/lib/queries/profile.ts` — TanStack Query hooks profil

**Estimasi:** 8 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.5, TASK-2.1

---

### [~] TASK-2.5 `[FE]` `[PERF]`

**Nama:** Halaman Riwayat Lamaran

**Deskripsi:** Daftar lamaran yang dikirimkan job seeker beserta status terkini. Implementasi Supabase Realtime untuk update status secara live.

**File yang dibuat:**

- `src/routes/applications/index.tsx` — halaman riwayat
- `src/components/applications/ApplicationCard.tsx` — card per lamaran
- `src/components/applications/ApplicationStatusBadge.tsx` — badge status
- `src/hooks/useApplicationsRealtime.ts` — hook Supabase Realtime
- `src/lib/queries/applications.ts` — TanStack Query hooks

**Persyaratan:**

- Supabase Realtime subscription untuk `applications` table (filter by `applicant_id`)
- Cleanup subscription di `useEffect` return / `onUnmount`
- Toast notifikasi saat status berubah
- `staleTime: 0` untuk data real-time

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.4

---

### [~] TASK-2.6 `[FE]`

**Nama:** Flow Submit Lamaran

**Deskripsi:** Implementasi flow lengkap untuk submit lamaran dari halaman detail lowongan. Termasuk validasi profil sudah terisi minimal, modal konfirmasi, dan optimistic update di riwayat lamaran.

**File yang dibuat:**

- `src/components/jobs/ApplyModal.tsx` — modal konfirmasi
- `src/hooks/useSubmitApplication.ts` — mutation hook dengan optimistic update

**Logika:**

- Cek profil sudah terisi (minimal nama + headline)
- Jika profil belum lengkap → arahkan ke halaman profil dulu
- Optimistic: langsung tampilkan di riwayat lamaran dengan status "applied"
- Error handling: rollback optimistic jika gagal + toast error

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.3, TASK-2.5

---

### [~] TASK-2.7 `[FE]`

**Nama:** Dashboard HR — Manajemen Lowongan (CRUD)

**Deskripsi:** Halaman dashboard HR untuk membuat, melihat, mengedit, dan menghapus lowongan.

**File yang dibuat:**

- `src/routes/dashboard/jobs/index.tsx` — list lowongan milik HR
- `src/routes/dashboard/jobs/new.tsx` — form buat lowongan baru
- `src/routes/dashboard/jobs/$jobId/edit.tsx` — form edit lowongan
- `src/components/dashboard/JobForm.tsx` — form lowongan (shared new/edit)
- `src/components/dashboard/JobStatusToggle.tsx` — toggle aktif/draft/closed
- `src/lib/queries/dashboard-jobs.ts` — query hooks

**Schema validasi Zod untuk form lowongan:**

- `title`: string min 3
- `description`: string min 50
- `requirements`: string min 20
- `location`: string required
- `job_type`: enum ['full-time', 'part-time', 'remote', 'contract']
- `seniority`: enum optional
- `salary_min`, `salary_max`: number optional, min > 0
- `deadline`: date optional, harus di masa depan
- `status`: enum ['active', 'draft', 'closed']

**Estimasi:** 7 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.6, TASK-2.1

---

### [~] TASK-2.8 `[FE]` `[PERF]`

**Nama:** Dashboard HR — Applicant Tracker (Tabel Pelamar)

**Deskripsi:** Halaman daftar pelamar per lowongan dengan filter, sort, dan Supabase Realtime untuk pelamar baru.

**File yang dibuat:**

- `src/routes/dashboard/jobs/$jobId/applicants/index.tsx` — tabel pelamar
- `src/components/dashboard/ApplicantTable.tsx` — tabel + filter + sort
- `src/components/dashboard/ApplicantTableSkeleton.tsx` — skeleton
- `src/hooks/useApplicantsRealtime.ts` — Realtime hook

**Fitur:**

- Filter: berdasarkan status lamaran
- Sort: AI match score (desc), tanggal melamar (desc)
- Real-time: baris baru muncul saat pelamar baru masuk + toast "Pelamar baru masuk!"
- Klik baris → navigate ke detail pelamar

**Estimasi:** 6 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.7

---

### [~] TASK-2.9 `[FE]`

**Nama:** Dashboard HR — Halaman Detail Pelamar

**Deskripsi:** Halaman detail untuk satu pelamar yang melamar ke lowongan tertentu. Tampilkan profil lengkap, link CV (signed URL), riwayat status, dan kontrol ubah status.

**File yang dibuat:**

- `src/routes/dashboard/jobs/$jobId/applicants/$applicationId.tsx`
- `src/components/dashboard/ApplicantProfile.tsx` — tampilan profil
- `src/components/dashboard/ApplicationStatusManager.tsx` — kontrol status
- `src/components/dashboard/StatusTimeline.tsx` — riwayat perubahan status

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.8

---

### [~] TASK-2.10 `[FE]` `[PERF]`

**Nama:** Manajemen Status Lamaran dengan Optimistic Update

**Deskripsi:** Implementasi ubah status lamaran oleh HR dengan optimistic update menggunakan TanStack Query.

**File yang dibuat/diubah:**

- `src/hooks/useUpdateApplicationStatus.ts` — mutation dengan optimistic update
- Integrasi ke `ApplicationStatusManager.tsx`

**Pola:**

- `onMutate`: update cache lokal secara optimistic
- `onError`: rollback + toast error
- `onSettled`: invalidate query untuk sinkronisasi
- Log setiap perubahan status ke tabel `application_status_logs`

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.9

---

## Phase 3: AI Integration Core (CV Parsing & CV Matching)

> **Tujuan:** Bangun Edge Functions AI pertama yang kritikal — parsing CV dan matching kandidat.

---

### [~] TASK-3.1 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Buat Edge Function `parse-cv`

**Deskripsi:** Edge Function Supabase untuk parsing CV dengan AI. Menerima file (PDF/DOCX), validasi server-side, ekstrak teks, kirim ke AI, kembalikan data profil terstruktur.

**File:** `supabase/functions/parse-cv/index.ts`

**Implementasi:**

1. Validasi JWT header
2. Parse request body (multipart/form-data)
3. Validasi file: max 5MB, hanya `application/pdf` atau DOCX MIME type
4. Ekstrak teks dari PDF (gunakan `pdfjs-dist` atau ekstrak via text layer) / DOCX (ekstrak teks dari XML)
5. Kirim teks ke `ai.sumopod.com` dengan prompt terstruktur (JSON output)
6. Validasi output AI dengan Zod
7. Kembalikan data profil terstruktur
8. Rate limiting: cek counter di table atau Supabase Redis (max 10/user/jam)
9. Log request (tanpa isi CV)
10. CORS headers dengan allowed origins dari env

**Prompt template:**

```
Ekstrak informasi berikut dari teks CV ini dan kembalikan HANYA JSON valid:
{ name, email, phone, headline, summary, skills: string[],
  educations: [{institution, degree, field, start_year, end_year}],
  experiences: [{company, title, location, start_date, end_date, is_current, description}] }
```

**Estimasi:** 6 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.4, TASK-1.5

---

### [~] TASK-3.2 `[FE]` `[AI]`

**Nama:** Integrasi Upload CV & AI Parsing di Halaman Profil

**Deskripsi:** Tambahkan fitur upload CV ke halaman profil job seeker. Setelah upload, panggil Edge Function `parse-cv` dan populate form dengan hasilnya.

**File yang dibuat/diubah:**

- `src/components/profile/CVUpload.tsx` — drag-and-drop upload area
- `src/hooks/useParseCv.ts` — mutation hook
- Integrasi ke `src/routes/profile/index.tsx`

**UX Flow:**

1. User drag-and-drop atau klik pilih file
2. Validasi client-side (ukuran, tipe) — sebagai feedback awal, bukan sebagai satu-satunya validasi
3. Upload ke Supabase Storage di path `{user_id}/cv-{timestamp}.pdf`
4. Panggil `parse-cv` Edge Function dengan reference ke file yang diupload
5. Tampilkan `AIProgressIndicator` selama parsing
6. Form di-populate dengan hasil parsing
7. User dapat edit sebelum simpan
8. Jika gagal: toast error + fallback ke form manual

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** TASK-3.1, TASK-2.4

---

### [~] TASK-3.3 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Buat Edge Function `match-cv`

**Deskripsi:** Edge Function untuk menghitung AI match score antara kandidat dan lowongan. Dipanggil otomatis saat lamaran masuk, dan secara manual oleh HR.

**File:** `supabase/functions/match-cv/index.ts`

**Implementasi:**

1. Validasi JWT (harus HR atau system call)
2. Validasi input: `{ application_id: UUID }` dengan Zod
3. Ambil data lamaran + profil kandidat + deskripsi lowongan dari DB (menggunakan service role key)
4. Update `ai_match_status = 'processing'` di tabel `applications`
5. Kirim ke AI dengan prompt scoring (output: `{ score: number 0-100, strengths: string[], weaknesses: string[], summary: string }`)
6. Update `applications` dengan `ai_match_score`, `ai_match_summary`, `ai_match_status = 'completed'`
7. Rate limiting: 50/user/jam
8. Error handling: update `ai_match_status = 'failed'` jika AI error

**Trigger otomatis:** Daftar ke Database Webhook di Supabase untuk event INSERT pada tabel `applications` → call `match-cv`.

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-3.1

---

### [~] TASK-3.4 `[FE]` `[AI]`

**Nama:** Tampilkan AI Match Score di Dashboard HR

**Deskripsi:** Integrasi tampilan AI match score di tabel pelamar dan halaman detail pelamar. Termasuk tombol "Hitung Ulang" untuk trigger manual.

**File yang dibuat/diubah:**

- `src/components/dashboard/MatchScoreBadge.tsx`
- `src/components/dashboard/MatchScoreDetail.tsx` — card dengan score + summary
- `src/hooks/useRematchCv.ts` — mutation untuk trigger ulang
- Integrasi ke `ApplicantTable.tsx` dan halaman detail pelamar

**State handling:**

- `pending` → badge "Menunggu" (muted)
- `processing` → badge "Menganalisis..." dengan spinner
- `completed` → badge skor berwarna (hijau/kuning/merah)
- `failed` → badge "Gagal" + tombol retry

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-3.3, TASK-2.9

---

## Phase 4: AI Value-Add Features (C1–C6)

> **Tujuan:** Bangun semua fitur AI nilai tambah yang menjadi diferensiasi produk.

---

### [~] TASK-4.1 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `generate-cover-letter` (C1)

**Deskripsi:** Edge Function untuk generate cover letter yang dipersonalisasi berdasarkan profil kandidat dan deskripsi lowongan. Menggunakan streaming response (SSE).

**File:** `supabase/functions/generate-cover-letter/index.ts`

**Implementasi:**

1. Validasi JWT (harus job_seeker yang melamar / berencana melamar)
2. Validasi input: `{ job_id: UUID, language: 'id' | 'en' }` dengan Zod
3. Ambil profil user + deskripsi lowongan dari DB
4. Panggil AI dengan streaming enabled
5. Stream response ke client via Server-Sent Events (`text/event-stream`)
6. Rate limiting: 20/user/hari
7. Setelah streaming selesai, jangan simpan otomatis — simpan hanya jika user konfirmasi

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-3.1

---

### [~] TASK-4.2 `[FE]` `[AI]`

**Nama:** UI Cover Letter Generator di Flow Lamaran (C1)

**Deskripsi:** Integrasi cover letter generator ke dalam flow melamar lowongan.

**File yang dibuat:**

- `src/components/jobs/CoverLetterModal.tsx` — modal dengan pilihan bahasa + textarea + streaming display
- `src/hooks/useGenerateCoverLetter.ts` — hook untuk SSE streaming
- `src/lib/sse-client.ts` — utility untuk consume SSE dari Edge Function
- Integrasi ke `ApplyModal.tsx`

**UX Flow:**

1. User di ApplyModal → pilih "Buat Cover Letter dengan AI" atau "Tulis Sendiri"
2. Jika pilih AI: tampilkan pilihan bahasa (ID/EN)
3. Tampilkan `StreamingText` saat AI menulis
4. Setelah selesai: user bisa edit di textarea
5. Simpan dan lanjut ke submit lamaran
6. Cover letter tersimpan ke `cover_letters` table saat lamaran di-submit

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-4.1, TASK-2.6

---

### [x] TASK-4.3 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `generate-interview-questions` (C2)

**Deskripsi:** Edge Function untuk generate pertanyaan interview relevan berdasarkan profil kandidat dan deskripsi posisi.

**File:** `supabase/functions/generate-interview-questions/index.ts`

**Output structure:**

```json
{
  "technical": ["Pertanyaan 1", "..."],
  "behavioral": ["Pertanyaan 1", "..."],
  "situational": ["Pertanyaan 1", "..."]
}
```

**Implementasi:**

1. Validasi JWT (harus hr_recruiter)
2. Validasi input: `{ application_id: UUID, seniority: 'junior' | 'mid' | 'senior' }`
3. Ambil profil kandidat + deskripsi lowongan
4. Generate dengan AI (prompt output JSON terstruktur)
5. Simpan ke `interview_questions` table
6. Rate limiting: 30/user/hari

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-3.1

---

### [~] TASK-4.4 `[FE]` `[AI]`

**Nama:** UI Interview Question Generator di Halaman Detail Pelamar (C2)

**Deskripsi:** Tambahkan panel/card untuk generate dan melihat pertanyaan interview di halaman detail pelamar HR.

**File yang dibuat:**

- `src/components/dashboard/InterviewQuestionsPanel.tsx`
- `src/hooks/useGenerateInterviewQuestions.ts`

**UX:**

- Tombol "Generate Pertanyaan Interview" dengan pilihan seniority
- Progress indicator selama proses
- Tampilkan hasil dalam 3 accordion: Technical, Behavioral, Situational
- Tombol salin per kategori
- Tampilkan histori pertanyaan yang pernah di-generate untuk kandidat ini

**Estimasi:** 4 jam  
**Prioritas:** Medium  
**Dependensi:** TASK-4.3, TASK-2.9

---

### [x] TASK-4.5 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `generate-job-description` (C3)

**Deskripsi:** Edge Function untuk generate deskripsi pekerjaan lengkap berdasarkan nama posisi, departemen, dan seniority.

**File:** `supabase/functions/generate-job-description/index.ts`

**Output structure:**

```json
{
  "summary": "...",
  "responsibilities": ["...", "..."],
  "required_qualifications": ["...", "..."],
  "preferred_qualifications": ["...", "..."],
  "benefits": ["...", "..."]
}
```

**Implementasi:**

1. Validasi JWT (harus hr_recruiter)
2. Validasi input: `{ position: string, department: string, seniority: 'junior' | 'mid' | 'senior' }`
3. Prompt AI untuk output JSON terstruktur
4. Rate limiting: 20/user/hari
5. Kembalikan output tanpa menyimpan ke DB (simpan hanya saat user submit form lowongan)

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-3.1

---

### [~] TASK-4.6 `[FE]` `[AI]`

**Nama:** Integrasi AI Job Description Generator ke Form Lowongan (C3)

**Deskripsi:** Tambahkan tombol "Generate dengan AI" di form buat/edit lowongan yang mem-populate field form dengan output AI.

**File yang dibuat/diubah:**

- `src/hooks/useGenerateJobDescription.ts`
- Tambah komponen `AIGenerateSection` ke `src/components/dashboard/JobForm.tsx`

**UX:**

1. HR isi field: nama posisi, departemen, seniority (field minimal yang sudah ada di form)
2. Klik "Generate dengan AI"
3. Progress indicator selama proses
4. Hasil AI di-populate ke field: description, requirements form fields
5. HR bisa edit sebelum simpan
6. Badge "Dibuat AI" ditampilkan di samping field yang di-populate

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-4.5, TASK-2.7

---

### [x] TASK-4.7 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `generate-candidate-insights` (C4)

**Deskripsi:** Edge Function untuk menghasilkan narasi insights tentang pool pelamar untuk satu lowongan. Hasil di-cache di tabel `ai_insights_cache`.

**File:** `supabase/functions/generate-candidate-insights/index.ts`

**Implementasi:**

1. Validasi JWT (harus hr_recruiter yang memiliki lowongan tersebut)
2. Validasi input: `{ job_id: UUID }`
3. Ambil semua data pelamar (skills, pengalaman, lokasi, skor match) untuk job_id tersebut
4. Buat prompt dengan data agregat (bukan data personal spesifik dalam response)
5. Generate narasi insights
6. Upsert ke `ai_insights_cache` dengan `updated_at` terkini
7. Rate limiting: 10/user/jam per lowongan

**Estimasi:** 4 jam  
**Prioritas:** Medium  
**Dependensi:** TASK-1.1, TASK-3.3

---

### [~] TASK-4.8 `[FE]` `[AI]`

**Nama:** UI AI Candidate Insights Panel di Dashboard HR (C4)

**Deskripsi:** Tambahkan panel AI Insights di atas tabel pelamar di dashboard HR.

**File yang dibuat:**

- `src/components/dashboard/AIInsightsPanel.tsx`
- `src/hooks/useCandidateInsights.ts` — dengan staleTime 10 menit

**UX:**

- Panel collapsed by default, dapat dibuka user
- Tampilkan teks narasi dari AI
- Badge "Diperbarui X menit lalu" berdasarkan `updated_at` cache
- Tombol "Perbarui Insights" untuk regenerasi manual
- Loading: skeleton sesuai DESIGN_SYSTEM.md
- Error fallback dengan tombol retry

**Estimasi:** 3 jam  
**Prioritas:** Medium  
**Dependensi:** TASK-4.7, TASK-2.8

---

### [~] TASK-4.9 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `career-advisor` (C5) dengan Streaming

**Deskripsi:** Edge Function untuk Career Path Advisor dengan streaming SSE response. Memanfaatkan profil user dan daftar lowongan aktif sebagai konteks AI.

**File:** `supabase/functions/career-advisor/index.ts`

**Implementasi:**

1. Validasi JWT (harus job_seeker)
2. Validasi input: `{ question: string }` (max 1000 karakter) dengan Zod
3. Ambil profil user + daftar max 20 lowongan aktif terbaru dari DB
4. Panggil AI dengan streaming, inject profil dan lowongan sebagai konteks
5. Stream response ke client via SSE
6. Setelah streaming selesai, simpan konsultasi ke `ai_career_consultations`
7. Otomatis hapus entri terlama jika total melebihi 10 per user
8. Rate limiting: 15/user/hari

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.1, TASK-3.1

---

### [~] TASK-4.10 `[FE]` `[AI]`

**Nama:** UI Career Path Advisor di Halaman Profil (C5)

**Deskripsi:** Tambahkan section "Konsultasi Karir AI" di halaman profil job seeker dengan chat UI sederhana.

**File yang dibuat:**

- `src/components/profile/CareerAdvisor.tsx` — chat UI
- `src/hooks/useCareerAdvisor.ts` — hook SSE streaming + simpan histori

**UX:**

- Section di-collapsible / bisa di-expand
- Input pertanyaan bebas + tombol kirim
- Area streaming response dengan animasi cursor
- Histori konsultasi (maks 10 entri) ditampilkan di bawah
- Setiap histori menampilkan pertanyaan + ringkasan jawaban (truncated)

**Estimasi:** 5 jam  
**Prioritas:** High  
**Dependensi:** TASK-4.9, TASK-2.4

---

### [x] TASK-4.11 `[DB]` `[SECURITY]` `[AI]`

**Nama:** Edge Function `analyze-skill-gap` (C6)

**Deskripsi:** Edge Function untuk menganalisis skill gap antara profil kandidat dengan persyaratan lowongan.

**File:** `supabase/functions/analyze-skill-gap/index.ts`

**Output structure:**

```json
{
  "matched_skills": ["TypeScript", "React"],
  "gap_skills": [
    {
      "skill": "AWS",
      "estimated_time": "2-3 bulan",
      "resource_types": ["Online course", "Dokumentasi resmi", "Proyek latihan"]
    }
  ]
}
```

**Implementasi:**

1. Validasi JWT (harus job_seeker)
2. Validasi input: `{ job_id: UUID }` dengan Zod
3. Ambil profil user + deskripsi + requirements lowongan
4. Generate analisis dengan AI (output JSON terstruktur)
5. Rate limiting: 20/user/hari
6. Tidak disimpan ke DB (result sementara di client state)

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** TASK-3.1

---

### [~] TASK-4.12 `[FE]` `[AI]`

**Nama:** UI Skill Gap Analyzer di Halaman Detail Lowongan (C6)

**Deskripsi:** Tambahkan tombol dan panel hasil Skill Gap Analyzer di halaman detail lowongan.

**File yang dibuat:**

- `src/components/jobs/SkillGapAnalyzer.tsx` — trigger + result panel
- `src/hooks/useSkillGapAnalysis.ts` — mutation hook

**UX:**

- Tombol "Analisis Skill Gap" hanya tampil jika user sudah login dan punya profil
- Klik tombol → tampilkan progress indicator
- Hasil muncul di modal atau collapsible panel di bawah tombol
- Tampilkan `SkillGapResults` component dari DESIGN_SYSTEM.md (Badge hijau/oranye)

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** TASK-4.11, TASK-2.3

---

## Phase 5: Vercel Deployment & Configuration

> **Tujuan:** Pastikan semua konfigurasi Vercel siap sebelum testing dilakukan di environment production-like.

---

### [x] TASK-5.1 `[DEPLOY]`

**Nama:** Buat File `vercel.json` dengan Security Headers

**Deskripsi:** Buat file konfigurasi Vercel di root repo dengan build config, security headers, dan rewrite rules.

**File:** `vercel.json`

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".output/public",
  "installCommand": "bun install",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co; font-src 'self'; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

**Catatan:** CSP perlu disesuaikan setelah testing — `'unsafe-inline'` untuk script dapat dihapus jika tidak ada inline script.

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** —

---

### [~] TASK-5.2 `[DEPLOY]`

**Nama:** Konfigurasi Nitro Preset untuk Vercel

**Deskripsi:** Konfigurasi Nitro agar menggunakan preset Vercel saat build. Karena repo menggunakan `@lovable.dev/vite-tanstack-config` sebagai wrapper, pendekatan yang aman adalah via environment variable.

**Implementasi:**

Di Vercel Dashboard → Environment Variables, tambahkan:

```
NITRO_PRESET=vercel
```

Jika wrapper mendukung passthrough nitro config, update `vite.config.ts`:

```typescript
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Uncomment jika @lovable.dev/vite-tanstack-config mendukung nitro passthrough:
  // nitro: { preset: "vercel" }
});
```

**⚠️ Known Limitation:** Jika `@lovable.dev/vite-tanstack-config@2.3.2` tidak mendukung `nitro.preset` passthrough, gunakan `NITRO_PRESET=vercel` di Vercel environment variable sebagai workaround.

**Checklist testing:**

- [ ] Build lokal dengan `NITRO_PRESET=vercel bun run build` berhasil
- [ ] Folder `.output/` dihasilkan dengan struktur yang benar
- [ ] `.output/public/` berisi static assets
- [ ] SSR berjalan di Vercel Serverless Functions

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-5.1

---

### TASK-5.3 `[DEPLOY]` `[SECURITY]`

**Nama:** Setup Environment Variables di Vercel Dashboard

**Deskripsi:** Set semua environment variables yang diperlukan di Vercel project settings. Gunakan `.env.example` sebagai checklist.

**Checklist env vars di Vercel:**

- [ ] `VITE_SUPABASE_URL` — URL project Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` — Supabase anon key (public, safe di frontend)
- [ ] `VITE_APP_URL` — URL production Vercel (format: `https://[project].vercel.app`)
- [ ] `NITRO_PRESET` — set ke `vercel`

**Yang TIDAK boleh ada di Vercel env vars:**

- Supabase Service Role Key → harus di Supabase Secrets saja
- AI API Key (ai.sumopod.com) → harus di Supabase Secrets saja

**Estimasi:** 1 jam  
**Prioritas:** High  
**Dependensi:** —

---

### TASK-5.4 `[DEPLOY]` `[SECURITY]`

**Nama:** Setup Supabase Auth URL Configuration untuk Vercel

**Deskripsi:** Konfigurasi Supabase Auth agar mengizinkan callback ke domain Vercel.

**Langkah di Supabase Dashboard → Auth → URL Configuration:**

- [ ] Site URL: `https://[project-name].vercel.app`
- [ ] Redirect URLs (tambahkan keduanya):
  - `https://[project-name].vercel.app/**`
  - `http://localhost:3000/**` (untuk dev)
  - `http://localhost:5173/**` (untuk Vite dev)

**Estimasi:** 30 menit  
**Prioritas:** High  
**Dependensi:** —

---

### TASK-5.5 `[DEPLOY]` `[SECURITY]`

**Nama:** Setup Supabase Secrets untuk AI API Key & App URL

**Deskripsi:** Simpan credentials sensitif sebagai Supabase Secrets (bukan di `.env` yang mungkin di-commit).

**Di Supabase Dashboard → Settings → Edge Functions → Secrets:**

- [ ] `AI_SUMOPOD_API_KEY` = API key dari ai.sumopod.com
- [ ] `APP_URL` = URL Vercel production (untuk CORS Edge Functions)

**Cara akses di Edge Functions:**

```typescript
const aiApiKey = Deno.env.get("AI_SUMOPOD_API_KEY");
const appUrl = Deno.env.get("APP_URL");
```

**Estimasi:** 30 menit  
**Prioritas:** High  
**Dependensi:** —

---

### [x] TASK-5.6 `[DEPLOY]`

**Nama:** Buat File `.env.example`

**Deskripsi:** Dokumentasikan semua environment variables yang dibutuhkan tanpa nilai sebenarnya.

**File:** `.env.example`

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
VITE_APP_URL=http://localhost:3000

# Build
# NITRO_PRESET=vercel  # Set ini di Vercel dashboard, bukan di .env lokal

# CATATAN KEAMANAN:
# AI API Key (AI_SUMOPOD_API_KEY) disimpan di Supabase Secrets via Dashboard
# Supabase Service Role Key disimpan di Supabase Secrets via Dashboard
# JANGAN pernah commit keys sensitif ke repository
```

**Estimasi:** 15 menit  
**Prioritas:** High  
**Dependensi:** —

---

### TASK-5.7 `[DEPLOY]` `[PERF]`

**Nama:** Konfigurasi Vercel Edge Runtime & Cache Headers untuk SSR

**Deskripsi:** Optimasi SSR pages publik menggunakan Vercel Edge dan cache headers.

**Implementasi:**

- Tambahkan `Cache-Control: s-maxage=300, stale-while-revalidate=600` di response halaman SSR publik (daftar lowongan, detail lowongan)
- Konfigurasi function region ke `sin1` (Singapore) di Vercel settings atau konfigurasi Nitro jika tersedia
- Enable Vercel Analytics & Speed Insights dari Vercel Dashboard (tidak perlu install package)

**Cara set cache di TanStack Start SSR response:**

```typescript
// Di loader halaman publik
export const loader = createServerFn().handler(async () => {
  // Set headers via TanStack Start / Nitro response
  setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  // ...fetch data
});
```

**Estimasi:** 2 jam  
**Prioritas:** Medium  
**Dependensi:** TASK-5.2

---

### TASK-5.8 `[DEPLOY]`

**Nama:** Verifikasi Build & Deploy ke Vercel

**Deskripsi:** Lakukan first deployment dan verifikasi semua fitur berjalan di environment Vercel.

**Checklist verifikasi:**

- [ ] Build berhasil tanpa error di Vercel CI
- [ ] Halaman publik dapat diakses tanpa login
- [ ] Auth (login/register) berfungsi
- [ ] Dashboard HR accessible setelah login
- [ ] Supabase connection working (auth + database)
- [ ] Edge Functions terdeploy dan bisa dipanggil
- [ ] Storage signed URLs berfungsi
- [ ] Realtime connection berfungsi
- [ ] CSP headers aktif (cek via browser devtools → Network)
- [ ] `bun.lock` di-commit ke repo untuk Vercel build cache

**Estimasi:** 3 jam (termasuk troubleshooting)  
**Prioritas:** High  
**Dependensi:** TASK-5.1 — TASK-5.7

---

## Phase 6: Performance Optimization

> **Tujuan:** Optimasi performa setelah semua fitur berjalan.

---

### [x] TASK-6.1 `[PERF]`

**Nama:** Audit & Perbaikan Query Supabase (Hapus `select('*')`)

**Deskripsi:** Review semua query Supabase di frontend dan pastikan tidak ada `select('*')`. Ganti dengan kolom spesifik yang dibutuhkan per view.

**Checklist:**

- [x] List lowongan: hanya ambil field yang dibutuhkan view (`id`, `title`, `company`, `location`, `employment_type`, `salary_min`, `salary_max`, `created_at`, `status` via filter)
- [x] Tabel pelamar: hanya ambil field kandidat/lamaran yang ditampilkan
- [x] Riwayat lamaran: hanya ambil field lamaran + lowongan yang ditampilkan
- [x] Detail pelamar: fetch penuh profil kandidat hanya di dashboard/detail candidate surface

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** Phase 2, Phase 3

---

### [x] TASK-6.2 `[PERF]`

**Nama:** Implementasi Skeleton Screen untuk Semua Komponen

**Deskripsi:** Pastikan semua komponen yang melakukan data fetch memiliki skeleton screen yang sesuai layout, bukan spinner kosong.

**Komponen yang butuh skeleton:**

- [x] `JobCard` → `JobCardSkeleton`
- [x] `ApplicantTable` → `ApplicantTableSkeleton`
- [x] `ProfileForm` → `ProfileSkeleton`
- [x] `ApplicationCard` → `ApplicationCardSkeleton`
- [x] `AIInsightsPanel` → `AIInsightsSkeleton`
- [x] `MatchScoreDetail` → `MatchScoreSkeleton`

**Estimasi:** 3 jam  
**Prioritas:** Medium  
**Dependensi:** Phase 2

---

### TASK-6.3 `[PERF]`

**Nama:** Verifikasi TanStack Query staleTime & gcTime Configuration

**Deskripsi:** Audit semua query untuk memastikan `staleTime` dan `gcTime` sudah dikonfigurasi sesuai PRD.

**Target konfigurasi:**

- [ ] Lowongan publik: `staleTime: 5 * 60 * 1000`
- [ ] Profil user: `staleTime: 2 * 60 * 1000`
- [ ] Status lamaran (real-time): `staleTime: 0`
- [ ] AI insights cache: `staleTime: 10 * 60 * 1000`
- [ ] `gcTime`: minimum `2x staleTime` agar tidak terlalu sering refetch

**Estimasi:** 2 jam  
**Prioritas:** Medium  
**Dependensi:** Phase 2, Phase 4

---

### [x] TASK-6.4 `[PERF]`

**Nama:** Verifikasi Cleanup Supabase Realtime Subscriptions

**Deskripsi:** Audit semua komponen yang menggunakan Supabase Realtime untuk memastikan subscription di-cleanup saat unmount.

**Pattern yang benar:**

```typescript
useEffect(() => {
  const channel = supabase
    .channel('applications')
    .on('postgres_changes', { ... }, handler)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Checklist:**

- [x] `useApplicationsRealtime.ts`
- [x] `useApplicantsRealtime.ts`
- [x] Semua hook custom yang menggunakan `.channel()`

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-2.5, TASK-2.8

---

### TASK-6.5 `[PERF]`

**Nama:** Implementasi Prefetching dengan TanStack Router Loader

**Deskripsi:** Pastikan TanStack Router `loader` digunakan untuk prefetch data sebelum halaman dirender (tidak ada loading spinner saat navigasi).

**Halaman yang harus punya loader:**

- [ ] `/` — prefetch daftar lowongan (10 pertama)
- [ ] `/jobs/$jobId` — prefetch detail lowongan
- [ ] `/dashboard/jobs` — prefetch daftar lowongan HR
- [ ] `/dashboard/jobs/$jobId/applicants` — prefetch daftar pelamar
- [ ] `/profile` — prefetch profil user

**Estimasi:** 4 jam  
**Prioritas:** Medium  
**Dependensi:** Phase 2

---

## Phase 7: Testing & Security Hardening

> **Tujuan:** Verifikasi semua fitur berjalan sesuai acceptance criteria, keamanan sudah solid, dan ready untuk production.

---

### TASK-7.1 `[SECURITY]`

**Nama:** Audit & Test Row Level Security (RLS)

**Deskripsi:** Test semua RLS policies secara sistematis menggunakan Supabase SQL Editor dengan user yang berbeda. Pastikan tidak ada data yang ter-expose tanpa izin.

**Test cases yang harus dijalankan:**

- [ ] Anonymous user tidak bisa membaca draft lowongan
- [ ] Job seeker A tidak bisa membaca profil job seeker B
- [ ] Job seeker tidak bisa membaca lamaran orang lain
- [ ] HR tidak bisa membaca lowongan milik HR lain
- [ ] HR tidak bisa membaca pelamar dari lowongan orang lain
- [ ] Service role bisa mengupdate `ai_match_score` (via Edge Function)
- [ ] Anon user tidak bisa insert ke `applications`

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** Phase 1

---

### [~] TASK-7.2 `[SECURITY]`

**Nama:** Test & Validasi Rate Limiting di Semua Edge Functions

**Deskripsi:** Verifikasi rate limiting berfungsi di setiap Edge Function. Test dengan mengirim request melebihi batas.

**Test per function:**

- [ ] `parse-cv`: >10 request dalam 1 jam → harus return 429
- [ ] `match-cv`: >50 request dalam 1 jam → 429
- [ ] `generate-cover-letter`: >20 request dalam 1 hari → 429
- [ ] `generate-interview-questions`: >30/hari → 429
- [ ] `generate-job-description`: >20/hari → 429
- [ ] `generate-candidate-insights`: >10/jam → 429
- [ ] `career-advisor`: >15/hari → 429
- [ ] `analyze-skill-gap`: >20/hari → 429

**Response format untuk 429:**

```json
{
  "error": "rate_limit_exceeded",
  "message": "Batas penggunaan tercapai. Coba lagi dalam X menit.",
  "retry_after": 3600
}
```

**Estimasi:** 3 jam  
**Prioritas:** High  
**Dependensi:** Phase 3, Phase 4

---

### TASK-7.3 `[SECURITY]`

**Nama:** Test Validasi File Upload (Edge Function `parse-cv`)

**Deskripsi:** Verifikasi validasi file dilakukan di server-side Edge Function.

**Test cases:**

- [ ] Upload file > 5MB → ditolak dengan pesan jelas
- [ ] Upload file bukan PDF/DOCX (misal: `.exe`, `.jpg`) → ditolak
- [ ] Upload PDF yang valid → diproses
- [ ] Upload DOCX yang valid → diproses
- [ ] File kosong / corrupt → ditolak dengan error yang informatif

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-3.1

---

### TASK-7.4 `[SECURITY]`

**Nama:** Verifikasi CSP Headers di Vercel

**Deskripsi:** Verifikasi Content Security Policy aktif dan tidak memblokir resource yang dibutuhkan aplikasi.

**Test:**

1. Buka aplikasi di production URL
2. Buka DevTools → Network → pilih request ke halaman → lihat Response Headers
3. Verifikasi `Content-Security-Policy` header ada dan benar
4. Buka Console → cek tidak ada CSP violation errors
5. Pastikan Supabase realtime (WebSocket), fonts, dan static assets tidak diblokir

**Iterasi:** Sesuaikan CSP di `vercel.json` jika ada legitimate resource yang diblokir.

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-5.1, TASK-5.8

---

### TASK-7.5 `[SECURITY]`

**Nama:** Verifikasi Route Protection & RBAC

**Deskripsi:** Test bahwa semua route terlindungi benar dan tidak bisa diakses oleh role yang salah.

**Test cases:**

- [ ] Akses `/dashboard` tanpa login → redirect ke login
- [ ] Login sebagai job_seeker → akses `/dashboard` → redirect (akses ditolak)
- [ ] Login sebagai hr_recruiter → akses `/profile` (job seeker only) → redirect
- [ ] Token expired → semua authenticated routes redirect ke login
- [ ] Manipulasi cookie/localStorage session → request tetap ditolak oleh RLS

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** TASK-1.6

---

### TASK-7.6 `[FE]`

**Nama:** End-to-End Flow Testing — Job Seeker Journey

**Deskripsi:** Test end-to-end alur lengkap job seeker secara manual.

**Checklist E2E:**

- [ ] Register akun baru sebagai job_seeker
- [ ] Upload CV → AI parsing otomatis mengisi profil
- [ ] Edit profil dan simpan
- [ ] Browse daftar lowongan
- [ ] Gunakan filter dan pencarian
- [ ] Buka detail lowongan
- [ ] Klik "Lamar Sekarang" → muncul flow lamaran
- [ ] Generate cover letter dengan AI (pilih bahasa ID dan EN)
- [ ] Edit cover letter dan submit lamaran
- [ ] Lihat riwayat lamaran → status "applied" muncul
- [ ] Buka halaman profil → akses Career Path Advisor
- [ ] Kirim pertanyaan karir → respons streaming muncul
- [ ] Kembali ke detail lowongan → klik "Analisis Skill Gap"
- [ ] Lihat hasil skill gap dengan badge berwarna

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** Phase 2, Phase 4

---

### TASK-7.7 `[FE]`

**Nama:** End-to-End Flow Testing — HR Rekruter Journey

**Deskripsi:** Test end-to-end alur lengkap HR rekruter.

**Checklist E2E:**

- [ ] Register akun baru sebagai hr_recruiter
- [ ] Buka dashboard HR
- [ ] Buat lowongan baru dengan klik "Generate dengan AI" terlebih dahulu
- [ ] Publish lowongan (set status active)
- [ ] Verifikasi lowongan muncul di halaman publik
- [ ] Login sebagai job_seeker di tab berbeda → lamar lowongan tersebut
- [ ] Kembali ke HR → pelamar baru muncul real-time di tabel
- [ ] Lihat AI match score (tunggu hingga selesai atau trigger manual)
- [ ] Buka detail pelamar → lihat profil lengkap
- [ ] Generate pertanyaan interview (pilih level seniority)
- [ ] Simpan pertanyaan → muncul di halaman detail pelamar
- [ ] Ubah status pelamar → optimistic update berjalan
- [ ] Lihat AI Insights panel
- [ ] Edit dan hapus (soft delete) lowongan

**Estimasi:** 4 jam  
**Prioritas:** High  
**Dependensi:** Phase 2, Phase 4

---

### TASK-7.8 `[PERF]`

**Nama:** Performance Audit (Lighthouse)

**Deskripsi:** Jalankan Lighthouse audit di production URL dan pastikan skor memenuhi target.

**Target minimum:**

- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90 (untuk halaman publik)

**Halaman yang di-audit:**

- [ ] Halaman utama (daftar lowongan)
- [ ] Halaman detail lowongan

**Tindakan jika skor rendah:**

- LCP tinggi → cek SSR sudah berjalan, periksa image lazy loading
- CLS → periksa skeleton screen sudah sesuai dimensi konten
- Bundle size besar → periksa code splitting Vite

**Estimasi:** 2 jam  
**Prioritas:** Medium  
**Dependensi:** Phase 5, Phase 6

---

### TASK-7.9 `[FE]`

**Nama:** Test AI Error Fallbacks

**Deskripsi:** Verifikasi semua fitur AI memiliki error fallback yang elegan dan tidak mengcrash aplikasi.

**Test:**

- [ ] Simulate AI timeout (60 detik) → `AIErrorFallback` ditampilkan
- [ ] Simulate AI response error → toast error muncul via Sonner
- [ ] Setelah error → tombol "Coba Lagi" berfungsi
- [ ] Fitur non-AI tetap berjalan normal saat AI down
- [ ] Rate limit tercapai → `RateLimitWarning` ditampilkan dengan waktu reset

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** Phase 4

---

### [~] TASK-7.10 `[SECURITY]`

**Nama:** Final Security Checklist Pre-Launch

**Deskripsi:** Checklist akhir keamanan sebelum launch ke public.

**Checklist:**

- [ ] Tidak ada `console.log` yang mencetak data sensitif (token, key, data user)
- [x] Tidak ada `select('*')` di production queries
- [x] Semua `.env` values yang sensitif tidak ada di kode yang di-commit
- [x] `bun.lock` di-commit ke repo
- [x] `.env` ada di `.gitignore` (cek `.gitignore` di repo)
- [ ] AI API Key hanya ada di Supabase Secrets
- [ ] Service Role Key hanya ada di Supabase Secrets
- [ ] Semua Edge Functions mengembalikan CORS headers yang ketat
- [x] Storage bucket `cvs` berstatus private (bukan public)
- [ ] Tidak ada direct URL ke file CV (semua via signed URL)
- [ ] RLS aktif di semua tabel (cek via Supabase Dashboard → Table Editor)

**Estimasi:** 2 jam  
**Prioritas:** High  
**Dependensi:** Semua phase sebelumnya

---

## Dependency Graph (Ringkasan)

```
Phase 1 (Foundation)
  └── Phase 2 (Core Features)
        └── Phase 3 (AI Core)
              └── Phase 4 (AI Value-Add)
                    └── Phase 5 (Deployment) ← parallel dengan Phase 4
                          └── Phase 6 (Performance)
                                └── Phase 7 (Testing & Hardening)
```

Phase 5 (Deployment) dapat dimulai segera setelah Phase 2 selesai, paralel dengan Phase 3 & 4, agar testing di environment Vercel bisa dilakukan lebih awal.

---

## Ringkasan Task per Kategori

| Kategori     | Jumlah Task |
| ------------ | ----------- |
| `[SECURITY]` | 18 task     |
| `[PERF]`     | 12 task     |
| `[AI]`       | 14 task     |
| `[DEPLOY]`   | 8 task      |
| `[DB]`       | 7 task      |
| `[FE]`       | 20 task     |

_Catatan: beberapa task memiliki multiple label._
