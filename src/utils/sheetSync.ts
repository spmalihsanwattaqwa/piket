import { AttendanceRecord, PeriodConfig } from '../types/schedule';
import { GOOGLE_SHEET_INFO } from '../data/scheduleData';

export const APPS_SCRIPT_TEMPLATE = `
/**
 * Script Google Apps Script untuk menerima data absen piket
 * Cara pasang:
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_INFO.spreadsheetId}/edit
 * 2. Klik menu Ekstensi > Apps Script
 * 3. Hapus kode lama, tempelkan kode di bawah ini
 * 4. Klik 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru)
 * 5. Pilih jenis 'Web app' (Aplikasi web)
 *    - Execute as: Me (Email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 6. Salin URL Web App yang dihasilkan ke aplikasi ini pada menu 'Sinkron Sheet'.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("${GOOGLE_SHEET_INFO.sheetName}");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("${GOOGLE_SHEET_INFO.sheetName}");
      sheet.appendRow([
        "Tanggal", "Hari", "Jam Ke", "Waktu", "Mata Pelajaran",
        "Kelas", "Nama Guru", "Status Kehadiran", "Keterangan / Pengganti", "Waktu Input"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#d9ead3");
    }

    var data = JSON.parse(e.postData.contents);
    var rows = data.records || [];

    // Jika mode replace harian, hapus data lama tanggal yang sama (opsional)
    // Atau langsung append data baru:
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      sheet.appendRow([
        r.date,
        r.day,
        r.period,
        r.timeRange || "",
        r.subject,
        r.className,
        r.teacher,
        r.statusText,
        r.note || r.substituteTeacher || "-",
        new Date().toLocaleString("id-ID")
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export function getStatusLabel(status: 'belum' | 'hadir' | 'tidak_hadir'): string {
  switch (status) {
    case 'hadir': return 'Hadir';
    case 'tidak_hadir': return 'Tidak Hadir';
    default: return 'Belum Absen';
  }
}

export function generateCSVContent(records: AttendanceRecord[], periods: PeriodConfig[]): string {
  const headers = [
    'Tanggal',
    'Hari',
    'Jam Ke',
    'Waktu',
    'Mata Pelajaran',
    'Kelas',
    'Nama Guru',
    'Status Kehadiran',
    'Keterangan / Guru Pengganti',
    'Waktu Diperbarui'
  ];

  const rows = records.map(rec => {
    const periodConf = periods.find(p => p.period === rec.period);
    const timeRange = periodConf ? `${periodConf.startTime} - ${periodConf.endTime}` : '';
    const noteText = [rec.reason, rec.substituteTeacher ? `Pengganti: ${rec.substituteTeacher}` : '', rec.note]
      .filter(Boolean)
      .join(' | ') || '-';

    return [
      rec.date,
      rec.day,
      `Jam ${rec.period}`,
      timeRange,
      `"${rec.subject.replace(/"/g, '""')}"`,
      rec.className,
      `"${rec.teacher.replace(/"/g, '""')}"`,
      getStatusLabel(rec.status),
      `"${noteText.replace(/"/g, '""')}"`,
      rec.updatedAt || '-'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function generateTsvForClipboard(records: AttendanceRecord[], periods: PeriodConfig[]): string {
  const rows = records.map(rec => {
    const periodConf = periods.find(p => p.period === rec.period);
    const timeRange = periodConf ? `${periodConf.startTime} - ${periodConf.endTime}` : '';
    const noteText = [rec.reason, rec.substituteTeacher ? `Pengganti: ${rec.substituteTeacher}` : '', rec.note]
      .filter(Boolean)
      .join(' | ') || '-';

    return [
      rec.date,
      rec.day,
      `Jam ${rec.period}`,
      timeRange,
      rec.subject,
      rec.className,
      rec.teacher,
      getStatusLabel(rec.status),
      noteText,
      rec.updatedAt || '-'
    ].join('\t');
  });

  return rows.join('\n');
}

export async function syncToGoogleSheetWebhook(
  webhookUrl: string,
  records: AttendanceRecord[],
  periods: PeriodConfig[]
): Promise<{ success: boolean; message: string }> {
  const cleanUrl = webhookUrl.trim();

  if (!cleanUrl) {
    return { success: false, message: 'URL Webhook Google Apps Script belum diisi.' };
  }

  // Check common mistake: copying editor URL instead of deployment Web App URL
  if (cleanUrl.includes('/edit') && !cleanUrl.includes('/exec')) {
    return {
      success: false,
      message:
        'URL yang Anda masukkan adalah tautan editor Apps Script (/edit). Silakan klik "Deploy" > "Manage deployments" lalu salin URL Web App yang berakhiran "/exec".'
    };
  }

  const payload = {
    spreadsheetId: GOOGLE_SHEET_INFO.spreadsheetId,
    sheetName: GOOGLE_SHEET_INFO.sheetName,
    records: records.map((r) => {
      const periodConf = periods.find((p) => p.period === r.period);
      return {
        date: r.date,
        day: r.day,
        period: `Jam ${r.period}`,
        timeRange: periodConf ? `${periodConf.startTime} - ${periodConf.endTime}` : '',
        subject: r.subject,
        className: r.className,
        teacher: r.teacher,
        statusText: getStatusLabel(r.status),
        note: [r.reason, r.substituteTeacher ? `Pengganti: ${r.substituteTeacher}` : '', r.note]
          .filter(Boolean)
          .join(' | ')
      };
    })
  };

  // 1. Primary method: Server-side proxy (/api/sync-sheet)
  // This completely eliminates browser CORS & 302 redirect issues
  try {
    const proxyRes = await fetch('/api/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: cleanUrl, payload })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return {
        success: data.success ?? true,
        message: data.message || `Berhasil menyinkronkan ${payload.records.length} data ke Google Sheet.`
      };
    } else if (proxyRes.status !== 404 && proxyRes.status !== 502) {
      const errData = await proxyRes.json().catch(() => null);
      if (errData?.message) {
        return { success: false, message: errData.message };
      }
    }
  } catch (proxyError) {
    console.warn('Proxy route unavailable, falling back to direct no-cors request:', proxyError);
  }

  // 2. Fallback method: Direct browser fetch using mode: 'no-cors'
  // 'no-cors' allows sending data to Google Apps Script without being blocked by CORS preflight or 302 redirects
  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Data ${payload.records.length} absensi telah dikirim langsung ke Google Sheet.`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal mengirim data: ${msg}. Pastikan izin deployment diatur ke "Anyone" (Siapa saja).`
    };
  }
}
