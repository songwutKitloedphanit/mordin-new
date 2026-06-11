import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Central SweetAlert2 utility for the Mordin Private app.
 *
 * Dark-mode theming is handled globally: AdminLayout sets
 * `data-swal2-theme="dark|light"` on <body> and index.css
 * provides the CSS-variable overrides, so no inline background/color
 * is needed here.
 *
 * Base defaults ensure every popup matches the system design:
 *   – Sarabun font (same as the app)
 *   – 14px border-radius (same as .private-card)
 *   – Brand primary colour (#005092) for the confirm button
 */

const BASE: Partial<SweetAlertOptions> = {
  customClass: {
    popup:          'swal-mordin-popup',
    confirmButton:  'swal-mordin-confirm',
    cancelButton:   'swal-mordin-cancel',
    denyButton:     'swal-mordin-deny',
    title:          'swal-mordin-title',
    htmlContainer:  'swal-mordin-text',
    icon:           'swal-mordin-icon',
  },
};

function merged(options: SweetAlertOptions): SweetAlertOptions {
  return { ...BASE, ...options } as SweetAlertOptions;
}

// ─── Success ────────────────────────────────────────────────────────────────

/** Success with a permanent confirm button */
export function swalSuccess(title: string, text?: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#005092',
    })
  );
}

/** Success with auto-close timer + progress bar (for save/create/edit feedback) */
export function swalSuccessTimer(title: string, text?: string, timer = 2000) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'success',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
    })
  );
}

// ─── Error ──────────────────────────────────────────────────────────────────

export function swalError(title: string, text?: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#dc3545',
    })
  );
}

// ─── Info ───────────────────────────────────────────────────────────────────

export function swalInfo(title: string, text?: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#005092',
    })
  );
}

// ─── Warning ────────────────────────────────────────────────────────────────

export function swalWarning(title: string, text?: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#d97706',
    })
  );
}

// ─── Confirm (generic) ──────────────────────────────────────────────────────

export function swalConfirm(title: string, text: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#005092',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    })
  );
}

// ─── Confirm Delete ─────────────────────────────────────────────────────────

export function swalConfirmDelete(title: string, text: string) {
  return Swal.fire(
    merged({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    })
  );
}

// ─── Loading (non-dismissable) ───────────────────────────────────────────────

export function swalLoading(title = 'กำลังดำเนินการ…') {
  Swal.fire(
    merged({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })
  );
}

export function swalClose() {
  Swal.close();
}
