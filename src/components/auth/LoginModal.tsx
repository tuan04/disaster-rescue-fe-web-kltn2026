import Button from "@/components/ui/common/Button";
import FormField from "@/components/ui/common/FormField";
import Modal from "@/components/ui/common/Modal";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

const loginFields = [
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    label: "Mật khẩu",
    name: "password",
    type: "password",
    placeholder: "Nhập mật khẩu",
    autoComplete: "current-password",
  },
] as const;

export default function LoginModal({ open, onClose }: LoginModalProps) {
  return (
    <Modal open={open} title="Đăng nhập hệ thống quản lý" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        {loginFields.map((field) => (
          <FormField key={field.name} required {...field} />
        ))}

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-text-muted">
            <input className="h-4 w-4 accent-secondary" type="checkbox" />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" className="font-medium text-primary hover:text-primary/75">
            Quên mật khẩu?
          </button>
        </div>

        <Button className="mt-1 w-full" type="submit">
          Đăng nhập
        </Button>
      </form>
    </Modal>
  );
}
