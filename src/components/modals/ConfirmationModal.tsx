import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${isDestructive ? 'text-red-500' : 'text-yellow-500'} mx-auto mb-4`} />
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <div className="text-muted-foreground mb-6">{message}</div>
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            {cancelButtonText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            className="w-full"
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
