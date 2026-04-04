import { useState } from 'react';
import StatusDialog, { type DialogState } from './StatusDialog';

type DialogTone = DialogState['tone'];

const initialState: DialogState = {
  open: false,
  message: '',
  tone: 'success',
  title: '',
};

export function useStatusDialog() {
  const [dialog, setDialog] = useState<DialogState>(initialState);

  const showDialog = (tone: DialogTone, title: string, message: string) => {
    setDialog({
      open: true,
      tone,
      title,
      message,
    });
  };

  const closeDialog = () => {
    setDialog(initialState);
  };

  const dialogElement = <StatusDialog {...dialog} onClose={closeDialog} />;

  return {
    showDialog,
    dialogElement,
  };
}
