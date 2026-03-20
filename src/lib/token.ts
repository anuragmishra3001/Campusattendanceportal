export function buildAttendanceUrl(baseUrl: string, eventId: string, token: string, timestamp: number): string {
  const params = new URLSearchParams({ event: eventId, token, ts: timestamp.toString() });
  return `${baseUrl}/attendance?${params.toString()}`;
}

export function parseAttendanceParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    eventId: params.get("event") || "",
    token: params.get("token") || "",
    timestamp: parseInt(params.get("ts") || "0", 10),
  };
}
