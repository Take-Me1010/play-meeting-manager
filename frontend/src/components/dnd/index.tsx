import {
  Container as _DNDContainer,
  Draggable as _DNDDraggable,
} from "react-smooth-dnd";

export const DNDContainer: React.FC<
  React.PropsWithChildren<React.ComponentProps<typeof _DNDContainer>>
> = ({ children, ...props }) => {
  return <_DNDContainer {...props}>{children}</_DNDContainer>;
};
export const DNDDraggable: React.FC<
  React.PropsWithChildren<React.ComponentProps<typeof _DNDDraggable>>
> = ({ children, ...props }) => {
  return <_DNDDraggable {...props}>{children}</_DNDDraggable>;
};
