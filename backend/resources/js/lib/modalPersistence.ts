export function saveModalState(key: string, isOpen: boolean): void {
  try {
    sessionStorage.setItem(`modal_${key}`, JSON.stringify(isOpen));
  } catch (error) {
    console.warn('Failed to save modal state:', error);
  }
}

export function loadModalState(key: string): boolean {
  try {
    const saved = sessionStorage.getItem(`modal_${key}`);
    return saved ? JSON.parse(saved) : false;
  } catch (error) {
    console.warn('Failed to load modal state:', error);
    return false;
  }
}

export function clearModalState(key: string): void {
  try {
    sessionStorage.removeItem(`modal_${key}`);
  } catch (error) {
    console.warn('Failed to clear modal state:', error);
  }
}

export function saveEditingState<T>(key: string, data: T | null): void {
  try {
    if (data === null) {
      sessionStorage.removeItem(`editing_${key}`);
    } else {
      sessionStorage.setItem(`editing_${key}`, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Failed to save editing state:', error);
  }
}

export function loadEditingState<T>(key: string): T | null {
  try {
    const saved = sessionStorage.getItem(`editing_${key}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load editing state:', error);
    return null;
  }
}
