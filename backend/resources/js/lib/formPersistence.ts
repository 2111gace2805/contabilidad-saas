export function saveFormData<T>(formKey: string, data: T): void {
  try {
    localStorage.setItem(formKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form data:', error);
  }
}

export function loadFormData<T>(formKey: string): T | null {
  try {
    const saved = localStorage.getItem(formKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
}

export function clearFormData(formKey: string): void {
  try {
    localStorage.removeItem(formKey);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
}

export function getFormKey(companyId: string, formName: string): string {
  return `form_${companyId}_${formName}`;
}
