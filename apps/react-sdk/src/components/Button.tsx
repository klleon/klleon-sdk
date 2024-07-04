import { ReactNode } from "react";

export interface ButtonProps {
  children?: ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const Button = (props: ButtonProps) => {
  const { children, onClick } = props;
  return <button onClick={(e) => onClick(e)}>{children}</button>;
};

export default Button;
