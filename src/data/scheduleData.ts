import { DayOfWeek, PeriodConfig, ScheduleItem, BellSchedulePreset, BellSettingsConfig } from '../types/schedule';

export const DEFAULT_PERIODS: PeriodConfig[] = [
  { period: 1, name: 'Jam Ke-1', startTime: '07:15', endTime: '08:00' },
  { period: 2, name: 'Jam Ke-2', startTime: '08:00', endTime: '08:45' },
  { period: 3, name: 'Jam Ke-3', startTime: '08:45', endTime: '09:30' },
  { period: 4, name: 'Jam Ke-4', startTime: '09:30', endTime: '10:15' },
  { period: 0, name: 'Istirahat', startTime: '10:15', endTime: '10:45', isBreak: true },
  { period: 5, name: 'Jam Ke-5', startTime: '10:45', endTime: '11:30' },
  { period: 6, name: 'Jam Ke-6', startTime: '11:30', endTime: '12:15' },
];

export const FRIDAY_PERIODS: PeriodConfig[] = [
  { period: 1, name: 'Jam Ke-1', startTime: '07:15', endTime: '07:55' },
  { period: 2, name: 'Jam Ke-2', startTime: '07:55', endTime: '08:35' },
  { period: 3, name: 'Jam Ke-3', startTime: '08:35', endTime: '09:15' },
  { period: 0, name: 'Istirahat', startTime: '09:15', endTime: '09:45', isBreak: true },
  { period: 4, name: 'Jam Ke-4', startTime: '09:45', endTime: '10:25' },
  { period: 5, name: 'Jam Ke-5', startTime: '10:25', endTime: '11:05' },
];

export const EXAM_PERIODS: PeriodConfig[] = [
  { period: 1, name: 'Sesi Ujian 1', startTime: '07:30', endTime: '09:00' },
  { period: 0, name: 'Istirahat Ujian', startTime: '09:00', endTime: '09:30', isBreak: true },
  { period: 2, name: 'Sesi Ujian 2', startTime: '09:30', endTime: '11:00' },
  { period: 0, name: 'Istirahat & Sholat', startTime: '11:00', endTime: '11:30', isBreak: true },
  { period: 3, name: 'Sesi Ujian 3', startTime: '11:30', endTime: '12:30' },
];

export const DEFAULT_BELL_PRESETS: Record<string, BellSchedulePreset> = {
  reguler: {
    id: 'reguler',
    name: 'Jadwal Reguler (Senin - Kamis & Sabtu)',
    description: 'Jadwal standar 6 jam KBM + 1 sesi istirahat',
    periods: DEFAULT_PERIODS,
  },
  jumat: {
    id: 'jumat',
    name: 'Jadwal Khusus Hari Jumat',
    description: 'Durasi jam dipadatkan menjelang Sholat Jumat (5 Jam)',
    periods: FRIDAY_PERIODS,
  },
  ujian: {
    id: 'ujian',
    name: 'Jadwal Khusus Ujian (PAS / PAT / STS)',
    description: 'Format sesi ujian 90 menit & istirahat khusus ujian',
    periods: EXAM_PERIODS,
  },
};

export const DEFAULT_BELL_CONFIG: BellSettingsConfig = {
  activePresetId: 'auto',
  autoFridaySwitch: true,
  presets: DEFAULT_BELL_PRESETS,
};

export const GOOGLE_SHEET_INFO = {
  spreadsheetId: '1OX7c6xkXt3j5eJNeAAyWou7xAdXKSjVCs_YaPtrWGCA',
  sheetName: 'piket',
  url: 'https://docs.google.com/spreadsheets/d/1OX7c6xkXt3j5eJNeAAyWou7xAdXKSjVCs_YaPtrWGCA/edit#gid=0',
  defaultWebhookUrl: 'https://script.google.com/macros/s/AKfycbx6yaYtK3NLWBINYkUiQ6jWINDfu9aJVpBAmDGnE8SDMBVrsv3N4K0P9aqLxxSKdKI/exec',
};

