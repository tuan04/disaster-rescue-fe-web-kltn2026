import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate} from 'react-router-dom';

import Button from '@/components/ui/common/Button';
import FormField from '@/components/ui/common/FormField';
import Modal from '@/components/ui/common/Modal';
import { loginApi } from '@/services/auth';
import { login } from '@/store/authSlice';
import type { AppDispatch } from '@/store/store';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

type LoginForm = {
  phone: string;
  password: string;
};

const loginFields = [
  {
    label: 'Số điện thoại',
    name: 'phone',
    type: 'tel',
    placeholder: '0987654321',
    autoComplete: 'tel',
  },
  {
    label: 'Mật khẩu',
    name: 'password',
    type: 'password',
    placeholder: 'Nhập mật khẩu',
    autoComplete: 'current-password',
  },
] as const;

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    phone: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = await loginApi({
        phoneNumber: form.phone,
        password: form.password,
      });

      console.log(payload);

      const accessToken = payload?.accessToken;
      const userInfo = payload?.userInfoResponse;

      if (!accessToken) {
        throw new Error('Không nhận được accessToken từ server');
      }

      dispatch(
        login({
          accessToken,
          user: userInfo,
        }),
      );

      onClose();
      navigate('/admin', { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Đăng nhập hệ thống quản lý" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {loginFields.map((field) => (
          <FormField
            key={field.name}
            required
            {...field}
            value={form[field.name as keyof LoginForm]}
            onChange={handleChange}
          />
        ))}

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}
        <Button className="mt-1 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Modal>
  );
}
