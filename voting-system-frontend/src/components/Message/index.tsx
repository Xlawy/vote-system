import { Snackbar, Alert } from '@mui/material';
import { createRoot } from 'react-dom/client';

interface MessageProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const Message = ({ message, type, duration = 3000 }: MessageProps) => {
  return (
    <Snackbar
      open={true}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export const showMessage = (props: MessageProps) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);

  root.render(<Message {...props} />);

  setTimeout(() => {
    root.unmount();
    div.remove();
  }, props.duration || 3000);
};

export default Message;
