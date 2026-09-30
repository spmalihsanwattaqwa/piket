import { AttendanceRecord, LockedEvent, PeriodConfig, PiketDutyRecord } from '../types/schedule';
import { GOOGLE_SHEET_INFO } from '../data/scheduleData';

export const DEFAULT_WEBHOOK_URL =
  GOOGLE_SHEET_INFO.defaultWebhookUrl ||
  'https://script.google.com/macros/s/AKfycbx6yaYtK3NLWBINYkUiQ6jWINDfu9aJVpBAmDGnE8SDMBVrsv3N4K0P9aqLxxSKdKI/exec';

export const APPS_SCRIPT_TEMPLATE = `
/**
 * Script Google Apps Script Terpadu Absensi & Pengaturan Piket
 * SPM AL IHSAN WAT TAQWA
 *
 * Mendukung:
 * 1. Penyimpanan Data Absensi Harian (Sheet: piket_absensi)
 * 2. Penyimpanan Seluruh Pengaturan (Jam KBM, Sandi Admin, Petugas Piket, Kunci Kegiatan) (Sheet: piket_pengaturan)
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // 1. SIMPAN DATA ABSENSI
    if (data.records && data.records.length > 0) {
      var sheet = ss.getSheetByName("piket_absensi") || ss.getSheetByName("piket");
      if (!sheet) {
        sheet = ss.insertSheet("piket_absensi");
        sheet.appendRow([
          "Tanggal", "Hari", "Jam Ke", "Waktu", "Mata Pelajaran",
          "Kelas", "Nama Guru", "Status Kehadiran", "Keterangan / Pengganti", "Waktu Input"
        ]);
        sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#d9ead3");
      }

      var rows = data.records;
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
    }

    // 2. SIMPAN PENGATURAN SISTEM (JAM KBM, SANDI ADMIN, PETUGAS PIKET, KUNCI KEGIATAN)
    if (data.action === "sync_settings" || data.periods || data.adminPassword || data.piketDuties || data.lockedEvents) {
      var cfgSheet = ss.getSheetByName("piket_pengaturan");
      if (!cfgSheet) {
        cfgSheet = ss.insertSheet("piket_pengaturan");
        cfgSheet.appendRow(["Kategori Pengaturan", "Data JSON / Nilai", "Waktu Diperbarui"]);
        cfgSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#cfe2f3");
      }

      var nowStr = new Date().toLocaleString("id-ID");
      if (data.periods) {
        cfgSheet.appendRow(["periods", JSON.stringify(data.periods), nowStr]);
      }
      if (data.adminPassword) {
        cfgSheet.appendRow(["adminPassword", String(data.adminPassword), nowStr]);
      }
      if (data.piketDuties) {
        cfgSheet.appendRow(["piketDuties", JSON.stringify(data.piketDuties), nowStr]);
      }
      if (data.lockedEvents) {
        cfgSheet.appendRow(["lockedEvents", JSON.stringify(data.lockedEvents), nowStr]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data dan pengaturan berhasil disimpan ke Google Sheet"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cfgSheet = ss.getSheetByName("piket_pengaturan");
    var result = { status: "success", settings: {} };

    if (cfgSheet) {
      var lastRow = cfgSheet.getLastRow();
      if (lastRow > 1) {
        var values = cfgSheet.getRange(2, 1, lastRow - 1, 3).getValues();
        for (var i = 0; i < values.length; i++) {
          var key = values[i][0];
          var val = values[i][1];
          try {
            result.settings[key] = JSON.parse(val);
          } catch (e) {
            result.settings[key] = val;
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(result))
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

export function generatePayloadFromRecords(
  date: string,
  records: AttendanceRecord[],
  periods: PeriodConfig[],
  webhookUrl: string = DEFAULT_WEBHOOK_URL
) {
  return {
    spreadsheetId: GOOGLE_SHEET_INFO.spreadsheetId,
    sheetName: GOOGLE_SHEET_INFO.sheetName,
    date,
    webhookUrl,
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
          .join(' | '),
      };
    }),
  };
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

export interface AppSettingsPayload {
  periods?: PeriodConfig[];
  lockedEvents?: LockedEvent[];
  piketDuties?: PiketDutyRecord[];
  adminPassword?: string;
  source?: string;
}

export async function syncSettingsToGoogleSheet(
  webhookUrl: string = DEFAULT_WEBHOOK_URL,
  settings: AppSettingsPayload
): Promise<{ success: boolean; message: string }> {
  const cleanUrl = (webhookUrl || DEFAULT_WEBHOOK_URL).trim();
  if (!cleanUrl) return { success: false, message: 'URL webhook kosong.' };

  const payload = {
    action: 'sync_settings',
    spreadsheetId: GOOGLE_SHEET_INFO.spreadsheetId,
    timestamp: new Date().toISOString(),
    ...settings,
  };

  // 1. Try server-side proxy
  try {
    const proxyRes = await fetch('/api/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: cleanUrl, payload }),
    });
    if (proxyRes.ok) {
      return { success: true, message: 'Pengaturan berhasil disimpan di spreadsheet.' };
    }
  } catch {
    // fallback
  }

  // 2. Direct browser fetch with mode: 'no-cors'
  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return { success: true, message: 'Pengaturan berhasil dikirim ke spreadsheet.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal kirim pengaturan: ${msg}` };
  }
}

