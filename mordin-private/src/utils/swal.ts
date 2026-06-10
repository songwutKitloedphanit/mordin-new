import Swal, { SweetAlertOptions } from 'sweetalert2';

const THEME_KEY = 'mordin-private-theme';

function themeDefaults(): Partial<SweetAlertOptions> {
  const isDark = localStorage.getItem(THEME_KEY) === 'dark';
  if (!isDark) return {};
  return {
    background: '#263247',
    color: '#E6EAF0',
  };
}

function withTheme(options: SweetAlertOptions): SweetAlertOptions {
  return { ...themeDefaults(), ...options } as SweetAlertOptions;
}

export function swalSuccess(title: string, text?: string) {
  return Swal.fire(withTheme({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#005092',
  }));
}

export function swalError(title: string, text?: string) {
  return Swal.fire(withTheme({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#dc3545',
  }));
}

export function swalConfirmDelete(title: string, text: string) {
  return Swal.fire(withTheme({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบข้อมูล',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
  }));
}

export function swalConfirm(title: string, text: string) {
  return Swal.fire(withTheme({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#005092',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
  }));
}
