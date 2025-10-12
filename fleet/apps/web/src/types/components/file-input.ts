export type FileInputProps = {
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  landscape?: boolean;
  onChange?: (file: File[] | null) => void;
};