// All schedule items accurately parsed from SPM AL IHSAN WAT TAQWA Timetable
export const FULL_SCHEDULE: ScheduleItem[] = [
  {
    "id": "sch_DR_KH_MUHA_selasa_2_6A_8",
    "teacher": "DR.KH.MUHAMMAD AGUS SALIM Lc.,M.A",
    "subject": "Nahwu",
    "className": "6A",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_DR_KH_MUHA_selasa_3_6A_9",
    "teacher": "DR.KH.MUHAMMAD AGUS SALIM Lc.,M.A",
    "subject": "Nahwu",
    "className": "6A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_DR_KH_MUHA_sabtu_3_6B_33",
    "teacher": "DR.KH.MUHAMMAD AGUS SALIM Lc.,M.A",
    "subject": "Nahwu",
    "className": "6B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_DR_KH_MUHA_sabtu_4_6B_34",
    "teacher": "DR.KH.MUHAMMAD AGUS SALIM Lc.,M.A",
    "subject": "Nahwu",
    "className": "6B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_GUS_HAMAM__senin_2_3A2_2",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Tarikh Islam",
    "className": "3A2",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_GUS_HAMAM__senin_3_3_INT_A_3",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3 INT A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_GUS_HAMAM__senin_4_3A2_4",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3A2",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_GUS_HAMAM__senin_5_2B_5",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "2B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_GUS_HAMAM__senin_6_2A_6",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "2A",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_GUS_HAMAM__selasa_3_3A1_9",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Tarikh Islam",
    "className": "3A1",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_GUS_HAMAM__selasa_4_3A2_10",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3A2",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_GUS_HAMAM__selasa_5_2A_11",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "2A",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_GUS_HAMAM__rabu_3_3A1_15",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3A1",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_GUS_HAMAM__rabu_4_3B_16",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Tarikh Islam",
    "className": "3B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_GUS_HAMAM__rabu_5_3A1_17",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Grammar",
    "className": "3A1",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_GUS_HAMAM__kamis_4_3A1_22",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3A1",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_GUS_HAMAM__kamis_5_2B_23",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "2B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_GUS_HAMAM__jumat_1_3_INT_A_25",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Grammar",
    "className": "3 INT A",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_GUS_HAMAM__sabtu_2_3_INT_A_32",
    "teacher": "GUS HAMAM YUSRON,S.Sy",
    "subject": "Mahfudzot",
    "className": "3 INT A",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_NANANG_ALF_selasa_2_5B_8",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "B.inggris",
    "className": "5B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_NANANG_ALF_selasa_3_6B_9",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Tarbiyah",
    "className": "6B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_NANANG_ALF_selasa_4_6A_10",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Tarbiyah",
    "className": "6A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_NANANG_ALF_selasa_5_5A_11",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Grammar",
    "className": "5A",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_NANANG_ALF_selasa_6_6B_12",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Mutholaah",
    "className": "6B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_NANANG_ALF_rabu_2_5B_14",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Grammar",
    "className": "5B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_NANANG_ALF_rabu_3_5A_15",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "B.inggris",
    "className": "5A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_NANANG_ALF_rabu_4_6A_16",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Mutholaah",
    "className": "6A",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_NANANG_ALF_rabu_5_6B_17",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Tarbiyah",
    "className": "6B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_NANANG_ALF_rabu_6_6A_18",
    "teacher": "NANANG ALFAN AMRULLOH.M.Pd",
    "subject": "Tarbiyah",
    "className": "6A",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_MUHAMMAD_S_sabtu_2_6B_32",
    "teacher": "MUHAMMAD SYARIF HIDAYAT,S.E",
    "subject": "B.inggris",
    "className": "6B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_MUHAMMAD_S_sabtu_3_5A_33",
    "teacher": "MUHAMMAD SYARIF HIDAYAT,S.E",
    "subject": "Faraidh",
    "className": "5A",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_MUHAMMAD_S_sabtu_4_5A_34",
    "teacher": "MUHAMMAD SYARIF HIDAYAT,S.E",
    "subject": "Faraidh",
    "className": "5A",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_MUHAMMAD_S_sabtu_5_5B_35",
    "teacher": "MUHAMMAD SYARIF HIDAYAT,S.E",
    "subject": "Faraidh",
    "className": "5B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_MUHAMMAD_S_sabtu_6_5B_36",
    "teacher": "MUHAMMAD SYARIF HIDAYAT,S.E",
    "subject": "Faraidh",
    "className": "5B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_ALDHAM_FIR_senin_2_6B_2",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Balaghoh",
    "className": "6B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_ALDHAM_FIR_senin_3_1A1_3",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Al Insya'",
    "className": "1A1",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_ALDHAM_FIR_senin_4_6B_4",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Mustolahul Hadits",
    "className": "6B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_ALDHAM_FIR_senin_5_1B_5",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Al Miftah",
    "className": "1B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_ALDHAM_FIR_senin_6_6A_6",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Balaghoh",
    "className": "6A",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_ALDHAM_FIR_selasa_3_1A1_9",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Al Insya'",
    "className": "1A1",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_ALDHAM_FIR_selasa_4_5A_10",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Adyan",
    "className": "5A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_ALDHAM_FIR_selasa_5_6B_11",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Tarikh Adab",
    "className": "6B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_ALDHAM_FIR_rabu_5_5B_17",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Adyan",
    "className": "5B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_ALDHAM_FIR_rabu_6_1_INT_A_18",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Al Insya'",
    "className": "1 INT A",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_ALDHAM_FIR_kamis_3_6A_21",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Mustolahul Hadits",
    "className": "6A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_ALDHAM_FIR_kamis_6_5A_24",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Mustolahul Hadits",
    "className": "5A",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_ALDHAM_FIR_jumat_1_1_INT_A_25",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Al Insya'",
    "className": "1 INT A",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_ALDHAM_FIR_jumat_2_6B_26",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Balaghoh",
    "className": "6B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_ALDHAM_FIR_jumat_3_6A_27",
    "teacher": "ALDHAM FIRMANSYAH",
    "subject": "Balaghoh",
    "className": "6A",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_CIPTO_BOWO_senin_2_3A1_2",
    "teacher": "CIPTO BOWO L",
    "subject": "Mutholaah",
    "className": "3A1",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_CIPTO_BOWO_senin_4_1A2_4",
    "teacher": "CIPTO BOWO L",
    "subject": "Al Insya'",
    "className": "1A2",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_CIPTO_BOWO_senin_5_1A1_5",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A1",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_CIPTO_BOWO_senin_6_1A1_6",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A1",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_CIPTO_BOWO_selasa_2_2A_8",
    "teacher": "CIPTO BOWO L",
    "subject": "Al Insya'",
    "className": "2A",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_CIPTO_BOWO_selasa_3_1A2_9",
    "teacher": "CIPTO BOWO L",
    "subject": "Al Insya'",
    "className": "1A2",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_CIPTO_BOWO_selasa_4_3A1_10",
    "teacher": "CIPTO BOWO L",
    "subject": "Tarbiyah",
    "className": "3A1",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_CIPTO_BOWO_selasa_5_1A2_11",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A2",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_CIPTO_BOWO_selasa_6_1A2_12",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A2",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_CIPTO_BOWO_rabu_2_5A_14",
    "teacher": "CIPTO BOWO L",
    "subject": "Tarbiyah",
    "className": "5A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_CIPTO_BOWO_rabu_3_1A1_15",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A1",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_CIPTO_BOWO_rabu_4_1A1_16",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A1",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_CIPTO_BOWO_rabu_5_1B_17",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_CIPTO_BOWO_rabu_6_1B_18",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_CIPTO_BOWO_kamis_2_3A1_20",
    "teacher": "CIPTO BOWO L",
    "subject": "Mutholaah",
    "className": "3A1",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_CIPTO_BOWO_kamis_3_1A2_21",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A2",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_CIPTO_BOWO_kamis_4_1A2_22",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1A2",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_CIPTO_BOWO_kamis_5_1B_23",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_CIPTO_BOWO_kamis_6_1B_24",
    "teacher": "CIPTO BOWO L",
    "subject": "Durusul lughoh",
    "className": "1B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_CIPTO_BOWO_jumat_1_2A_25",
    "teacher": "CIPTO BOWO L",
    "subject": "Imla'",
    "className": "2A",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_CIPTO_BOWO_jumat_2_5A_26",
    "teacher": "CIPTO BOWO L",
    "subject": "Tarbiyah",
    "className": "5A",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_CIPTO_BOWO_jumat_3_3A2_27",
    "teacher": "CIPTO BOWO L",
    "subject": "Tarbiyah",
    "className": "3A2",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_AHMAD_NASR_senin_2_1A2_2",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "1A2",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_AHMAD_NASR_senin_3_3_INT_B_3",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3 INT B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_AHMAD_NASR_senin_4_3B_4",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Akhlaq",
    "className": "3B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_AHMAD_NASR_senin_5_6B_5",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Mahfudzot",
    "className": "6B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_AHMAD_NASR_senin_6_3A1_6",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Akhlaq",
    "className": "3A1",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_AHMAD_NASR_selasa_2_3A1_8",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3A1",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_AHMAD_NASR_selasa_3_5B_9",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Akhlaq",
    "className": "5B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_AHMAD_NASR_selasa_4_3B_10",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_AHMAD_NASR_selasa_5_3_INT_A_11",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3 INT A",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_AHMAD_NASR_selasa_6_5A_12",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Akhlaq",
    "className": "5A",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_AHMAD_NASR_rabu_2_3_INT_A_14",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3 INT A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_AHMAD_NASR_rabu_4_3A2_16",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3A2",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_AHMAD_NASR_rabu_5_3_INT_B_17",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3 INT B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_AHMAD_NASR_rabu_6_3A1_18",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3A1",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_AHMAD_NASR_kamis_2_1A2_20",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "1A2",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_AHMAD_NASR_kamis_3_3A2_21",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3A2",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_AHMAD_NASR_kamis_4_6A_22",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Mahfudzot",
    "className": "6A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_AHMAD_NASR_kamis_5_3B_23",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Fiqh",
    "className": "3B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_AHMAD_NASR_kamis_6_3A2_24",
    "teacher": "AHMAD NASRUDDIN",
    "subject": "Akhlaq",
    "className": "3A2",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_AZZAM_IBAD_selasa_2_3A2_8",
    "teacher": "AZZAM IBADURROHMAN",
    "subject": "Shorf",
    "className": "3A2",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_AZZAM_IBAD_rabu_5_1_INT_A_17",
    "teacher": "AZZAM IBADURROHMAN",
    "subject": "Shorf",
    "className": "1 INT A",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_AZZAM_IBAD_jumat_2_3_INT_A_26",
    "teacher": "AZZAM IBADURROHMAN",
    "subject": "Shorf",
    "className": "3 INT A",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_AZZAM_IBAD_sabtu_3_3A1_33",
    "teacher": "AZZAM IBADURROHMAN",
    "subject": "Shorf",
    "className": "3A1",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AZZAM_IBAD_sabtu_4_2A_34",
    "teacher": "AZZAM IBADURROHMAN",
    "subject": "Tarikh Islam",
    "className": "2A",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_IQBAL_AZIZ_senin_2_6A_2",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "6A",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_IQBAL_AZIZ_senin_3_3A1_3",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3A1",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_IQBAL_AZIZ_senin_5_3A2_5",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3A2",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_IQBAL_AZIZ_senin_6_5B_6",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "5B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_IQBAL_AZIZ_selasa_2_3_INT_B_8",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3 INT B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_IQBAL_AZIZ_selasa_3_3A2_9",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3A2",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_IQBAL_AZIZ_selasa_4_6B_10",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "6B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_IQBAL_AZIZ_selasa_5_3_INT_B_11",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3 INT B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_IQBAL_AZIZ_selasa_6_6A_12",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "6A",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_IQBAL_AZIZ_rabu_3_3_INT_A_15",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3 INT A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_IQBAL_AZIZ_rabu_4_6B_16",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "6B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_IQBAL_AZIZ_rabu_5_5A_17",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "5A",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_IQBAL_AZIZ_rabu_6_3B_18",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_IQBAL_AZIZ_jumat_1_3A1_25",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3A1",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_IQBAL_AZIZ_jumat_3_5B_27",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "5B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_IQBAL_AZIZ_sabtu_2_5A_32",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "5A",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_IQBAL_AZIZ_sabtu_3_3_INT_A_33",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3 INT A",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_IQBAL_AZIZ_sabtu_5_3B_35",
    "teacher": "IQBAL AZIZ",
    "subject": "Hadits",
    "className": "3B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_HASAN_AL_H_senin_3_2A_3",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_HASAN_AL_H_senin_4_2A_4",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_HASAN_AL_H_selasa_3_2A_9",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_HASAN_AL_H_selasa_4_2A_10",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_HASAN_AL_H_rabu_2_2A_14",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_HASAN_AL_H_rabu_3_2A_15",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_HASAN_AL_H_kamis_3_2A_21",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_HASAN_AL_H_kamis_4_2A_22",
    "teacher": "HASAN AL HAMIDI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_YANDRIFUL__senin_3_5A_3",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Nahwu",
    "className": "5A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_YANDRIFUL__senin_5_1A2_5",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Al Miftah",
    "className": "1A2",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_YANDRIFUL__selasa_5_3A1_11",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "3A1",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_YANDRIFUL__jumat_3_3_INT_A_27",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "3 INT A",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_YANDRIFUL__sabtu_3_1A1_33",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Al Miftah",
    "className": "1A1",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_YANDRIFUL__sabtu_4_3A2_34",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "3A2",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_YANDRIFUL__sabtu_6_5A_36",
    "teacher": "YANDRIFUL HABIB",
    "subject": "Nahwu",
    "className": "5A",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_IMADUDIN_A_senin_2_1_INT_A_2",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_IMADUDIN_A_senin_3_1_INT_A_3",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_IMADUDIN_A_senin_4_3_INT_B_4",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Tarbiyah",
    "className": "3 INT B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_IMADUDIN_A_senin_5_6A_5",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Mantiq",
    "className": "6A",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_IMADUDIN_A_senin_6_3A2_6",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Usul Fiqh",
    "className": "3A2",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_IMADUDIN_A_selasa_2_1_INT_A_8",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_IMADUDIN_A_selasa_3_1_INT_A_9",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_IMADUDIN_A_selasa_5_6A_11",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Mantiq",
    "className": "6A",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_IMADUDIN_A_rabu_2_1_INT_A_14",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_IMADUDIN_A_rabu_3_1_INT_A_15",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Durusul lughoh",
    "className": "1 INT A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_IMADUDIN_A_kamis_3_3_INT_A_21",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Tarbiyah",
    "className": "3 INT A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_IMADUDIN_A_kamis_6_6B_24",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Mantiq",
    "className": "6B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_IMADUDIN_A_jumat_1_6B_25",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Mantiq",
    "className": "6B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_IMADUDIN_A_jumat_2_3A2_26",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Usul Fiqh",
    "className": "3A2",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_IMADUDIN_A_jumat_3_3A1_27",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Usul Fiqh",
    "className": "3A1",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_IMADUDIN_A_sabtu_5_3A1_35",
    "teacher": "IMADUDIN ABDUSSALAM.S.Ag",
    "subject": "Usul Fiqh",
    "className": "3A1",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_HABIB_B_S_senin_2_5A_2",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "5A",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_HABIB_B_S_senin_3_3A2_3",
    "teacher": "HABIB B.S",
    "subject": "B.inggris",
    "className": "3A2",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_HABIB_B_S_senin_4_5A_4",
    "teacher": "HABIB B.S",
    "subject": "Tarikh Adab",
    "className": "5A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_HABIB_B_S_senin_5_3A1_5",
    "teacher": "HABIB B.S",
    "subject": "B.inggris",
    "className": "3A1",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_HABIB_B_S_senin_6_5A_6",
    "teacher": "HABIB B.S",
    "subject": "Mutholaah",
    "className": "5A",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_HABIB_B_S_rabu_3_6B_15",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "6B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_HABIB_B_S_rabu_4_5A_16",
    "teacher": "HABIB B.S",
    "subject": "Mahfudzot",
    "className": "5A",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_HABIB_B_S_rabu_5_3_INT_A_17",
    "teacher": "HABIB B.S",
    "subject": "B.inggris",
    "className": "3 INT A",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_HABIB_B_S_rabu_6_5A_18",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "5A",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_HABIB_B_S_kamis_2_6A_20",
    "teacher": "HABIB B.S",
    "subject": "Al Insya'",
    "className": "6A",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_HABIB_B_S_kamis_3_6B_21",
    "teacher": "HABIB B.S",
    "subject": "Grammar",
    "className": "6B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_HABIB_B_S_kamis_4_3A2_22",
    "teacher": "HABIB B.S",
    "subject": "Grammar",
    "className": "3A2",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_HABIB_B_S_kamis_5_5B_23",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "5B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_HABIB_B_S_kamis_6_6A_24",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "6A",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_HABIB_B_S_jumat_1_6A_25",
    "teacher": "HABIB B.S",
    "subject": "Al Insya'",
    "className": "6A",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_HABIB_B_S_jumat_2_6A_26",
    "teacher": "HABIB B.S",
    "subject": "Grammar",
    "className": "6A",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_HABIB_B_S_jumat_3_6B_27",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "6B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_HABIB_B_S_sabtu_2_5B_32",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "5B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_HABIB_B_S_sabtu_4_6A_34",
    "teacher": "HABIB B.S",
    "subject": "B.inggris",
    "className": "6A",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_HABIB_B_S_sabtu_5_5A_35",
    "teacher": "HABIB B.S",
    "subject": "Mutholaah",
    "className": "5A",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_HABIB_B_S_sabtu_6_6A_36",
    "teacher": "HABIB B.S",
    "subject": "Usul Fiqh",
    "className": "6A",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_YETI_FARIK_rabu_3_1B_15",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Fiqh",
    "className": "1B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_YETI_FARIK_rabu_5_1A1_17",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Fiqh",
    "className": "1A1",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_YETI_FARIK_rabu_6_1A2_18",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Tarikh Islam",
    "className": "1A2",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_YETI_FARIK_kamis_2_1B_20",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Fiqh",
    "className": "1B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_YETI_FARIK_kamis_3_1A1_21",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Fiqh",
    "className": "1A1",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_YETI_FARIK_kamis_5_1A2_23",
    "teacher": "YETI FARIKHAH,S.Pd.I",
    "subject": "Tarikh Islam",
    "className": "1A2",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_ANA_MARIA__senin_2_1_INT_B_2",
    "teacher": "ANA MARIA ULFA",
    "subject": "Hadits",
    "className": "1 INT B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_ANA_MARIA__rabu_6_1_INT_B_18",
    "teacher": "ANA MARIA ULFA",
    "subject": "Hadits",
    "className": "1 INT B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_ANA_MARIA__kamis_5_1_INT_B_23",
    "teacher": "ANA MARIA ULFA",
    "subject": "Fiqh",
    "className": "1 INT B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_ANA_MARIA__sabtu_2_1_INT_B_32",
    "teacher": "ANA MARIA ULFA",
    "subject": "Fiqh",
    "className": "1 INT B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_ANA_MARIA__sabtu_5_2B_35",
    "teacher": "ANA MARIA ULFA",
    "subject": "Hadits",
    "className": "2B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_AFRILLIA_P_sabtu_2_3_INT_B_32",
    "teacher": "AFRILLIA PUTRI KANSA",
    "subject": "IPS",
    "className": "3 INT B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_AFRILLIA_P_sabtu_3_2B_33",
    "teacher": "AFRILLIA PUTRI KANSA",
    "subject": "IPA",
    "className": "2B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AFRILLIA_P_sabtu_4_3B_34",
    "teacher": "AFRILLIA PUTRI KANSA",
    "subject": "IPA",
    "className": "3B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_AFRILLIA_P_sabtu_5_3_INT_B_35",
    "teacher": "AFRILLIA PUTRI KANSA",
    "subject": "IPA",
    "className": "3 INT B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_AFRILLIA_P_sabtu_6_6B_36",
    "teacher": "AFRILLIA PUTRI KANSA",
    "subject": "IPS",
    "className": "6B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_AKHMAD_FAD_senin_2_5B_2",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "5B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_AKHMAD_FAD_senin_3_6A_3",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "6A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_AKHMAD_FAD_senin_4_3A1_4",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "3A1",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_AKHMAD_FAD_selasa_4_1A2_10",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "1A2",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_AKHMAD_FAD_selasa_5_3A2_11",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "3A2",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_AKHMAD_FAD_selasa_6_2A_12",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "2A",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_AKHMAD_FAD_rabu_2_1A1_14",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "1A1",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_AKHMAD_FAD_rabu_3_1A2_15",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "1A2",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_AKHMAD_FAD_rabu_5_6A_17",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "6A",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_AKHMAD_FAD_kamis_4_6B_22",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "6B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_AKHMAD_FAD_kamis_5_6B_23",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "6B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_AKHMAD_FAD_kamis_6_3_INT_A_24",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "3 INT A",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_AKHMAD_FAD_jumat_1_5A_25",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "5A",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_AKHMAD_FAD_jumat_2_1A1_26",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "1A1",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_AKHMAD_FAD_sabtu_2_3A1_32",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "3A1",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_AKHMAD_FAD_sabtu_3_2A_33",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "B.Indonesia",
    "className": "2A",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AKHMAD_FAD_sabtu_4_3_INT_A_34",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "3 INT A",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_AKHMAD_FAD_sabtu_6_3A2_36",
    "teacher": "AKHMAD FADLI,S.Pd",
    "subject": "PPKN",
    "className": "3A2",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_senin_2_2A_2",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "2A",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_NUR_KHAMID_senin_4_6A_4",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "6A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_NUR_KHAMID_senin_6_1B_6",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "1B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_selasa_2_6B_8",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "6B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_NUR_KHAMID_selasa_5_3B_11",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "3B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_NUR_KHAMID_selasa_6_1_INT_B_12",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "1 INT B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_rabu_4_2B_16",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "2B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_NUR_KHAMID_rabu_5_3A2_17",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "3A2",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_NUR_KHAMID_rabu_6_5B_18",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "5B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_kamis_2_1A1_20",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "1A1",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_NUR_KHAMID_kamis_3_5A_21",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "5A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_NUR_KHAMID_kamis_4_3_INT_A_22",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "3 INT A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_NUR_KHAMID_kamis_6_3_INT_B_24",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung MTK",
    "className": "3 INT B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_jumat_1_1A2_25",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "1A2",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_NUR_KHAMID_jumat_2_3A1_26",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "3A1",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_NUR_KHAMID_jumat_3_1_INT_A_27",
    "teacher": "NUR KHAMIDAH M.Pd.I",
    "subject": "Berhitung/ MTK",
    "className": "1 INT A",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_TAUSIA_RAH_senin_3_2B_3",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_TAUSIA_RAH_senin_4_2B_4",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_TAUSIA_RAH_selasa_3_2B_9",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_TAUSIA_RAH_selasa_4_2B_10",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_TAUSIA_RAH_rabu_2_2B_14",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_TAUSIA_RAH_rabu_3_2B_15",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_TAUSIA_RAH_kamis_2_2B_20",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_TAUSIA_RAH_kamis_3_2B_21",
    "teacher": "TAUSIA RAHMA",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_NURANTI_SA_senin_3_2B_3",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_NURANTI_SA_senin_4_2B_4",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_NURANTI_SA_selasa_3_2B_9",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_NURANTI_SA_selasa_4_2B_10",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_NURANTI_SA_rabu_2_2B_14",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_NURANTI_SA_rabu_3_2B_15",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_NURANTI_SA_kamis_2_2B_20",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_NURANTI_SA_kamis_3_2B_21",
    "teacher": "NURANTI SAFIRA MUHTAR",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_SIEVANA_CH_senin_2_2B_2",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "2B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_SIEVANA_CH_senin_3_1_INT_B_3",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "1 INT B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_SIEVANA_CH_senin_5_3_INT_B_5",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "Grammar",
    "className": "3 INT B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_SIEVANA_CH_selasa_2_1B_8",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "1B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_SIEVANA_CH_rabu_3_3B_15",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "Grammar",
    "className": "3B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_SIEVANA_CH_kamis_4_3_INT_B_22",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "3 INT B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_SIEVANA_CH_jumat_2_2B_26",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "2B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_SIEVANA_CH_jumat_3_3B_27",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "3B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_SIEVANA_CH_sabtu_4_1B_34",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "1B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_SIEVANA_CH_sabtu_6_1_INT_B_36",
    "teacher": "SIEVANA CHOIRUL SALWA",
    "subject": "B.inggris",
    "className": "1 INT B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_selasa_4_1_INT_B_10",
    "teacher": "NUR KHAMIDIYAH,S.H.I",
    "subject": "Khot",
    "className": "1 INT B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_NUR_KHAMID_selasa_5_1_INT_A_11",
    "teacher": "NUR KHAMIDIYAH,S.H.I",
    "subject": "Khot",
    "className": "1 INT A",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_NUR_KHAMID_selasa_6_1B_12",
    "teacher": "NUR KHAMIDIYAH,S.H.I",
    "subject": "Khot",
    "className": "1B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_NUR_KHAMID_sabtu_2_1A2_32",
    "teacher": "NUR KHAMIDIYAH,S.H.I",
    "subject": "Khot",
    "className": "1A2",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_NUR_KHAMID_sabtu_5_1A1_35",
    "teacher": "NUR KHAMIDIYAH,S.H.I",
    "subject": "Khot",
    "className": "1A1",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_IKFINA_FAR_senin_3_1B_3",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Tarikh Islam",
    "className": "1B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_IKFINA_FAR_senin_4_1_INT_B_4",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Shorf",
    "className": "1 INT B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_IKFINA_FAR_senin_6_3B_6",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "3B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_IKFINA_FAR_selasa_3_3_INT_B_9",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "3 INT B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_IKFINA_FAR_selasa_4_1B_10",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Tarikh Islam",
    "className": "1B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_IKFINA_FAR_selasa_5_1_INT_B_11",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Tarikh Islam",
    "className": "1 INT B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_IKFINA_FAR_selasa_6_2B_12",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Tarikh Islam",
    "className": "2B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_IKFINA_FAR_rabu_2_3B_14",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Shorf",
    "className": "3B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_IKFINA_FAR_rabu_3_3_INT_B_15",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Shorf",
    "className": "3 INT B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_IKFINA_FAR_rabu_5_1_INT_B_17",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "1 INT B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_IKFINA_FAR_rabu_6_3_INT_B_18",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "3 INT B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_IKFINA_FAR_kamis_2_1_INT_B_20",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Tarikh Islam",
    "className": "1 INT B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_IKFINA_FAR_kamis_4_1_INT_B_22",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "1 INT B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_IKFINA_FAR_kamis_6_3B_24",
    "teacher": "IKFINA FARHANI SYIHAB S.Pd",
    "subject": "Nahwu",
    "className": "3B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_KHAFIDZ_SY_senin_3_3B_3",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_KHAFIDZ_SY_senin_4_3_INT_A_4",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3 INT A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_KHAFIDZ_SY_senin_5_2A_5",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "2A",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_KHAFIDZ_SY_senin_6_3_INT_B_6",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3 INT B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_KHAFIDZ_SY_selasa_2_3_INT_A_8",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3 INT A",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_KHAFIDZ_SY_selasa_3_3B_9",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_KHAFIDZ_SY_selasa_4_3_INT_B_10",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3 INT B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_KHAFIDZ_SY_selasa_5_2B_11",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "2B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_KHAFIDZ_SY_selasa_6_3_INT_A_12",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3 INT A",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_KHAFIDZ_SY_rabu_2_3_INT_B_14",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3 INT B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_KHAFIDZ_SY_rabu_3_3A2_15",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3A2",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_KHAFIDZ_SY_rabu_4_3A1_16",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3A1",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_KHAFIDZ_SY_rabu_5_2B_17",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "2B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_KHAFIDZ_SY_rabu_6_3A2_18",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3A2",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_KHAFIDZ_SY_kamis_2_3A2_20",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3A2",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_KHAFIDZ_SY_kamis_3_3_INT_B_21",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3 INT B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_KHAFIDZ_SY_kamis_4_3B_22",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_KHAFIDZ_SY_kamis_5_3_INT_A_23",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3 INT A",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_KHAFIDZ_SY_kamis_6_2A_24",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "2A",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_KHAFIDZ_SY_sabtu_3_3B_33",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Mutholaah",
    "className": "3B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_KHAFIDZ_SY_sabtu_4_3A1_34",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3A1",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_KHAFIDZ_SY_sabtu_5_3A2_35",
    "teacher": "KHAFIDZ SYAHRUL MUBAROK,S.Pd.I",
    "subject": "Al Insya'",
    "className": "3A2",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_FAHRI_NURU_senin_2_3_INT_B_2",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "3 INT B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_FAHRI_NURU_senin_3_5B_3",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Nahwu",
    "className": "5B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_FAHRI_NURU_senin_5_5B_5",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "5B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_FAHRI_NURU_selasa_2_3B_8",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "3B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_FAHRI_NURU_selasa_3_5A_9",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "5A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_FAHRI_NURU_selasa_4_3_INT_A_10",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "3 INT A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_FAHRI_NURU_rabu_4_3_INT_B_16",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "3 INT B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_FAHRI_NURU_kamis_2_6B_20",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "6B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_FAHRI_NURU_kamis_3_5B_21",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "5B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_FAHRI_NURU_kamis_5_6A_23",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Membaca Kitab Fathul Qorib",
    "className": "6A",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_FAHRI_NURU_jumat_2_3_INT_B_26",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "3 INT B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_FAHRI_NURU_jumat_3_5A_27",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "5A",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_FAHRI_NURU_sabtu_3_5B_33",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Nahwu",
    "className": "5B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_FAHRI_NURU_sabtu_6_3_INT_A_36",
    "teacher": "FAHRI NURUZAMAN,S.H, S.Ag",
    "subject": "Tauhid",
    "className": "3 INT A",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_DARMADI_S__senin_2_1A1_2",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "1A1",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_DARMADI_S__senin_3_6B_3",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "6B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_DARMADI_S__senin_5_5A_5",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "5A",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_DARMADI_S__senin_6_3_INT_A_6",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "3 INT A",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_DARMADI_S__selasa_5_5B_11",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "5B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_DARMADI_S__selasa_6_1A1_12",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "1A1",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_DARMADI_S__rabu_2_3A2_14",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "3A2",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_DARMADI_S__rabu_4_1A2_16",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "1A2",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_DARMADI_S__kamis_2_3_INT_A_20",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "3 INT A",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_DARMADI_S__kamis_5_2A_23",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "2A",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_DARMADI_S__kamis_6_3A1_24",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "3A1",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_DARMADI_S__jumat_3_2A_27",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "2A",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_DARMADI_S__sabtu_2_3A2_32",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "3A2",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_DARMADI_S__sabtu_3_6A_33",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "6A",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_DARMADI_S__sabtu_4_1A2_34",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "1A2",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_DARMADI_S__sabtu_5_6A_35",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPA",
    "className": "6A",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_DARMADI_S__sabtu_6_3A1_36",
    "teacher": "DARMADI,S.Pd",
    "subject": "IPS",
    "className": "3A1",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_LINDHA_MAS_senin_5_3B_5",
    "teacher": "LINDHA MASKHUROH",
    "subject": "B.Indonesia",
    "className": "3B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_LINDHA_MAS_selasa_3_1B_9",
    "teacher": "LINDHA MASKHUROH",
    "subject": "Akhlaq",
    "className": "1B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_LINDHA_MAS_rabu_2_1B_14",
    "teacher": "LINDHA MASKHUROH",
    "subject": "Akhlaq",
    "className": "1B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_LINDHA_MAS_jumat_3_1B_27",
    "teacher": "LINDHA MASKHUROH",
    "subject": "IPA",
    "className": "1B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_AYUN_KINAN_senin_2_1B_2",
    "teacher": "AYUN KINANA",
    "subject": "IPS",
    "className": "1B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_AYUN_KINAN_selasa_6_3B_12",
    "teacher": "AYUN KINANA",
    "subject": "IPS",
    "className": "3B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_AYUN_KINAN_kamis_4_2B_22",
    "teacher": "AYUN KINANA",
    "subject": "IPS",
    "className": "2B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_AYUN_KINAN_sabtu_5_1_INT_B_35",
    "teacher": "AYUN KINANA",
    "subject": "Tauhid",
    "className": "1 INT B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_ANGGUN_LOL_jumat_1_3B_25",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Mahfudzot",
    "className": "3B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_ANGGUN_LOL_jumat_2_1B_26",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Al Insya'",
    "className": "1B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_ANGGUN_LOL_jumat_3_1_INT_B_27",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Imla'",
    "className": "1 INT B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_ANGGUN_LOL_sabtu_2_1B_32",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Al Insya'",
    "className": "1B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_ANGGUN_LOL_sabtu_4_1_INT_B_34",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Imla'",
    "className": "1 INT B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_ANGGUN_LOL_sabtu_6_3B_36",
    "teacher": "ANGGUN LOLYKA HASTUTI",
    "subject": "Mahfudzot",
    "className": "3B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_TRI_WIDYAN_rabu_4_1_INT_B_16",
    "teacher": "TRI WIDYANINGSIH",
    "subject": "Akhlaq",
    "className": "1 INT B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_TRI_WIDYAN_kamis_3_1_INT_B_21",
    "teacher": "TRI WIDYANINGSIH",
    "subject": "Akhlaq",
    "className": "1 INT B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_AFIFA_AL_M_jumat_1_1B_25",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Mahfudzot",
    "className": "1B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_AFIFA_AL_M_jumat_2_1_INT_B_26",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Al Insya'",
    "className": "1 INT B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_AFIFA_AL_M_jumat_3_3_INT_B_27",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Mahfudzot",
    "className": "3 INT B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_AFIFA_AL_M_sabtu_3_1_INT_B_33",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Al Insya'",
    "className": "1 INT B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AFIFA_AL_M_sabtu_4_3_INT_B_34",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Mahfudzot",
    "className": "3 INT B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_AFIFA_AL_M_sabtu_6_1B_36",
    "teacher": "AFIFA AL MUMTAZA",
    "subject": "Mahfudzot",
    "className": "1B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_M_ZAYYIN_K_selasa_2_1A2_8",
    "teacher": "M.ZAYYIN KHOTMANA,Lc",
    "subject": "Akhlaq",
    "className": "1A2",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_M_ZAYYIN_K_selasa_5_1A1_11",
    "teacher": "M.ZAYYIN KHOTMANA,Lc",
    "subject": "Akhlaq",
    "className": "1A1",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_M_ZAYYIN_K_rabu_2_1A2_14",
    "teacher": "M.ZAYYIN KHOTMANA,Lc",
    "subject": "Akhlaq",
    "className": "1A2",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_M_ZAYYIN_K_rabu_5_2A_17",
    "teacher": "M.ZAYYIN KHOTMANA,Lc",
    "subject": "Hadits",
    "className": "2A",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_M_ZAYYIN_K_rabu_6_1A1_18",
    "teacher": "M.ZAYYIN KHOTMANA,Lc",
    "subject": "Akhlaq",
    "className": "1A1",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_RIVAI_rabu_2_3A1_14",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "3A1",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_RIVAI_rabu_4_2A_16",
    "teacher": "RIVAI",
    "subject": "Fiqh",
    "className": "2A",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_RIVAI_kamis_2_2A_20",
    "teacher": "RIVAI",
    "subject": "Fiqh",
    "className": "2A",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_RIVAI_kamis_3_3A1_21",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "3A1",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_RIVAI_kamis_4_1A1_22",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "1A1",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_RIVAI_jumat_1_3A2_25",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "3A2",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_RIVAI_sabtu_2_1_INT_A_32",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "1 INT A",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_RIVAI_sabtu_3_3A2_33",
    "teacher": "RIVAI",
    "subject": "Tauhid",
    "className": "3A2",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_ABDUL_GHON_senin_3_2A_3",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_ABDUL_GHON_senin_4_2A_4",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_ABDUL_GHON_selasa_3_2A_9",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_ABDUL_GHON_selasa_4_2A_10",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_ABDUL_GHON_selasa_6_3A2_12",
    "teacher": "ABDUL GHONI",
    "subject": "Nahwu",
    "className": "3A2",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_ABDUL_GHON_rabu_2_2A_14",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_ABDUL_GHON_rabu_3_2A_15",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_ABDUL_GHON_kamis_3_2A_21",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_ABDUL_GHON_kamis_4_2A_22",
    "teacher": "ABDUL GHONI",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_ABDUL_GHON_kamis_5_3A2_23",
    "teacher": "ABDUL GHONI",
    "subject": "Nahwu",
    "className": "3A2",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_ABDUL_LATI_senin_3_2A_3",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_ABDUL_LATI_senin_4_2A_4",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_ABDUL_LATI_selasa_3_2A_9",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_ABDUL_LATI_selasa_4_2A_10",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_ABDUL_LATI_selasa_6_3A1_12",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Nahwu",
    "className": "3A1",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_ABDUL_LATI_rabu_2_2A_14",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_ABDUL_LATI_rabu_3_2A_15",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_ABDUL_LATI_kamis_3_2A_21",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_ABDUL_LATI_kamis_4_2A_22",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_ABDUL_LATI_kamis_5_3A1_23",
    "teacher": "ABDUL LATIF KHOIRY",
    "subject": "Nahwu",
    "className": "3A1",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_AHMAD_DANI_selasa_2_1A1_8",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1A1",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_AHMAD_DANI_selasa_4_1A1_10",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "Hadits",
    "className": "1A1",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_AHMAD_DANI_selasa_6_1_INT_A_12",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1 INT A",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_AHMAD_DANI_kamis_5_1A1_23",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1A1",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_AHMAD_DANI_kamis_6_1A2_24",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1A2",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_AHMAD_DANI_jumat_2_2A_26",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "2A",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_AHMAD_DANI_sabtu_2_2A_32",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "2A",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_AHMAD_DANI_sabtu_3_1A2_33",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1A2",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AHMAD_DANI_sabtu_5_1_INT_A_35",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "B.inggris",
    "className": "1 INT A",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_AHMAD_DANI_sabtu_6_1A1_36",
    "teacher": "AHMAD DANIAL NURROFII",
    "subject": "Hadits",
    "className": "1A1",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_WIHDAH_DZA_senin_4_1B_4",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Imla'",
    "className": "1B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_WIHDAH_DZA_selasa_2_2B_8",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Al Insya'",
    "className": "2B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_WIHDAH_DZA_kamis_3_1B_21",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Hadits",
    "className": "1B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_WIHDAH_DZA_kamis_4_1B_22",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "B.Indonesia",
    "className": "1B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_WIHDAH_DZA_kamis_6_1_INT_B_24",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Mahfudzot",
    "className": "1 INT B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_WIHDAH_DZA_jumat_1_1_INT_B_25",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Mahfudzot",
    "className": "1 INT B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_WIHDAH_DZA_jumat_2_3B_26",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "PPKN",
    "className": "3B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_WIHDAH_DZA_sabtu_3_1B_33",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Imla'",
    "className": "1B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_WIHDAH_DZA_sabtu_5_1B_35",
    "teacher": "WIHDAH DZAWI ISQ",
    "subject": "Hadits",
    "className": "1B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_DEWI_FATIM_senin_6_2B_6",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "PPKN",
    "className": "2B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_DEWI_FATIM_selasa_5_1B_11",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "PPKN",
    "className": "1B",
    "day": "SELASA",
    "period": 5
  },
  {
    "id": "sch_DEWI_FATIM_selasa_6_3_INT_B_12",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "PPKN",
    "className": "3 INT B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_DEWI_FATIM_kamis_2_3B_20",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "Tarbiyah",
    "className": "3B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_DEWI_FATIM_kamis_6_2B_24",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "B.Indonesia",
    "className": "2B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_DEWI_FATIM_jumat_1_3_INT_B_25",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "B.Indonesia",
    "className": "3 INT B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_DEWI_FATIM_sabtu_2_2B_32",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "Imla'",
    "className": "2B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_DEWI_FATIM_sabtu_6_2B_36",
    "teacher": "DEWI FATIMAH ARLITA MAHARANI",
    "subject": "Durusul lughoh",
    "className": "2B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_FARIDA_HUS_senin_3_2B_3",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_FARIDA_HUS_senin_4_2B_4",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_FARIDA_HUS_selasa_3_2B_9",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_FARIDA_HUS_selasa_4_2B_10",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_FARIDA_HUS_rabu_2_2B_14",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_FARIDA_HUS_rabu_3_2B_15",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_FARIDA_HUS_kamis_2_2B_20",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_FARIDA_HUS_kamis_3_2B_21",
    "teacher": "FARIDA HUSIN ASSEGAF",
    "subject": "Al Miftah",
    "className": "2B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_IBRAHIM_HA_senin_3_2A_3",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_IBRAHIM_HA_senin_4_2A_4",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_IBRAHIM_HA_selasa_3_2A_9",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_IBRAHIM_HA_selasa_4_2A_10",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_IBRAHIM_HA_rabu_2_2A_14",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_IBRAHIM_HA_rabu_3_2A_15",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_IBRAHIM_HA_kamis_3_2A_21",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_IBRAHIM_HA_kamis_4_2A_22",
    "teacher": "IBRAHIM HASAN MUBAROK",
    "subject": "Al Miftah",
    "className": "2A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_IR_senin_2_3_INT_A_2",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Nahwu",
    "className": "3 INT A",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_IR_senin_5_3_INT_A_5",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Nahwu",
    "className": "3 INT A",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_MOHAMAD_IR_senin_6_6B_6",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "6B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_IR_rabu_2_6B_14",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "6B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_IR_rabu_4_1B_16",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Tauhid",
    "className": "1B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_IR_rabu_6_3_INT_A_18",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "3 INT A",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_IR_kamis_2_5A_20",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "5A",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_IR_kamis_3_1_INT_A_21",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "1 INT A",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_IR_kamis_4_5A_22",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "5A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_IR_kamis_6_5B_24",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "5B",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_IR_jumat_1_5B_25",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Fiqh",
    "className": "5B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_MOHAMAD_IR_jumat_3_2B_27",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "2B",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_IR_sabtu_4_1_INT_A_34",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "1 INT A",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_IR_sabtu_5_2A_35",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "2A",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_MOHAMAD_IR_sabtu_6_3_INT_B_36",
    "teacher": "MOHAMAD IRFANGI",
    "subject": "Akhlaq",
    "className": "3 INT B",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_FA_senin_4_1_INT_A_4",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Nahwu",
    "className": "1 INT A",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_FA_senin_6_1_INT_A_6",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "1 INT A",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_FA_selasa_2_5A_8",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Balaghoh",
    "className": "5A",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_FA_selasa_3_3_INT_A_9",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Usul Fiqh",
    "className": "3 INT A",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_FA_selasa_4_1_INT_A_10",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "1 INT A",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_FA_rabu_3_6A_15",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "6A",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_FA_rabu_4_1_INT_A_16",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Nahwu",
    "className": "1 INT A",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_FA_rabu_5_3B_17",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Tauhid",
    "className": "3B",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_MOHAMAD_FA_rabu_6_2B_18",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Tauhid",
    "className": "2B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_MOHAMAD_FA_kamis_2_3_INT_B_20",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Usul Fiqh",
    "className": "3 INT B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_FA_kamis_3_3B_21",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Tauhid",
    "className": "3B",
    "day": "KAMIS",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_FA_kamis_4_5B_22",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Balaghoh",
    "className": "5B",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_FA_kamis_5_5A_23",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Balaghoh",
    "className": "5A",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_MOHAMAD_FA_jumat_1_2B_25",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "2B",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_MOHAMAD_FA_jumat_2_5B_26",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Balaghoh",
    "className": "5B",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_FA_sabtu_2_6A_32",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "6A",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_MOHAMAD_FA_sabtu_3_3_INT_B_33",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Usul Fiqh",
    "className": "3 INT B",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_MOHAMAD_FA_sabtu_4_2B_34",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Fiqh",
    "className": "2B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_MOHAMAD_FA_sabtu_5_3_INT_A_35",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Usul Fiqh",
    "className": "3 INT A",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_MOHAMAD_FA_sabtu_6_2A_36",
    "teacher": "MOHAMAD FATHUROHMAN,LC",
    "subject": "Tauhid",
    "className": "2A",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_JAMILATUN__senin_2_3B_2",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Usul Fiqh",
    "className": "3B",
    "day": "SENIN",
    "period": 2
  },
  {
    "id": "sch_JAMILATUN__senin_4_5B_4",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Tarbiyah",
    "className": "5B",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_JAMILATUN__senin_5_1_INT_B_5",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_JAMILATUN__senin_6_1_INT_B_6",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_JAMILATUN__selasa_2_1_INT_B_8",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "SELASA",
    "period": 2
  },
  {
    "id": "sch_JAMILATUN__selasa_3_1_INT_B_9",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "SELASA",
    "period": 3
  },
  {
    "id": "sch_JAMILATUN__selasa_4_5B_10",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Mahfudzot",
    "className": "5B",
    "day": "SELASA",
    "period": 4
  },
  {
    "id": "sch_JAMILATUN__selasa_6_5B_12",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Tarbiyah",
    "className": "5B",
    "day": "SELASA",
    "period": 6
  },
  {
    "id": "sch_JAMILATUN__rabu_2_1_INT_B_14",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_JAMILATUN__rabu_3_1_INT_B_15",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Durusul lughoh",
    "className": "1 INT B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_JAMILATUN__rabu_4_5B_16",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Mutholaah",
    "className": "5B",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_JAMILATUN__rabu_6_6B_18",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Al Insya'",
    "className": "6B",
    "day": "RABU",
    "period": 6
  },
  {
    "id": "sch_JAMILATUN__kamis_2_5B_20",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Mutholaah",
    "className": "5B",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_JAMILATUN__kamis_5_3_INT_B_23",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Tarikh Islam",
    "className": "3 INT B",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_JAMILATUN__sabtu_2_3B_32",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Usul Fiqh",
    "className": "3B",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_JAMILATUN__sabtu_4_5B_34",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Tarikh Adab",
    "className": "5B",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_JAMILATUN__sabtu_5_6B_35",
    "teacher": "JAMILATUN NAFIAH,S.SA",
    "subject": "Al Insya'",
    "className": "6B",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_AHMAD_ILHA_senin_3_1A2_3",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Mahfudzot",
    "className": "1A2",
    "day": "SENIN",
    "period": 3
  },
  {
    "id": "sch_AHMAD_ILHA_kamis_2_1_INT_A_20",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Mahfudzot",
    "className": "1 INT A",
    "day": "KAMIS",
    "period": 2
  },
  {
    "id": "sch_AHMAD_ILHA_kamis_4_1_INT_A_22",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Imla'",
    "className": "1 INT A",
    "day": "KAMIS",
    "period": 4
  },
  {
    "id": "sch_AHMAD_ILHA_kamis_6_1_INT_A_24",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Mahfudzot",
    "className": "1 INT A",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_AHMAD_ILHA_jumat_2_1_INT_A_26",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Tarikh Islam",
    "className": "1 INT A",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_AHMAD_ILHA_jumat_3_1A1_27",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Imla'",
    "className": "1A1",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_AHMAD_ILHA_sabtu_3_1_INT_A_33",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Tarikh Islam",
    "className": "1 INT A",
    "day": "SABTU",
    "period": 3
  },
  {
    "id": "sch_AHMAD_ILHA_sabtu_4_1A1_34",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Imla'",
    "className": "1A1",
    "day": "SABTU",
    "period": 4
  },
  {
    "id": "sch_AHMAD_ILHA_sabtu_5_1A2_35",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Mahfudzot",
    "className": "1A2",
    "day": "SABTU",
    "period": 5
  },
  {
    "id": "sch_AHMAD_ILHA_sabtu_6_1_INT_A_36",
    "teacher": "AHMAD ILHAM PERMANA",
    "subject": "Imla'",
    "className": "1 INT A",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_MOCH_BAISH_senin_4_1A1_4",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Mahfudzot",
    "className": "1A1",
    "day": "SENIN",
    "period": 4
  },
  {
    "id": "sch_MOCH_BAISH_senin_5_1_INT_A_5",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Hadits",
    "className": "1 INT A",
    "day": "SENIN",
    "period": 5
  },
  {
    "id": "sch_MOCH_BAISH_senin_6_1A2_6",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Imla'",
    "className": "1A2",
    "day": "SENIN",
    "period": 6
  },
  {
    "id": "sch_MOCH_BAISH_kamis_5_1_INT_A_23",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Hadits",
    "className": "1 INT A",
    "day": "KAMIS",
    "period": 5
  },
  {
    "id": "sch_MOCH_BAISH_kamis_6_1A1_24",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Tarikh Islam",
    "className": "1A1",
    "day": "KAMIS",
    "period": 6
  },
  {
    "id": "sch_MOCH_BAISH_jumat_1_1A1_25",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Tarikh Islam",
    "className": "1A1",
    "day": "JUMAT",
    "period": 1
  },
  {
    "id": "sch_MOCH_BAISH_jumat_2_1A2_26",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Imla'",
    "className": "1A2",
    "day": "JUMAT",
    "period": 2
  },
  {
    "id": "sch_MOCH_BAISH_jumat_3_1A2_27",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Hadits",
    "className": "1A2",
    "day": "JUMAT",
    "period": 3
  },
  {
    "id": "sch_MOCH_BAISH_sabtu_2_1A1_32",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Mahfudzot",
    "className": "1A1",
    "day": "SABTU",
    "period": 2
  },
  {
    "id": "sch_MOCH_BAISH_sabtu_6_1A2_36",
    "teacher": "MOCH BAISH ALFARIZZY",
    "subject": "Hadits",
    "className": "1A2",
    "day": "SABTU",
    "period": 6
  },
  {
    "id": "sch_WAHIB_SYA__rabu_2_6A_14",
    "teacher": "WAHIB SYA'RONI, M.Ag",
    "subject": "Tarikh Adab",
    "className": "6A",
    "day": "RABU",
    "period": 2
  },
  {
    "id": "sch_WAHIB_SYA__rabu_3_5B_15",
    "teacher": "WAHIB SYA'RONI, M.Ag",
    "subject": "Mustolahul Hadits",
    "className": "5B",
    "day": "RABU",
    "period": 3
  },
  {
    "id": "sch_WAHIB_SYA__rabu_4_3_INT_A_16",
    "teacher": "WAHIB SYA'RONI, M.Ag",
    "subject": "Tarikh Islam",
    "className": "3 INT A",
    "day": "RABU",
    "period": 4
  },
  {
    "id": "sch_WAHIB_SYA__rabu_5_1A2_17",
    "teacher": "WAHIB SYA'RONI, M.Ag",
    "subject": "Tauhid",
    "className": "1A2",
    "day": "RABU",
    "period": 5
  },
  {
    "id": "sch_WAHIB_SYA__rabu_6_2A_18",
    "teacher": "WAHIB SYA'RONI, M.Ag",
    "subject": "Durusul lughoh",
    "className": "2A",
    "day": "RABU",
    "period": 6
  }
];

