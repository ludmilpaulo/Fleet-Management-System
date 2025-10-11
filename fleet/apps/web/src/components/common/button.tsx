import React from "react";

type ButtonProps = {
  varient?: "default" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
};
const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

export default Button;
