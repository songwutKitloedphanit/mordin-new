"""
Process M2 calendars: generate QR -> receive+pair -> PATCH farmer data -> select for analysis
-> input results -> approve.
60 existing bookings across 12 calendars.

Handles partial state: if some samples are already in 'analyzing' state (selected but not
approved), completes them before processing any remaining unlinked bookings.
"""
import urllib.request
import urllib.error
import json
import sys

BASE = "http://localhost:3000"

FARMER_META = {
    "firstName": "ทดสอบอ้อย",
    "lastName": "เดโมโฟลว์",
    "phoneNumber": "0896060801",
    "thaiNationalId": "9990608000001",
    "serviceAreaId": 17,
    "dirtWeightOm": 0.0025,
    "dirtWeightMehlich": 0.003,
    "serviceTypeId": 7,
    "latitude": "16.431000",
    "longitude": "104.129000",
}

M2_CALS = [66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99]

# Pre-values per calendar index (varied per index mod 5 to avoid identical results)
# Lab order: pH, EC, OM-Abs, P-Abs, K-ppm, Ca-ppm, Mg-ppm
BASE_PV = [6.4, 0.34, 0.082, 0.186, 48.0, 720.0, 38.0]
DELTA   = [0.1, 0.02, 0.005, 0.010,  4.0,  40.0,  3.0]


def pre_vals(cal_idx: int):
    return [round(BASE_PV[i] + DELTA[i] * (cal_idx % 5), 4) for i in range(7)]


def api(method: str, path: str, body=None, token: str = None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f"  !! HTTP {e.code} on {method} {path}: {body_text[:300]}")
        return None


def login():
    r = api("POST", "/auth/login", {"username": "admin", "password": "admin123"})
    return r["data"]["access_token"]


def fill_and_approve(cal_id: int, samples: list, pvs: list, token: str) -> bool:
    """Fill pre-values and approve a list of samples (each with .result[] and .qrCode.book.bookId)."""
    # Only fill samples whose results don't have pre-values yet (preValue == 0)
    inputs = []
    for entry in samples:
        for res in entry.get("result", []):
            if res.get("preValue", 0) == 0:
                lab_idx = res["laboratoryId"] - 1  # lab IDs 1-7 -> index 0-6
                pv = pvs[lab_idx] if lab_idx < len(pvs) else 0.1
                inputs.append({"resultId": res["resultId"], "preValue": pv})

    if inputs:
        r = api("PATCH", "/results/input", inputs, token=token)
        if not r:
            print(f"  !! results/input failed")
            return False
        print(f"  Filled {len(inputs)} pre-values")
    else:
        print(f"  Pre-values already set, proceeding to approve")

    # bookId is nested: sample.qrCode.book.bookId
    book_ids = [s["qrCode"]["book"]["bookId"] for s in samples]
    r = api("PATCH", "/qr-codes/approve", {"bookIds": book_ids}, token=token)
    if not r:
        print(f"  !! approve failed")
        return False
    print(f"  Approved {len(book_ids)} QR codes [OK]")
    return True


def process_calendar(cal_id: int, cal_idx: int, token: str):
    print(f"\n--- Calendar {cal_id} (idx={cal_idx}) ---")
    pvs = pre_vals(cal_idx)

    # --- Step A: Complete any partially-processed (analyzing) samples ---
    results_data = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
    if results_data:
        not_approved = [s for s in results_data if s.get("qrCode", {}).get("status") != "approved"]
        approved     = [s for s in results_data if s.get("qrCode", {}).get("status") == "approved"]
        analyzing = not_approved  # alias for clarity (covers 'analyzing', 'analyzed', etc.)

        if analyzing:
            print(f"  Completing {len(analyzing)} analyzing samples (+ {len(approved)} already approved)")
            if not fill_and_approve(cal_id, analyzing, pvs, token):
                return False
        elif approved:
            print(f"  All {len(approved)} samples already approved, checking for unlinked...")

    # --- Step B: Process any remaining unlinked bookings ---
    books = api("GET", f"/books/booking/calendar/{cal_id}", token=token)
    # findBookingsByCalendarId returns ONLY unlinked (qrCodeId IS NULL) bookings
    if not books:
        # Re-fetch results to confirm all done
        results_final = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
        all_approved = results_final and all(
            s.get("qrCode", {}).get("status") == "approved" for s in results_final
        )
        if all_approved:
            print(f"  Calendar {cal_id} complete ({len(results_final)} approved) [OK]")
        else:
            print(f"  No unlinked bookings and no results -- nothing to do")
        return True

    print(f"  {len(books)} unlinked bookings to process")

    # Generate QR codes
    n = len(books)
    qr_list = api("POST", f"/qr-codes/generate/{n}",
                  {"type": "spread", "serviceCalendarId": cal_id}, token=token)
    if not qr_list or len(qr_list) != n:
        print(f"  !! QR generation failed: {qr_list}")
        return False
    print(f"  Generated {n} QR codes")

    book_ids = []
    for i, book in enumerate(books):
        qr_str  = qr_list[i]["qrCode"]
        book_id = book["bookId"]
        land_code = book["land"]["landCode"]
        land_name = book["land"]["name"]

        # Receive + pair QR to existing booking
        r = api("PATCH", f"/qr-codes/receive-sample/decrypted/{qr_str}",
                {"serviceCalendarId": cal_id, "bookId": book_id}, token=token)
        if not r or r.get("alreadyReceived"):
            print(f"  !! receiveSample failed book {book_id}: {r}")
            return False

        # PATCH QR with farmer/land metadata
        qr_id = r["qrCode"]["qrCodeId"]
        patch = {**FARMER_META, "landCode": land_code, "landName": land_name}
        r2 = api("PATCH", f"/qr-codes/{qr_id}", patch, token=token)
        if not r2:
            print(f"  !! qr-codes PATCH failed for qrId {qr_id}")
            return False

        book_ids.append(book_id)

    print(f"  Received and patched {len(book_ids)} QR codes")

    # Select for analysis (creates blank result rows)
    r = api("PATCH", f"/books/service-calendar/{cal_id}/selects", book_ids, token=token)
    if not r:
        print(f"  !! selectReceivedBooks failed")
        return False
    print(f"  Selected {len(r)} books for analysis")

    # Get results and fill + approve
    new_results = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
    if not new_results:
        print(f"  !! No results after select for calendar {cal_id}")
        return False

    new_samples = [s for s in new_results
                   if s.get("qrCode", {}).get("status") != "approved"]
    return fill_and_approve(cal_id, new_samples, pvs, token)


def main():
    print("=== Processing M2 calendars ===")
    token = login()
    print(f"Logged in (token={len(token)} chars)")

    ok = 0
    for idx, cal_id in enumerate(M2_CALS):
        if process_calendar(cal_id, idx, token):
            ok += 1
        else:
            print(f"  FAILED: calendar {cal_id}")

    print(f"\n=== Done: {ok}/{len(M2_CALS)} ===")


if __name__ == "__main__":
    main()