export const TEACHERS_LIST = Array.from(new Set(FULL_SCHEDULE.map(s => s.teacher))).sort();
export const CLASSES_LIST = Array.from(new Set(FULL_SCHEDULE.map(s => s.className))).sort();

export function getDayNameFromDate(dateStr: string): DayOfWeek | null {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  switch (dayIndex) {
    case 1: return 'SENIN';
    case 2: return 'SELASA';
    case 3: return 'RABU';
    case 4: return 'KAMIS';
    case 5: return 'JUMAT';
    case 6: return 'SABTU';
    default: return null; // Sunday / Ahad
  }
}

// Function to calculate class rank for sorting highest class to lowest class
export function getClassRank(className: string): number {
  const trimmed = className.trim().toUpperCase();
  const ranks: Record<string, number> = {
    '6A': 620,
    '6B': 610,
    '5A': 520,
    '5B': 510,
    '3A1': 330,
    '3A2': 325,
    '3 INT A': 320,
    '3B': 315,
    '3 INT B': 310,
    '2A': 220,
    '2B': 210,
    '1A1': 130,
    '1A2': 125,
    '1 INT A': 120,
    '1B': 115,
    '1 INT B': 110,
  };

  if (ranks[trimmed] !== undefined) {
    return ranks[trimmed];
  }

  // Fallback: extract leading digit
  const match = trimmed.match(/^([1-6])/);
  if (match) {
    const grade = parseInt(match[1], 10);
    const bonus = trimmed.includes('A') ? 20 : trimmed.includes('B') ? 10 : 0;
    return grade * 100 + bonus;
  }
  return 0;
}

export function isBaninClass(className: string): boolean {
  return className.toUpperCase().includes('A');
}

export function isBanatClass(className: string): boolean {
  return className.toUpperCase().includes('B');
}

