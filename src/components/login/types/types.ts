import { FormEvent } from 'react';

export interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    name: keyof FormData;
    value: string;
    type: string;
    checked: boolean;
  };
}

export interface LoginSubmitEvent extends FormEvent<HTMLFormElement> {
  preventDefault(): void;
}

export interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface NavigationProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface LoginFormProps {
  isDark: boolean;
  loginType: string;
  setLoginType?: (type: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
  formData: FormData;
  handleInputChange: (e: InputChangeEvent) => void;
  handleSubmit: (e: LoginSubmitEvent) => Promise<void>;
  isVisible: boolean;
  error?: string;
}

export interface LoginContainerProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVisible: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loginType: string;
  setLoginType?: (type: string) => void;
  isLoading: boolean;
  formData: FormData;
  handleInputChange: (e: InputChangeEvent) => void;
  handleSubmit: (e: LoginSubmitEvent) => Promise<void>;
  error?: string;
}
