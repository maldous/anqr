export interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly mobileHeightPercent?: number;
}
