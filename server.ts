import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI Server Client safely
let ai: GoogleGenAI | null = null;
function getGenAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return ai;
}

// --- API ROUTES ---

// Healthcheck Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'SIM PKL SMK/MA',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Endpoint 1: Polishing Daily Journal Entry
app.post('/api/gemini/journal-polish', async (req, res) => {
  try {
    const { activityTitle, description, learnings, classMajor } = req.body;
    const client = getGenAI();

    if (!client) {
      // Fallback if no GEMINI_API_KEY is available
      return res.json({
        polishedTitle: activityTitle,
        polishedDescription: `[Hasil AI Offline] ${description}. Meliputi pelaksanaan tugas sesuai standar operational operasional industri.`,
        polishedLearnings: `[Hasil AI Offline] ${learnings}. Mengembangkan sikap disiplin, kerja keras, dan kepatuhan prosedur K3.`,
        suggestedSkills: ['Kedisiplinan', 'Prosedur K3', 'Komunikasi Kerja'],
      });
    }

    const prompt = `
Anda adalah Asisten AI Kurikulum & Pembimbing PKL SMK/MA di Indonesia.
Bantu rapikan dan tingkatkan kualitas jurnal harian siswa PKL berikut agar terdengar profesional, terstruktur, serta sesuai dengan Capaian Pembelajaran (CP) / Kompetensi Dasar jurusan ${classMajor || 'Vokasi'}.

Data Jurnal Siswa:
Judul Kegiatan: ${activityTitle}
Deskripsi Kegiatan: ${description}
Hasil Pembelajaran: ${learnings}

Berikan respons JSON dalam format persis seperti ini:
{
  "polishedTitle": "Judul kegiatan yang singkat dan profesional",
  "polishedDescription": "Deskripsi kegiatan yang diperjelas dengan istilah teknis industri yang relevan, runtut, dan rapi",
  "polishedLearnings": "Refleksi hasil pembelajaran dan softskills/hardskills yang diperoleh",
  "suggestedSkills": ["Skill 1", "Skill 2", "Skill 3"]
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/journal-polish:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses jurnal dengan AI' });
  }
});

// AI Endpoint 2: Generating Formal School PKL Application Cover Letter
app.post('/api/gemini/generate-letter', async (req, res) => {
  try {
    const { schoolName, dudiName, city, studentNames, majorName, startDate, endDate } = req.body;
    const client = getGenAI();

    if (!client) {
      return res.json({
        letterNumber: `421.5/${Math.floor(100 + Math.random() * 900)}/SMK/2026`,
        content: `SURAT PERMOHONAN PERIZINAN PRAKTIK KERJA LAPANGAN (PKL)

Kepada Yth.
Pimpinan / HRD ${dudiName || 'Instansi/DUDI'}
di ${city || 'Tempat'}

Dengan hormat,
Dalam rangka melatih keterampilan dan kesiapan kerja siswa SMK/MA sesuai Kurikulum Merdeka Vokasi, kami dari ${schoolName || 'SMK Negeri 1'} bermaksud mengajukan permohonan PKL untuk siswa kami pada jurusan ${majorName || 'Keahlian'}.

Nama Siswa:
${(studentNames || ['Ahmad Rizky Pratama']).map((name: string, i: number) => `${i + 1}. ${name}`).join('\n')}

Waktu Pelaksanaan: ${startDate || '1 Juli 2026'} s.d. ${endDate || '1 Oktober 2026'}.

Besar harapan kami agar Bapak/Ibu pimpinan berkenan menerima permohonan PKL ini. Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.`,
      });
    }

    const prompt = `
Buatkan draf Surat Pengantar Permohonan Resmi Praktik Kerja Lapangan (PKL) dari sekolah ke perusahaan mitra (DUDI) dalam Bahasa Indonesia yang sangat sopan, baku, dan sesuai tata naskah dinas pendidikan.

Detail:
Sekolah: ${schoolName || 'SMK Negeri 1'}
Nama Perusahaan DUDI: ${dudiName}
Kota: ${city || 'Jakarta'}
Jurusan: ${majorName}
Daftar Siswa: ${(studentNames || []).join(', ')}
Tanggal Sesi: ${startDate} s.d ${endDate}

Hasilkan JSON:
{
  "letterNumber": "Nomor Surat Resmi (contoh: 421.5/089/SMK/2026)",
  "content": "Isi lengkap surat pengantar permohonan PKL"
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-letter:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat surat pengantar dengan AI' });
  }
});

// AI Endpoint 3: Supervisor Student Performance Summary
app.post('/api/gemini/supervisor-summary', async (req, res) => {
  try {
    const { studentName, journals, attendances } = req.body;
    const client = getGenAI();

    if (!client) {
      return res.json({
        summary: `Siswa ${studentName} menunjukkan tingkat kehadiran yang sangat konsisten dengan catatan jurnal harian yang lengkap.`,
        recommendations: [
          'Pertahankan komunikasi aktif dengan pembimbing industri.',
          'Mulai menyusun draf bab laporan PKL.',
        ],
        estimatedPerformanceGrade: 'Sangat Baik (A)',
      });
    }

    const prompt = `
Sebagai Guru Pembimbing PKL SMK/MA, berikan analisis singkat dan catatan perkembangan untuk siswa: ${studentName}.

Data Jurnal Terakhir: ${JSON.stringify(journals || [])}
Data Presensi: ${JSON.stringify(attendances || [])}

Hasilkan JSON:
{
  "summary": "Ringkasan evaluasi perkembangan siswa (2-3 kalimat)",
  "recommendations": ["Saran 1", "Saran 2"],
  "estimatedPerformanceGrade": "Sangat Baik (A) / Baik (B) / Cukup (C)"
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Gagal memproses rekap bimbingan' });
  }
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SIM PKL running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
