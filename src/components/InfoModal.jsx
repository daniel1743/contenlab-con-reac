import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const InfoModal = ({ isOpen, onClose, title, content }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 rounded-lg bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient mb-2">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {content}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;