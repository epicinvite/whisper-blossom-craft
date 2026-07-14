export const RSVP_SHEET_STORAGE_KEY = "rsvp_sheet_config";
export const RSVP_SHEET_ID = "1F9lVoqH-RSYylYAkqpn2LY6ZOhXut5c8CuK75BjhtVI";
export const RSVP_SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${RSVP_SHEET_ID}/edit?gid=0#gid=0`;
export const RSVP_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${RSVP_SHEET_ID}/export?format=csv&gid=0`;

export type RsvpAttendance = "attending" | "declined";

export type RsvpSheetConfig = {
  sheetId: string;
  csvUrl: string;
  scriptUrl: string;
  dashboardUsername: string;
  dashboardPassword: string;
};

export type RsvpFormSubmission = {
  name: string;
  phone: string;
  guests: string;
  message: string;
  attendance: RsvpAttendance;
};

export type RsvpSheetRow = {
  rowNumber: number;
  index: number;
  name: string;
  seats: number;
  phone: string;
  message: string;
  status: RsvpAttendance;
  rawStatus: string;
};

const DEFAULT_CONFIG: RsvpSheetConfig = {
  sheetId: RSVP_SHEET_ID,
  csvUrl: RSVP_SHEET_CSV_URL,
  scriptUrl: "",
  dashboardUsername: "sheintel",
  dashboardPassword: "082226",
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeAttendance(value: unknown, fallback: RsvpAttendance = "attending"): RsvpAttendance {
  const text = normalizeText(value).toLowerCase();
  if (text === "declined" || text === "no" || text === "unable to attend" || text === "not attending") {
    return "declined";
  }
  if (text === "attending" || text === "yes") {
    return "attending";
  }
  return fallback;
}

export function getDefaultSheetConfig(): RsvpSheetConfig {
  return { ...DEFAULT_CONFIG };
}

export function getSheetConfig(): RsvpSheetConfig {
  if (!isBrowser()) return getDefaultSheetConfig();

  try {
    const raw = localStorage.getItem(RSVP_SHEET_STORAGE_KEY);
    if (!raw) return getDefaultSheetConfig();

    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(raw),
    };
  } catch {
    return getDefaultSheetConfig();
  }
}

export function saveSheetConfig(patch: Partial<RsvpSheetConfig>) {
  if (!isBrowser()) return getDefaultSheetConfig();

  const next = {
    ...getDefaultSheetConfig(),
    ...getSheetConfig(),
    ...patch,
  };

  localStorage.setItem(RSVP_SHEET_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let entry = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === "\"") {
      if (insideQuote && nextChar === "\"") {
        entry += "\"";
        i++;
      } else {
        insideQuote = !insideQuote;
      }
      continue;
    }

    if (char === "," && !insideQuote) {
      row.push(entry);
      entry = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(entry);
      if (row.some((value) => normalizeText(value) !== "")) {
        rows.push(row);
      }
      row = [];
      entry = "";
      continue;
    }

    entry += char;
  }

  if (entry !== "" || row.length > 0) {
    row.push(entry);
    if (row.some((value) => normalizeText(value) !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function toSeats(value: unknown) {
  const parsed = Number.parseInt(normalizeText(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function mapSheetRow(row: string[], rowNumber: number, index: number): RsvpSheetRow {
  const legacyAttendance = normalizeText(row[4]).toLowerCase();
  const legacyDeclined = normalizeText(row[5]).toLowerCase();
  const rawStatus = normalizeText(row[5] ?? row[4] ?? row[0]);
  const status =
    rawStatus.toLowerCase() === "attending" ||
    legacyAttendance === "yes"
      ? "attending"
      : rawStatus.toLowerCase() === "declined" ||
        legacyDeclined === "yes" ||
        legacyAttendance === "no"
        ? "declined"
        : normalizeAttendance(rawStatus, "attending");

  return {
    rowNumber,
    index,
    name: normalizeText(row[1] ?? row[0]),
    seats: toSeats(row[2] ?? row[1]),
    phone: normalizeText(row[3] ?? row[2]),
    message: normalizeText(row[4] ?? row[3]),
    status,
    rawStatus,
  };
}

export function normalizeSheetRows(rows: string[][]): RsvpSheetRow[] {
  if (rows.length <= 1) return [];

  return rows
    .slice(1)
    .map((row, index) => mapSheetRow(row, index + 2, index + 1))
    .filter((row) => row.name !== "");
}

export async function fetchSheetRows(csvUrl?: string): Promise<RsvpSheetRow[]> {
  const targetUrl = normalizeText(csvUrl) || RSVP_SHEET_CSV_URL;
  const response = await fetch(targetUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to load the sheet CSV (${response.status}).`);
  }

  const csv = await response.text();
  return normalizeSheetRows(parseCsv(csv));
}

async function postToSheet(action: string, payload: Record<string, string | number>) {
  const config = getSheetConfig();
  const scriptUrl = normalizeText(config.scriptUrl);
  if (!scriptUrl) {
    throw new Error("Apps Script URL is not set.");
  }

  const body = new FormData();
  body.append("action", action);
  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, String(value ?? ""));
  });

  await fetch(scriptUrl, {
    method: "POST",
    mode: "no-cors",
    body,
  });
}

export async function submitRsvpToSheet(payload: RsvpFormSubmission) {
  await postToSheet("submitRsvp", {
    name: payload.name,
    guests: payload.guests,
    phone: payload.phone,
    message: payload.message,
    canAttend: payload.attendance === "attending" ? "Yes" : "",
    cantAttend: payload.attendance === "declined" ? "Yes" : "",
  });
}

export async function updateSheetRow(row: RsvpSheetRow, patch: Partial<RsvpFormSubmission>) {
  await postToSheet("updateGuest", {
    rowNumber: row.rowNumber,
    name: patch.name ?? row.name,
    guests: patch.guests ?? row.seats,
    phone: patch.phone ?? row.phone,
    message: patch.message ?? row.message,
    canAttend: (patch.attendance ?? row.status) === "attending" ? "Yes" : "",
    cantAttend: (patch.attendance ?? row.status) === "declined" ? "Yes" : "",
  });
}

export async function deleteSheetRow(row: RsvpSheetRow) {
  await postToSheet("deleteGuest", {
    rowNumber: row.rowNumber,
  });
}
