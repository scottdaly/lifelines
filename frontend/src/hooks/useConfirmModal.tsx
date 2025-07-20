import { useState, useCallback } from 'react';
import { ConfirmModal } from '../components/Modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  details?: React.ReactNode;
}

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: ''
  });
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      setIsOpen(false);
      resolver?.resolve(false);
      setResolver(null);
    }
  }, [loading, resolver]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    // Allow the parent to handle the action
    resolver?.resolve(true);
    setResolver(null);
    // Small delay to show loading state
    setTimeout(() => {
      setIsOpen(false);
      setLoading(false);
    }, 100);
  }, [resolver]);

  const ModalComponent = useCallback(() => (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      {...options}
    />
  ), [isOpen, handleClose, handleConfirm, loading, options]);

  return {
    confirm,
    ConfirmModal: ModalComponent
  };
}