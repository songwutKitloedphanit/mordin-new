"""
Step 3: Create M3 bookings then process same QR pipeline as M2.

Land rotation:
  Group B (landIds 100-104): cals 67, 70, 73, 76
  Group C (landIds 105-109): cals 79, 82, 85, 88
  Group A (landIds  95- 99): cals 91, 94, 97, 100

For each calendar: create 5 bookings (one per land in group), then run the
same receive+pair -> PATCH -> select -> fill -> approve pipeline.
"""
import urllib.request
import urllib.error
import json
import sys
import time

BASE = "http://localhost:3000"
FARMER_ID = 78

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

# M3 calendars with land group assignments
# land_ids: list of 5 landIds to use for the 5 bookings
M3_CALS = [
    # (calId, [landIds])
    (67,  list(range(100, 105))),  # Group B
    (70,  list(range(100, 105))),  # Group B
    (73,  list(range(100, 105))),  # Group B
    (76,  list(range(100, 105))),  # Group B
    (79,  list(range(105, 110))),  # Group C
    (82,  list(range(105, 110))),  # Group C
    (85,  list(range(105, 110))),  # Group C
    (88,  list(range(105, 110))),  # Group C
    (91,  list(range(95,  100))),  # Group A
    (94,  list(range(95,  100))),  # Group A
    (97,  list(range(95,  100))),  # Group A
    (100, list(range(95,  100))),  # Group A
]

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


def fill_and_approve(samples: list, pvs: list, token: str) -> bool:
    """Fill pre-values and approve. samples have .result[] and .qrCode.book.bookId."""
    inputs = []
    for entry in samples:
        for res in entry.get("result", []):
            if res.get("preValue", 0) == 0:
                lab_idx = res["laboratoryId"] - 1
                pv = pvs[lab_idx] if lab_idx < len(pvs) else 0.1
                inputs.append({"resultId": res["resultId"], "preValue": pv})

    if inputs:
        r = api("PATCH", "/results/input", inputs, token=token)
        if not r:
            return False
        print(f"  Filled {len(inputs)} pre-values")
    else:
        print(f"  Pre-values already set")

    book_ids = [s["qrCode"]["book"]["bookId"] for s in samples]
    r = api("PATCH", "/qr-codes/approve", {"bookIds": book_ids}, token=token)
    if not r:
        print(f"  !! approve failed")
        return False
    print(f"  Approved {len(book_ids)} QR codes [OK]")
    return True


def process_calendar(cal_id: int, land_ids: list, cal_idx: int, token: str):
    print(f"\n--- Calendar {cal_id} (idx={cal_idx}, lands={land_ids}) ---")
    pvs = pre_vals(cal_idx)

    # --- Check if already processed (all approved) ---
    results_data = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
    if results_data:
        not_approved = [s for s in results_data if s.get("qrCode", {}).get("status") != "approved"]
        approved     = [s for s in results_data if s.get("qrCode", {}).get("status") == "approved"]

        if not_approved:
            print(f"  Completing {len(not_approved)} un-approved samples (+ {len(approved)} approved)")
            if not fill_and_approve(not_approved, pvs, token):
                return False
        elif approved:
            # Check for unlinked bookings that may still need processing
            pass  # fall through to check unlinked

    # --- Check for unlinked bookings ---
    unlinked = api("GET", f"/books/booking/calendar/{cal_id}", token=token)

    if not unlinked:
        # Re-check if fully done
        results_final = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
        if results_final:
            all_done = all(s.get("qrCode", {}).get("status") == "approved" for s in results_final)
            if all_done:
                print(f"  Calendar {cal_id} complete ({len(results_final)} approved) [OK]")
                return True

        # No unlinked and no results — need to create bookings
        print(f"  No bookings found, creating M3 bookings...")
        created_books = []
        for land_id in land_ids:
            r = api("POST", "/books/booking", {
                "farmerId": FARMER_ID,
                "landId": land_id,
                "serviceTypeId": 7,
                "receivedServiceCalendarId": cal_id,
            }, token=token)
            if not r:
                print(f"  !! Booking creation failed for land {land_id}")
                return False
            created_books.append(r)
        print(f"  Created {len(created_books)} bookings")
        # Re-fetch to get land relations included
        unlinked = api("GET", f"/books/booking/calendar/{cal_id}", token=token)
        if not unlinked:
            print(f"  !! Could not fetch newly created bookings")
            return False
    else:
        print(f"  Found {len(unlinked)} existing unlinked bookings")

    # --- QR pipeline for unlinked books ---
    n = len(unlinked)
    qr_list = api("POST", f"/qr-codes/generate/{n}",
                  {"type": "spread", "serviceCalendarId": cal_id}, token=token)
    if not qr_list or len(qr_list) != n:
        print(f"  !! QR generation failed")
        return False
    print(f"  Generated {n} QR codes")

    book_ids = []
    for i, book in enumerate(unlinked):
        qr_str  = qr_list[i]["qrCode"]
        book_id = book["bookId"]
        land_code = book["land"]["landCode"]
        land_name = book["land"]["name"]

        r = api("PATCH", f"/qr-codes/receive-sample/decrypted/{qr_str}",
                {"serviceCalendarId": cal_id, "bookId": book_id}, token=token)
        if not r or r.get("alreadyReceived"):
            print(f"  !! receiveSample failed book {book_id}")
            return False

        qr_id = r["qrCode"]["qrCodeId"]
        patch = {**FARMER_META, "landCode": land_code, "landName": land_name}
        r2 = api("PATCH", f"/qr-codes/{qr_id}", patch, token=token)
        if not r2:
            print(f"  !! qr-codes PATCH failed qrId={qr_id}")
            return False

        book_ids.append(book_id)

    print(f"  Received and patched {len(book_ids)} QR codes")

    r = api("PATCH", f"/books/service-calendar/{cal_id}/selects", book_ids, token=token)
    if not r:
        print(f"  !! selectReceivedBooks failed")
        return False
    print(f"  Selected {len(r)} books for analysis")

    new_results = api("GET", f"/books/service-calendar/{cal_id}/results", token=token)
    if not new_results:
        print(f"  !! No results after select")
        return False

    new_samples = [s for s in new_results if s.get("qrCode", {}).get("status") != "approved"]
    return fill_and_approve(new_samples, pvs, token)


def main():
    print("=== Processing M3 calendars ===")
    token = login()
    print(f"Logged in (token={len(token)} chars)")

    ok = 0
    for idx, (cal_id, land_ids) in enumerate(M3_CALS):
        if process_calendar(cal_id, land_ids, idx, token):
            ok += 1
        else:
            print(f"  FAILED: calendar {cal_id}")
        # Brief pause to avoid exhausting Aiven connection pool
        time.sleep(1)

    print(f"\n=== Done: {ok}/{len(M3_CALS)} ===")


if __name__ == "__main__":
    main()
