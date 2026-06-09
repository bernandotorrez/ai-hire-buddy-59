# PRD — Product Requirements Document
# AI Hire Buddy

**Versi:** 1.0.0  
**Tanggal:** 2026-06-09  
**Status:** Draft  
**Repo:** https://github.com/bernandotorrez/ai-hire-buddy-59

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Skema Database Supabase](#7-skema-database-supabase)
8. [Definisi Edge Functions](#8-definisi-edge-functions)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Security Requirements](#10-security-requirements)
11. [Performance Requirements](#11-performance-requirements)

---

## 1. Executive Summary

**AI Hire Buddy** adalah platform web rekrutmen berbasis AI yang menghubungkan pencari kerja (*job seeker*) dengan perusahaan/rekruter. Platform ini melampaui job board konvensional dengan mengintegrasikan AI (provider: `ai.sumopod.com`, model: `gemini/gemini-2.5-flash-lite`) untuk mengotomatiskan dan meningkatkan kualitas setiap tahapan proses rekrutmen — mulai dari parsing CV, matching kandidat, pembuatan cover letter, hingga analisis karir personal.

**Tech Stack utama:** TanStack Start (SSR) + React 19 + Vite 7, Bun, Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime), Tailwind v4, shadcn/ui new-york style dengan slate base, deployment ke Vercel dengan Nitro preset.

**Target pasar:** Individu pencari kerja dan tim HR/rekruter perusahaan di Indonesia, dengan dukungan konten bilingual (Bahasa Indonesia & Inggris).

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Membangun platform rekrutmen yang terdiferensiasi secara AI — bukan sekadar job board statis.
- Mempercepat proses seleksi kandidat untuk rekruter hingga 60%.
- Meningkatkan kualitas lamaran yang masuk melalui profil terstruktur berbasis AI.
- Memberikan nilai tambah nyata kepada job seeker melalui insight karir personal.

### 2.2 Success Metrics (KPI)

| Metrik | Target (3 bulan post-launch) |
|--------|------------------------------|
| Registered Job Seeker | ≥ 500 pengguna |
| Registered HR/Rekruter | ≥ 50 akun |
| Lowongan Aktif | ≥ 100 |
| CV di-parse via AI | ≥ 300 |
| AI Match Score digunakan HR | ≥ 80% dari total pelamar |
| Cover Letter di-generate AI | ≥ 150 |
| Skill Gap Analysis digunakan | ≥ 200 sesi |
| Waktu rata-rata HR screening per kandidat | Turun ≥ 40% vs manual |
| Uptime platform | ≥ 99.5% |
| Error rate (5xx) | < 0.5% |

---

## 3. User Personas

### Persona 1: Job Seeker — "Dinda, Fresh Graduate"

- **Usia:** 22 tahun
- **Latar belakang:** Lulusan Teknik Informatika, mencari pekerjaan pertama
- **Tujuan:** Menemukan lowongan relevan, membuat lamaran yang menarik, memahami gap skill-nya
- **Pain points:** Tidak tahu cara membuat CV dan cover letter yang menarik, bingung skill apa yang kurang, lamarannya sering tidak dapat balasan
- **Kebutuhan utama:** Parsing CV otomatis, AI cover letter generator, skill gap analyzer, career path advisor

### Persona 2: Job Seeker — "Rendi, Mid-Level Professional"

- **Usia:** 28 tahun
- **Latar belakang:** 4 tahun di bidang marketing, ingin transisi ke product management
- **Tujuan:** Pivot karir, memahami apa yang perlu disiapkan, menemukan lowongan yang pas
- **Pain points:** Tidak yakin CV-nya cukup relevan untuk posisi baru, butuh panduan transisi karir
- **Kebutuhan utama:** Career Path Advisor AI, Skill Gap Analyzer, Profil yang mudah diupdate

### Persona 3: HR Rekruter — "Sari, HR Manager Startup"

- **Usia:** 31 tahun
- **Latar belakang:** HR generalist di startup teknologi, mengelola rekrutmen sendirian
- **Tujuan:** Screening kandidat cepat, membuat job description yang bagus, menemukan kandidat terbaik dari tumpukan lamaran
- **Pain points:** Terlalu banyak waktu dihabiskan membaca CV satu per satu, job description memakan waktu lama, sulit memprioritaskan kandidat
- **Kebutuhan utama:** AI Match Score, AI Job Description Generator, AI Interview Questions, Candidate Insights & Talent Analytics

---

## 4. User Stories

### 4.1 Job Seeker — Fitur Inti

**US-JS-01:** Sebagai job seeker, saya ingin melihat daftar semua lowongan aktif tanpa harus login, agar saya bisa mengeksplorasi peluang kerja yang tersedia.

**US-JS-02:** Sebagai job seeker, saya ingin memfilter lowongan berdasarkan posisi, lokasi, dan tipe pekerjaan (full-time/part-time/remote), agar saya dapat menemukan lowongan yang paling relevan dengan lebih cepat.

**US-JS-03:** Sebagai job seeker, saya ingin mencari lowongan dengan kata kunci bebas, agar saya bisa menemukan peluang spesifik yang saya cari.

**US-JS-04:** Sebagai job seeker, saya ingin melihat detail lengkap sebuah lowongan (deskripsi, kualifikasi, gaji, batas waktu), agar saya dapat membuat keputusan yang terinformasi sebelum melamar.

**US-JS-05:** Sebagai job seeker yang sudah login, saya ingin mengklik tombol "Lamar Sekarang" di halaman detail lowongan, agar saya bisa mengajukan lamaran secara langsung.

**US-JS-06:** Sebagai job seeker, saya ingin membuat profil saya dengan mengupload file CV (PDF/DOCX), agar AI dapat secara otomatis mengisi data profil saya tanpa harus input manual.

**US-JS-07:** Sebagai job seeker, saya ingin mengedit hasil parsing CV dari AI sebelum menyimpan profil saya, agar saya bisa memastikan informasi yang tersimpan akurat.

**US-JS-08:** Sebagai job seeker, saya ingin melihat riwayat semua lamaran yang saya kirimkan beserta statusnya saat ini, agar saya dapat memantau perkembangan lamaran saya.

**US-JS-09:** Sebagai job seeker, saya ingin menerima notifikasi real-time ketika status lamaran saya berubah, agar saya tidak perlu terus-menerus me-refresh halaman.

### 4.2 Job Seeker — Fitur AI

**US-AI-C1-01:** Sebagai job seeker, saya ingin sistem menawarkan opsi "Buat Cover Letter dengan AI" saat saya hendak melamar sebuah lowongan, agar saya bisa mendapatkan cover letter yang dipersonalisasi tanpa harus menulis dari nol.

**US-AI-C1-02:** Sebagai job seeker, saya ingin memilih bahasa cover letter yang dihasilkan AI (Bahasa Indonesia atau Inggris), agar cover letter yang dihasilkan sesuai dengan kebutuhan perusahaan yang dilamar.

**US-AI-C1-03:** Sebagai job seeker, saya ingin bisa mengedit cover letter hasil AI sebelum melampirkannya ke lamaran, agar saya bisa menyesuaikannya dengan gaya dan nada yang saya inginkan.

**US-AI-C5-01:** Sebagai job seeker, saya ingin mengakses fitur "Konsultasi Karir AI" dari halaman profil, agar saya bisa mendapatkan saran karir yang dipersonalisasi berdasarkan profil saya.

**US-AI-C5-02:** Sebagai job seeker, saya ingin jawaban AI muncul secara streaming (bertahap), agar saya tidak menunggu blank terlalu lama.

**US-AI-C5-03:** Sebagai job seeker, saya ingin AI merekomendasikan lowongan aktif yang relevan berdasarkan tujuan karir saya, agar saya bisa langsung mengambil tindakan dari saran yang diberikan.

**US-AI-C5-04:** Sebagai job seeker, saya ingin melihat histori konsultasi karir saya (maksimal 10 entri terakhir), agar saya bisa melacak perkembangan perencanaan karir saya.

**US-AI-C6-01:** Sebagai job seeker, saya ingin memilih sebuah lowongan aktif dan klik "Analisis Skill Gap", agar saya bisa mengetahui secara spesifik skill apa yang saya miliki dan yang masih kurang untuk posisi tersebut.

**US-AI-C6-02:** Sebagai job seeker, saya ingin melihat estimasi waktu belajar dan rekomendasi tipe resource untuk menutup setiap skill gap, agar saya memiliki roadmap belajar yang konkret.

### 4.3 HR Rekruter — Fitur Inti

**US-HR-01:** Sebagai rekruter, saya ingin membuat lowongan pekerjaan baru dengan semua field yang relevan (judul, deskripsi, kualifikasi, lokasi, tipe, gaji, batas tanggal), agar informasi lowongan yang ditampilkan kepada kandidat lengkap dan profesional.

**US-HR-02:** Sebagai rekruter, saya ingin mengedit dan menghapus lowongan yang saya buat, agar saya dapat menjaga data lowongan tetap akurat.

**US-HR-03:** Sebagai rekruter, saya ingin mengatur status lowongan (aktif/draft/ditutup), agar hanya lowongan yang relevan yang tampil kepada kandidat.

**US-HR-04:** Sebagai rekruter, saya ingin melihat semua pelamar yang masuk untuk setiap lowongan dalam bentuk tabel, agar saya bisa mengelola proses seleksi secara sistematis.

**US-HR-05:** Sebagai rekruter, saya ingin memfilter dan mengurutkan pelamar berdasarkan status, AI match score, dan tanggal melamar, agar saya bisa memprioritaskan kandidat yang paling relevan.

**US-HR-06:** Sebagai rekruter, saya ingin mengklik nama pelamar untuk melihat detail profil lengkap dan CV mereka, agar saya bisa melakukan penilaian yang komprehensif.

**US-HR-07:** Sebagai rekruter, saya ingin mengubah status pelamar (Applied → Reviewed → Interviewed → Accepted / Rejected), agar semua anggota tim mengetahui posisi terkini setiap kandidat.

**US-HR-08:** Sebagai rekruter, saya ingin melihat timestamp setiap perubahan status pelamar, agar ada audit trail yang transparan untuk proses rekrutmen.

**US-HR-09:** Sebagai rekruter, saya ingin melihat notifikasi real-time ketika ada pelamar baru yang masuk, agar saya bisa merespons pelamar lebih cepat.

### 4.4 HR Rekruter — Fitur AI

**US-AI-C2-01:** Sebagai rekruter, saya ingin men-generate daftar pertanyaan interview yang relevan berdasarkan deskripsi posisi dan profil kandidat yang sedang saya seleksi, agar saya bisa mempersiapkan sesi interview yang lebih terarah.

**US-AI-C2-02:** Sebagai rekruter, saya ingin memilih level seniority (junior/mid/senior) saat men-generate pertanyaan interview, agar pertanyaan yang dihasilkan sesuai dengan ekspektasi level tersebut.

**US-AI-C2-03:** Sebagai rekruter, saya ingin menyimpan daftar pertanyaan interview sebagai catatan internal per kandidat, agar saya bisa menggunakannya kembali saat sesi interview berlangsung.

**US-AI-C3-01:** Sebagai rekruter, saya ingin mengklik tombol "Generate dengan AI" di form buat lowongan setelah mengisi nama posisi, departemen, dan level seniority, agar saya bisa mendapatkan draf deskripsi pekerjaan yang lengkap tanpa menulis dari nol.

**US-AI-C3-02:** Sebagai rekruter, saya ingin langsung menggunakan output AI sebagai template dan mengeditnya di form buat lowongan, agar alur kerja pembuatan lowongan menjadi lebih efisien.

**US-AI-C4-01:** Sebagai rekruter, saya ingin melihat panel "AI Insights" di dashboard pelamar yang berisi ringkasan pool pelamar saat ini, agar saya bisa memahami gambaran umum talent pool secara cepat.

**US-AI-C4-02:** Sebagai rekruter, saya ingin melihat rekomendasi shortlist kandidat terbaik dan identifikasi "hidden gem" dari AI, agar saya bisa mengambil keputusan seleksi yang lebih cerdas.

**US-AI-MATCH-01:** Sebagai rekruter, saya ingin setiap pelamar memiliki AI Match Score yang dihitung secara otomatis, agar saya bisa memprioritaskan review kandidat berdasarkan relevansi.

**US-AI-MATCH-02:** Sebagai rekruter, saya ingin melihat ringkasan alasan AI (kelebihan & kekurangan kandidat) di samping skor match, agar saya memahami konteks di balik angka persentase.

**US-AI-MATCH-03:** Sebagai rekruter, saya ingin men-trigger ulang proses matching secara manual untuk kandidat tertentu, agar saya bisa mendapatkan skor yang diperbarui jika profil kandidat berubah.

---

## 5. Functional Requirements

### FR-A1: Halaman Utama (Daftar Lowongan)

- **FR-A1.1:** Sistem menampilkan semua lowongan berstatus `active` tanpa autentikasi.
- **FR-A1.2:** Sistem menyediakan filter berdasarkan: `position` (teks bebas), `location` (dropdown), `job_type` (full-time / part-time / remote / contract).
- **FR-A1.3:** Sistem menyediakan fitur pencarian full-text berdasarkan judul dan deskripsi lowongan.
- **FR-A1.4:** Halaman di-render via SSR (TanStack Start) untuk SEO dan FCP yang optimal.
- **FR-A1.5:** Data lowongan di-paginate dengan cursor-based pagination, 10 item per halaman.
- **FR-A1.6:** Halaman memiliki `staleTime: 5 * 60 * 1000` di TanStack Query.

### FR-A2: Halaman Detail Lowongan

- **FR-A2.1:** Halaman menampilkan: judul posisi, nama perusahaan, lokasi, tipe pekerjaan, rentang gaji, batas tanggal lamaran, deskripsi lengkap, dan kualifikasi.
- **FR-A2.2:** Tombol "Lamar Sekarang" hanya aktif (dapat diklik) jika user sudah login.
- **FR-A2.3:** Jika user belum login, klik tombol "Lamar Sekarang" mengarahkan ke halaman login.
- **FR-A2.4:** Jika user sudah melamar lowongan ini sebelumnya, tombol berubah menjadi "Sudah Dilamar" (disabled).
- **FR-A2.5:** Tersedia tombol "Analisis Skill Gap" (Fitur C6) bagi user yang sudah login dan memiliki profil lengkap.
- **FR-A2.6:** Halaman di-render via SSR untuk SEO.

### FR-A3: Profil Job Seeker

- **FR-A3.1:** User dapat mengisi profil secara manual: nama lengkap, email, nomor telepon, ringkasan profil, pendidikan (multiple entries), pengalaman kerja (multiple entries), skills (tags), link portofolio/LinkedIn.
- **FR-A3.2:** User dapat mengupload CV dalam format PDF atau DOCX (max 5MB).
- **FR-A3.3:** Setelah upload, sistem memanggil Edge Function `parse-cv` yang mengekstrak data menggunakan AI.
- **FR-A3.4:** Hasil parsing AI ditampilkan dalam form yang dapat diedit oleh user.
- **FR-A3.5:** User dapat menyimpan profil setelah mengedit hasil parsing.
- **FR-A3.6:** File CV disimpan di Supabase Storage menggunakan signed URL (bukan public URL permanen).
- **FR-A3.7:** Profil dilindungi RLS — hanya user yang bersangkutan yang dapat membaca dan mengubahnya.

### FR-A4: Riwayat Lamaran

- **FR-A4.1:** Halaman menampilkan semua lamaran yang dikirimkan user, diurutkan berdasarkan tanggal terbaru.
- **FR-A4.2:** Setiap item menampilkan: judul posisi, nama perusahaan, tanggal melamar, dan status saat ini.
- **FR-A4.3:** Status ditampilkan dengan badge berwarna: Applied (abu), Reviewed (biru), Interviewed (kuning), Accepted (hijau), Rejected (merah).
- **FR-A4.4:** Update status ditampilkan secara real-time via Supabase Realtime tanpa refresh.
- **FR-A4.5:** Klik item membuka detail lamaran, termasuk cover letter (jika ada) yang dilampirkan.

### FR-B1: Manajemen Lowongan (HR Dashboard)

- **FR-B1.1:** Rekruter dapat membuat lowongan dengan field: `title`, `description`, `requirements`, `location`, `job_type`, `salary_min`, `salary_max`, `deadline`, `status`, `department`.
- **FR-B1.2:** Rekruter dapat mengedit semua field lowongan yang pernah dibuat.
- **FR-B1.3:** Rekruter dapat mengubah status lowongan (active / draft / closed).
- **FR-B1.4:** Rekruter dapat menghapus (soft delete) lowongan.
- **FR-B1.5:** Lowongan berstatus `active` otomatis tampil di halaman publik.
- **FR-B1.6:** Rekruter hanya dapat melihat dan mengelola lowongan yang dibuatnya sendiri (atau dalam organisasinya — tergantung implementasi multi-company).

### FR-B2: Dashboard Pelamar (Applicant Tracker)

- **FR-B2.1:** Rekruter melihat daftar pelamar dalam bentuk tabel dengan kolom: nama, posisi dilamar, tanggal melamar, status, AI match score.
- **FR-B2.2:** Tabel mendukung filter berdasarkan: lowongan, status lamaran.
- **FR-B2.3:** Tabel mendukung sorting berdasarkan: tanggal melamar, AI match score.
- **FR-B2.4:** Klik baris membuka halaman detail pelamar.
- **FR-B2.5:** Halaman detail pelamar menampilkan: profil lengkap, link CV (signed URL), AI match score dan ringkasannya, riwayat perubahan status, tombol aksi AI (C2: interview questions).
- **FR-B2.6:** Data pelamar baru masuk secara real-time via Supabase Realtime.

### FR-B3: AI CV Matching

- **FR-B3.1:** Saat pelamar submit lamaran, sistem secara otomatis men-trigger Edge Function `match-cv` di background.
- **FR-B3.2:** Edge Function menghitung match score (0-100%) antara profil kandidat dan deskripsi lowongan.
- **FR-B3.3:** Hasil disimpan ke kolom `ai_match_score` dan `ai_match_summary` di tabel `applications`.
- **FR-B3.4:** Score ditampilkan sebagai badge persentase di tabel pelamar dan halaman detail.
- **FR-B3.5:** Rekruter dapat klik tombol "Hitung Ulang" untuk men-trigger matching kembali secara manual.
- **FR-B3.6:** Selama matching berjalan, ditampilkan spinner "Menganalisis..." dan tombol "Hitung Ulang" di-disable.

### FR-B4: Manajemen Status Lamaran

- **FR-B4.1:** Rekruter dapat mengubah status lamaran dari dropdown di halaman detail pelamar.
- **FR-B4.2:** Status yang tersedia: `applied` → `reviewed` → `interviewed` → `accepted` / `rejected`.
- **FR-B4.3:** Setiap perubahan status dicatat di tabel `application_status_logs` dengan timestamp.
- **FR-B4.4:** Perubahan status langsung terrefleksi di UI rekruter secara optimistic update.
- **FR-B4.5:** Job seeker menerima update real-time via Supabase Realtime subscription.

### FR-C1: AI Cover Letter Generator

- **FR-C1.1:** Tersedia opsi "Buat Cover Letter dengan AI" saat flow melamar lowongan.
- **FR-C1.2:** User memilih bahasa output: `id` (Bahasa Indonesia) atau `en` (Inggris).
- **FR-C1.3:** Edge Function `generate-cover-letter` dipanggil dengan: profil kandidat (dari DB) + deskripsi lowongan + pilihan bahasa.
- **FR-C1.4:** Output AI muncul secara streaming (SSE) agar tidak terasa blank.
- **FR-C1.5:** User dapat mengedit teks cover letter sebelum menyimpan.
- **FR-C1.6:** Cover letter tersimpan ke tabel `cover_letters` dan ter-link ke lamaran.
- **FR-C1.7:** HR dapat membaca cover letter kandidat di halaman detail pelamar.
- **FR-C1.8:** Jika AI gagal merespons, ditampilkan error toast via Sonner dan user bisa mencoba lagi.

### FR-C2: AI Interview Question Generator

- **FR-C2.1:** Tersedia tombol "Generate Pertanyaan Interview" di halaman detail pelamar (HR only).
- **FR-C2.2:** HR memilih level seniority: `junior`, `mid`, `senior`.
- **FR-C2.3:** Edge Function `generate-interview-questions` dipanggil dengan: deskripsi posisi + profil kandidat + level.
- **FR-C2.4:** Output: 10-15 pertanyaan, dibagi per kategori (technical, behavioral, situational).
- **FR-C2.5:** HR dapat menyimpan daftar pertanyaan sebagai catatan internal per kandidat di tabel `interview_questions`.
- **FR-C2.6:** Progress indicator ditampilkan selama proses berlangsung.

### FR-C3: AI Job Description Generator

- **FR-C3.1:** Tersedia tombol "Generate dengan AI" di form buat/edit lowongan (HR only).
- **FR-C3.2:** Input minimal yang diperlukan: nama posisi, departemen, level seniority.
- **FR-C3.3:** Edge Function `generate-job-description` dipanggil dengan input tersebut.
- **FR-C3.4:** Output: deskripsi pekerjaan lengkap mencakup ringkasan posisi, tanggung jawab, kualifikasi wajib, kualifikasi tambahan, dan benefit.
- **FR-C3.5:** Output langsung mengisi form buat lowongan dan dapat diedit.
- **FR-C3.6:** Progress indicator ditampilkan selama generasi berlangsung.

### FR-C4: AI Candidate Insights & Talent Analytics

- **FR-C4.1:** Panel "AI Insights" tersedia di bagian atas dashboard pelamar (HR only).
- **FR-C4.2:** Panel menampilkan: ringkasan skill yang paling umum dimiliki, rata-rata pengalaman, distribusi lokasi, rekomendasi shortlist, identifikasi "hidden gem".
- **FR-C4.3:** Edge Function `generate-candidate-insights` dipanggil untuk menghasilkan narasi.
- **FR-C4.4:** Hasil di-cache di tabel `ai_insights_cache` dengan kolom `updated_at`.
- **FR-C4.5:** Cache diperbarui otomatis setiap ada pelamar baru masuk (trigger via Supabase webhook atau sisi Edge Function).
- **FR-C4.6:** `staleTime` untuk cache insights: `10 * 60 * 1000` (10 menit) di TanStack Query.
- **FR-C4.7:** Tampilan berupa teks narasi ringkas, bukan chart statis.

### FR-C5: AI Career Path Advisor

- **FR-C5.1:** Tersedia tombol/link "Konsultasi Karir AI" di halaman profil job seeker.
- **FR-C5.2:** UI berbentuk chat sederhana: satu input pertanyaan, tombol kirim, area respons.
- **FR-C5.3:** Edge Function `career-advisor` dipanggil dengan: profil user (dari DB) + pertanyaan user.
- **FR-C5.4:** Respons AI muncul secara streaming (SSE).
- **FR-C5.5:** AI merekomendasikan lowongan aktif di platform yang relevan dengan tujuan karir user (disertakan dalam prompt ke AI bersama data lowongan aktif).
- **FR-C5.6:** Histori konsultasi disimpan ke tabel `ai_career_consultations`, maks 10 entri per user (entri terlama dihapus otomatis jika melebihi batas).
- **FR-C5.7:** Jika AI gagal, Sonner toast error ditampilkan dan user bisa kirim ulang pertanyaan.

### FR-C6: AI Skill Gap Analyzer

- **FR-C6.1:** Tersedia tombol "Analisis Skill Gap" di halaman detail lowongan (untuk user yang sudah login dan memiliki profil).
- **FR-C6.2:** Edge Function `analyze-skill-gap` dipanggil dengan: profil kandidat + deskripsi lowongan.
- **FR-C6.3:** Output mencakup: daftar skill yang dimiliki dan relevan, daftar skill gap, estimasi waktu belajar per gap, rekomendasi tipe resource.
- **FR-C6.4:** Skill ditampilkan menggunakan komponen `Badge` dari shadcn/ui dengan warna berbeda untuk "dimiliki" (hijau) vs "gap" (oranye/merah).
- **FR-C6.5:** Hasil ditampilkan dalam modal atau panel yang expandable.
- **FR-C6.6:** Progress indicator ditampilkan selama analisis berlangsung.

---

## 6. Non-Functional Requirements

### NFR-1: Performa

- **NFR-1.1:** First Contentful Paint (FCP) halaman publik ≤ 1.5 detik di koneksi 4G.
- **NFR-1.2:** Time to Interactive (TTI) ≤ 3 detik untuk halaman publik.
- **NFR-1.3:** Response time API (non-AI) ≤ 500ms untuk operasi CRUD standar.
- **NFR-1.4:** Operasi AI (Edge Functions) memiliki timeout maksimum 60 detik.
- **NFR-1.5:** Ukuran bundle JS initial chunk ≤ 250KB (setelah gzip/brotli).

### NFR-2: Keamanan

- **NFR-2.1:** Semua data sensitif dienkripsi in-transit menggunakan HTTPS/TLS 1.3.
- **NFR-2.2:** AI API Key tidak pernah ter-expose di sisi client (hanya ada di Supabase Secrets).
- **NFR-2.3:** RLS aktif di semua tabel Supabase tanpa pengecualian.
- **NFR-2.4:** Semua Edge Functions memvalidasi JWT sebelum memproses request.
- **NFR-2.5:** File upload divalidasi server-side: max 5MB, hanya PDF/DOCX.
- **NFR-2.6:** Rate limiting diimplementasi di setiap AI Edge Function.

### NFR-3: Skalabilitas

- **NFR-3.1:** Arsitektur serverless (Vercel + Supabase Edge Functions) memungkinkan auto-scaling.
- **NFR-3.2:** Database menggunakan index yang optimal untuk mendukung pertumbuhan data hingga 1 juta records tanpa degradasi performa signifikan.
- **NFR-3.3:** Cursor-based pagination digunakan untuk semua list view agar performa tetap konsisten.

### NFR-4: Aksesibilitas

- **NFR-4.1:** Semua komponen interaktif dapat dioperasikan via keyboard.
- **NFR-4.2:** Komponen Radix UI (yang sudah ada di repo) digunakan untuk aksesibilitas built-in (ARIA roles, focus management).
- **NFR-4.3:** Kontras warna minimum memenuhi WCAG 2.1 level AA.

### NFR-5: Ketersediaan

- **NFR-5.1:** Target uptime 99.5% (diukur monthly).
- **NFR-5.2:** Platform tetap dapat digunakan (degraded mode) meskipun layanan AI sedang down — fitur non-AI tetap berjalan normal.

---

## 7. Skema Database Supabase

### 7.1 Tabel: `profiles`

Menyimpan data profil semua user (job seeker dan HR).

```sql
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('job_seeker', 'hr_recruiter')),
  full_name    TEXT,
  email        TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  -- Job Seeker fields
  headline     TEXT,                        -- ringkasan profil singkat
  summary      TEXT,                        -- deskripsi profil panjang
  skills       TEXT[],                      -- array of skill tags
  portfolio_url TEXT,
  linkedin_url TEXT,
  cv_url       TEXT,                        -- signed URL path di Supabase Storage
  cv_file_name TEXT,
  -- HR fields
  company_name TEXT,
  company_id   UUID REFERENCES companies(id),
  -- Meta
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ                  -- soft delete
);
```

**RLS Policies:**
- `SELECT`: user dapat membaca profil sendiri; HR dapat membaca profil job seeker yang melamar ke lowongannya.
- `INSERT`: user dapat membuat profil untuk dirinya sendiri (`auth.uid() = id`).
- `UPDATE`: user hanya dapat mengupdate profil sendiri.
- Data profil publik (nama, headline) boleh dibaca anyone untuk keperluan tampilan lamaran.

---

### 7.2 Tabel: `companies`

```sql
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  logo_url     TEXT,
  website      TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
```

**RLS Policies:**
- `SELECT`: public read untuk nama dan logo perusahaan (ditampilkan di lowongan).
- `INSERT`/`UPDATE`: hanya HR yang terafiliasi dengan perusahaan tersebut.

---

### 7.3 Tabel: `jobs`

```sql
CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  posted_by     UUID NOT NULL REFERENCES profiles(id),  -- HR yang membuat
  title         TEXT NOT NULL,
  department    TEXT,
  description   TEXT NOT NULL,
  requirements  TEXT NOT NULL,
  location      TEXT NOT NULL,
  job_type      TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'remote', 'contract')),
  seniority     TEXT CHECK (seniority IN ('junior', 'mid', 'senior', 'lead')),
  salary_min    INTEGER,
  salary_max    INTEGER,
  salary_currency TEXT DEFAULT 'IDR',
  deadline      DATE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
```

**RLS Policies:**
- `SELECT (public)`: semua orang dapat membaca lowongan berstatus `active` dan belum di-soft-delete.
- `SELECT (HR)`: HR dapat membaca semua lowongan miliknya termasuk draft dan closed.
- `INSERT`/`UPDATE`/`DELETE`: hanya HR yang membuat lowongan tersebut (`posted_by = auth.uid()`).

---

### 7.4 Tabel: `profile_educations`

```sql
CREATE TABLE profile_educations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution  TEXT NOT NULL,
  degree       TEXT,
  field_of_study TEXT,
  start_year   INTEGER,
  end_year     INTEGER,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies:** user hanya dapat CRUD data pendidikan miliknya sendiri.

---

### 7.5 Tabel: `profile_experiences`

```sql
CREATE TABLE profile_experiences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title    TEXT NOT NULL,
  location     TEXT,
  start_date   DATE,
  end_date     DATE,
  is_current   BOOLEAN DEFAULT FALSE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies:** user hanya dapat CRUD data pengalaman miliknya sendiri.

---

### 7.6 Tabel: `applications`

```sql
CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES jobs(id),
  applicant_id      UUID NOT NULL REFERENCES profiles(id),
  status            TEXT NOT NULL DEFAULT 'applied'
                    CHECK (status IN ('applied', 'reviewed', 'interviewed', 'accepted', 'rejected')),
  ai_match_score    SMALLINT,               -- 0-100
  ai_match_summary  TEXT,                   -- narasi AI tentang kelebihan & kekurangan
  ai_match_status   TEXT DEFAULT 'pending'
                    CHECK (ai_match_status IN ('pending', 'processing', 'completed', 'failed')),
  notes             TEXT,                   -- catatan internal HR
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(job_id, applicant_id)              -- satu kandidat hanya bisa melamar satu posisi sekali
);

-- Indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_ai_match_score ON applications(ai_match_score DESC);
```

**RLS Policies:**
- `SELECT (job seeker)`: job seeker hanya membaca lamaran miliknya sendiri.
- `SELECT (HR)`: HR hanya membaca lamaran untuk lowongan yang dibuatnya.
- `INSERT`: job seeker authenticated dapat membuat lamaran (satu per lowongan).
- `UPDATE`: HR dapat mengupdate `status`, `notes`; sistem dapat mengupdate `ai_match_score` via service role di Edge Function.

---

### 7.7 Tabel: `application_status_logs`

```sql
CREATE TABLE application_status_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  changed_by     UUID NOT NULL REFERENCES profiles(id),
  old_status     TEXT,
  new_status     TEXT NOT NULL,
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies:**
- `SELECT`: job seeker dapat membaca log untuk lamarannya; HR dapat membaca log untuk lamaran di lowongannya.
- `INSERT`: dilakukan via service role di Edge Function saat HR mengubah status.

---

### 7.8 Tabel: `cover_letters`

```sql
CREATE TABLE cover_letters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_id      UUID NOT NULL REFERENCES profiles(id),
  content        TEXT NOT NULL,
  language       TEXT NOT NULL DEFAULT 'id' CHECK (language IN ('id', 'en')),
  is_ai_generated BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies:**
- `SELECT`: job seeker yang membuat dapat membaca; HR yang menerima lamaran tersebut dapat membaca.
- `INSERT`/`UPDATE`: hanya author (job seeker) yang dapat membuat dan mengedit cover letter miliknya.

---

### 7.9 Tabel: `interview_questions`

```sql
CREATE TABLE interview_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  hr_id          UUID NOT NULL REFERENCES profiles(id),
  job_id         UUID NOT NULL REFERENCES jobs(id),
  seniority      TEXT NOT NULL CHECK (seniority IN ('junior', 'mid', 'senior')),
  questions_data JSONB NOT NULL,  -- { technical: [...], behavioral: [...], situational: [...] }
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies:**
- `SELECT`/`INSERT`: hanya HR yang membuat record tersebut (`hr_id = auth.uid()`).

---

### 7.10 Tabel: `ai_career_consultations`

```sql
CREATE TABLE ai_career_consultations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query histori per user
CREATE INDEX idx_ai_career_consultations_user_id ON ai_career_consultations(user_id, created_at DESC);
```

**RLS Policies:**
- `SELECT`/`INSERT`: hanya user yang bersangkutan (`user_id = auth.uid()`).

---

### 7.11 Tabel: `ai_insights_cache`

```sql
CREATE TABLE ai_insights_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  insights    TEXT NOT NULL,   -- narasi AI dalam bentuk teks
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_cache_job_id ON ai_insights_cache(job_id);
CREATE INDEX idx_ai_insights_cache_updated_at ON ai_insights_cache(updated_at DESC);
```

**RLS Policies:**
- `SELECT`: HR yang memiliki lowongan tersebut dapat membaca cache.
- `INSERT`/`UPDATE`/`DELETE`: hanya via service role (Edge Function).

---

### 7.12 Relasi Database (ERD Summary)

```
auth.users (Supabase built-in)
    └──< profiles (1:1, id FK)
           ├──< profile_educations (1:N)
           ├──< profile_experiences (1:N)
           ├──< applications (1:N, applicant_id)
           │      ├──< application_status_logs (1:N)
           │      ├──< cover_letters (1:1)
           │      └──< interview_questions (1:N)
           └──< ai_career_consultations (1:N)

companies
    └──< jobs (1:N, company_id)
           ├──< applications (1:N, job_id)
           └──< ai_insights_cache (1:1, job_id)
```

---

## 8. Definisi Edge Functions

Semua Edge Functions dipanggil via `supabase.functions.invoke()` dari frontend atau via HTTP dari internal. Setiap function **wajib**: validasi JWT, validasi input dengan Zod, rate limiting per user, logging audit (tanpa data sensitif), dan mengembalikan CORS headers yang ketat.

### EF-1: `parse-cv`

- **Trigger:** Job seeker upload CV
- **Input:** `{ file_base64: string, file_type: 'pdf' | 'docx', user_id: string }`
- **Proses:** Validasi file → ekstrak teks dari PDF/DOCX → kirim ke AI dengan prompt strukturisasi → kembalikan data profil terstruktur
- **Output:** `{ name, email, phone, headline, summary, skills, educations, experiences }`
- **Rate limit:** 10 request/user/jam
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-2: `match-cv`

- **Trigger:** Submit lamaran (otomatis) atau manual re-trigger oleh HR
- **Input:** `{ application_id: string }`
- **Proses:** Ambil profil kandidat + deskripsi lowongan dari DB → kirim ke AI untuk scoring → update `applications.ai_match_score` dan `ai_match_summary` menggunakan service role key
- **Output:** `{ match_score: number, summary: string }`
- **Rate limit:** 50 request/user/jam
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-3: `generate-cover-letter`

- **Trigger:** Job seeker request saat flow melamar
- **Input:** `{ job_id: string, language: 'id' | 'en' }`
- **Proses:** Ambil profil user + deskripsi lowongan dari DB → generate cover letter dengan AI menggunakan streaming → stream response ke client via SSE
- **Output:** Server-Sent Events stream teks cover letter
- **Rate limit:** 20 request/user/hari
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-4: `generate-interview-questions`

- **Trigger:** HR klik tombol di halaman detail pelamar
- **Input:** `{ application_id: string, seniority: 'junior' | 'mid' | 'senior' }`
- **Proses:** Ambil profil kandidat + deskripsi lowongan → generate pertanyaan interview → simpan ke `interview_questions`
- **Output:** `{ technical: string[], behavioral: string[], situational: string[] }`
- **Rate limit:** 30 request/user/hari
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-5: `generate-job-description`

- **Trigger:** HR klik "Generate dengan AI" di form lowongan
- **Input:** `{ position: string, department: string, seniority: 'junior' | 'mid' | 'senior' }`
- **Proses:** Generate job description lengkap menggunakan AI
- **Output:** `{ summary: string, responsibilities: string[], required_qualifications: string[], preferred_qualifications: string[], benefits: string[] }`
- **Rate limit:** 20 request/user/hari
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-6: `generate-candidate-insights`

- **Trigger:** HR membuka dashboard pelamar (jika cache stale > 10 menit atau ada pelamar baru)
- **Input:** `{ job_id: string }`
- **Proses:** Ambil semua data pelamar untuk lowongan → generate insights naratif → simpan/update `ai_insights_cache`
- **Output:** `{ insights: string }`
- **Rate limit:** 10 request/user/jam per lowongan
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-7: `career-advisor`

- **Trigger:** Job seeker kirim pertanyaan karir
- **Input:** `{ question: string }`
- **Proses:** Ambil profil user + daftar lowongan aktif → generate jawaban dengan AI menggunakan streaming → simpan histori ke `ai_career_consultations` (hapus entri terlama jika > 10)
- **Output:** Server-Sent Events stream teks jawaban
- **Rate limit:** 15 request/user/hari
- **AI model:** `gemini/gemini-2.5-flash-lite`

### EF-8: `analyze-skill-gap`

- **Trigger:** Job seeker klik "Analisis Skill Gap" di halaman detail lowongan
- **Input:** `{ job_id: string }`
- **Proses:** Ambil profil user + deskripsi lowongan → analisis gap dengan AI → kembalikan hasil terstruktur
- **Output:** `{ matched_skills: SkillItem[], gap_skills: SkillGapItem[] }` di mana `SkillGapItem = { skill: string, estimated_time: string, resource_types: string[] }`
- **Rate limit:** 20 request/user/hari
- **AI model:** `gemini/gemini-2.5-flash-lite`

---

## 9. Acceptance Criteria

### AC-A1: Halaman Utama

- [x] Halaman dapat diakses tanpa login
- [x] Hanya lowongan berstatus `active` yang ditampilkan
- [x] Filter posisi/lokasi/tipe berfungsi dan dapat dikombinasikan
- [x] Pencarian full-text mengembalikan hasil yang relevan
- [x] Pagination berfungsi dan memuat data berikutnya
- [x] Halaman di-render SSR (konten terlihat saat view-source)

### AC-A3: Parsing CV

- [x] Upload PDF dan DOCX berhasil
- [x] File > 5MB ditolak dengan pesan error yang jelas
- [x] Format selain PDF/DOCX ditolak
- [x] Data profil terisi otomatis setelah parsing selesai
- [x] User dapat mengedit dan menyimpan hasil parsing
- [x] Jika AI gagal, ditampilkan error toast dan user bisa upload ulang

### AC-B1: Manajemen Lowongan

- [x] CRUD lowongan berfungsi penuh
- [x] Lowongan draft tidak tampil di halaman publik
- [x] Lowongan active tampil di halaman publik
- [x] HR hanya bisa mengelola lowongan miliknya
- [x] Form validasi bekerja (field required, format yang benar)

### AC-B3: AI Match Score

- [x] Match score muncul di kolom tabel pelamar dalam 60 detik setelah lamaran masuk
- [x] Skor berupa angka 0-100 dengan label persentase
- [x] Ringkasan AI dapat dilihat di halaman detail pelamar
- [x] Tombol "Hitung Ulang" memicu proses matching baru
- [x] Selama proses berjalan, status "processing" ditampilkan

### AC-C1: Cover Letter Generator

- [x] Streaming output muncul secara bertahap, bukan sekaligus
- [x] Pilihan bahasa (ID/EN) menghasilkan cover letter dalam bahasa yang dipilih
- [x] Cover letter tersimpan bersama data lamaran
- [x] HR dapat membaca cover letter di halaman detail pelamar
- [x] Error AI ditampilkan via toast dan tidak mengcrash aplikasi

### AC-C5: Career Path Advisor

- [x] Streaming response berfungsi
- [x] Jawaban kontekstual berdasarkan profil user
- [x] Rekomendasi lowongan aktif muncul di respons
- [x] Histori tersimpan dan dapat dilihat (maks 10 entri)
- [x] Entri ke-11 menghapus entri terlama secara otomatis

---

## 10. Security Requirements

### SR-1: Supabase & Database Security

- **SR-1.1 [SECURITY]:** RLS wajib aktif di semua tabel. Tidak ada tabel yang dapat diakses tanpa policy eksplisit.
- **SR-1.2 [SECURITY]:** Service Role Key hanya digunakan di Edge Functions (server-side). Tidak boleh ada di kode frontend atau environment variable yang di-commit ke repo.
- **SR-1.3 [SECURITY]:** Anon Key di frontend hanya dapat melakukan operasi yang diizinkan RLS.
- **SR-1.4 [SECURITY]:** File CV divalidasi tipe dan ukuran di Edge Function server-side (max 5MB, hanya PDF/DOCX).
- **SR-1.5 [SECURITY]:** Storage bucket CV menggunakan signed URLs dengan expiry time (bukan public URL permanen). Expiry default: 1 jam.
- **SR-1.6 [SECURITY]:** Semua operasi write ke database melalui RLS-protected queries atau Supabase RPC yang memvalidasi konteks user.

### SR-2: Edge Function Security

- **SR-2.1 [SECURITY]:** Semua Edge Functions memvalidasi JWT dari header `Authorization` sebelum memproses request apapun.
- **SR-2.2 [SECURITY]:** Validasi input ketat dengan Zod schema di setiap Edge Function.
- **SR-2.3 [SECURITY]:** Rate limiting per user per endpoint (lihat batas di FR per Edge Function).
- **SR-2.4 [SECURITY]:** AI API Key disimpan sebagai Supabase Secret, tidak pernah di kode frontend atau `.env` yang di-commit.
- **SR-2.5 [SECURITY]:** CORS headers yang ketat — hanya izinkan origin yang terdaftar (domain Vercel production + localhost dev), tidak menggunakan wildcard `*`.
- **SR-2.6 [SECURITY]:** Logging semua request ke Edge Functions untuk audit trail. Data sensitif (isi CV, konten AI) tidak disimpan di log.

### SR-3: Frontend Security

- **SR-3.1 [SECURITY]:** Content Security Policy (CSP) dikonfigurasi via `vercel.json` headers.
- **SR-3.2 [SECURITY]:** Semua form input divalidasi dengan Zod schema sebelum dikirim ke backend.
- **SR-3.3 [SECURITY]:** Tidak ada secret, API key, atau token yang di-hardcode di bundle JavaScript frontend.
- **SR-3.4 [SECURITY]:** Route protection untuk semua halaman HR menggunakan TanStack Router `beforeLoad` guard yang memverifikasi session dan role.
- **SR-3.5 [SECURITY]:** Data sensitif kandidat (telepon, email) hanya ditampilkan kepada HR yang berwenang.

### SR-4: Authentication & Authorization

- **SR-4.1 [SECURITY]:** Supabase Auth digunakan untuk autentikasi (email + password).
- **SR-4.2 [SECURITY]:** RBAC dengan dua role: `job_seeker` dan `hr_recruiter`, disimpan di tabel `profiles` dan di-enforce oleh RLS.
- **SR-4.3 [SECURITY]:** Authorization divalidasi di level database (RLS), bukan hanya di frontend.
- **SR-4.4 [SECURITY]:** Password reset menggunakan Supabase built-in flow.
- **SR-4.5 [SECURITY]:** Logout membersihkan semua state lokal (TanStack Query cache, session).

### SR-5: Data Privacy

- **SR-5.1 [SECURITY]:** CV hanya dapat diakses oleh job seeker yang mengupload DAN HR yang menerima lamarannya (via RLS + signed URL).
- **SR-5.2 [SECURITY]:** AI-generated content (cover letter, histori konsultasi) bersifat privat.
- **SR-5.3 [SECURITY]:** Data personal tidak di-expose di URL atau query parameter.
- **SR-5.4 [SECURITY]:** Soft delete diimplementasi di semua tabel user (`deleted_at` timestamp).

---

## 11. Performance Requirements

### PR-1: Data Fetching & Caching

- **PR-1.1 [PERF]:** TanStack Query dengan `staleTime` yang tepat per jenis data:
  - Data lowongan publik: `5 * 60 * 1000` (5 menit)
  - Data profil user: `2 * 60 * 1000` (2 menit)
  - Status lamaran (real-time): `staleTime: 0` + Supabase Realtime
  - AI insights cache: `10 * 60 * 1000` (10 menit)
- **PR-1.2 [PERF]:** TanStack Router `loader` digunakan untuk prefetch data sebelum render halaman.
- **PR-1.3 [PERF]:** Optimistic updates untuk: update status lamaran oleh HR, submit lamaran oleh job seeker.
- **PR-1.4 [PERF]:** Cursor-based pagination untuk semua list view.

### PR-2: Real-time Updates

- **PR-2.1 [PERF]:** Supabase Realtime subscription untuk status lamaran (job seeker side) dan notifikasi pelamar baru (HR side).
- **PR-2.2 [PERF]:** Realtime subscription di-cleanup saat komponen unmount (tidak ada memory leak).
- **PR-2.3 [PERF]:** Sonner toast untuk notifikasi real-time yang non-intrusif.

### PR-3: Loading States

- **PR-3.1 [PERF]:** Skeleton screen (bukan spinner kosong) untuk setiap komponen yang melakukan data fetch.
- **PR-3.2 [PERF]:** Suspense boundaries dengan TanStack Router untuk menghindari layout shift.
- **PR-3.3 [PERF]:** Streaming response (SSE) untuk operasi AI yang panjang (C1, C5).
- **PR-3.4 [PERF]:** Progress indicator dengan pesan status informatif untuk operasi AI non-streaming (C2, C3, C6).
- **PR-3.5 [PERF]:** UI tidak terblokir selama AI bekerja — user bisa melakukan aktivitas lain.

### PR-4: SSR & Initial Load

- **PR-4.1 [PERF]:** Halaman publik (daftar lowongan, detail lowongan) di-render SSR via TanStack Start.
- **PR-4.2 [PERF]:** Data di-dehydrate dari server ke client menggunakan TanStack Query `dehydrate/hydrate`.
- **PR-4.3 [PERF]:** Halaman dashboard HR dapat CSR (tidak perlu SEO).
- **PR-4.4 [PERF]:** Vercel Edge Runtime untuk SSR pages publik (`Cache-Control: s-maxage=300, stale-while-revalidate=600`).

### PR-5: Database Query Optimization

- **PR-5.1 [PERF]:** Semua query Supabase menggunakan `.select()` dengan kolom spesifik (tidak ada `select('*')` di production).
- **PR-5.2 [PERF]:** Index database dibuat untuk kolom yang sering di-filter/sort (lihat definisi tabel di Seksi 7).
- **PR-5.3 [PERF]:** Supabase RPC functions untuk query kompleks yang melibatkan multiple joins.
- **PR-5.4 [PERF]:** Response payload dibatasi — full detail hanya di-fetch saat user membuka detail view.
