import { useState } from "react";

export function useDialogManagement<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openDialog = (item?: T) => {
    setSelectedItem(item ?? null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setIsOpen(false);
  };

  return {
    isOpen,
    selectedItem,
    openDialog,
    closeDialog,
  };
}
