import FileUpload from '@/components/ui/FileUpload';
import Select from '@/components/ui/Select';
import { useEffect, useState } from 'react';
import Modal, { inputCls } from '@/components/ui/Modal';
import {
  MaintainerFormValues,
  useCreateMaintainer,
  useUpdateMaintainer,
  type Maintainer,
} from '@/api/api_controllers/maintainerController';
import {
  useGetMaintainerTypes,
  extractTypes,
} from '@/api/api_controllers/types';

const empty: MaintainerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  maintainerTypeId: '',
  profileImage: null,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  maintainer?: Maintainer | null;
}

const MaintainerFormModal = ({ isOpen, onClose, maintainer }: Props) => {
  const isEdit = !!maintainer;

  const [values, setValues] = useState<MaintainerFormValues>(empty);

  const { createMaintainer, isLoading: creating } = useCreateMaintainer();

  const { updateMaintainer, isLoading: updating } = useUpdateMaintainer(
    maintainer?.id
  );

  // Fetch maintainer types dynamically
  const { data: typesData, isLoading: loadingTypes } =
    useGetMaintainerTypes(isOpen);

  const maintainerTypes = extractTypes(typesData);

  useEffect(() => {
    if (!isOpen) return;

    setValues(
      maintainer
        ? {
            firstName: maintainer.firstName,
            lastName: maintainer.lastName,
            email: maintainer.email,
            phoneNumber: maintainer.phoneNumber,
            password: '',
            maintainerTypeId: maintainer.maintainerTypeId,
            profileImage: null,
          }
        : empty
    );
  }, [isOpen, maintainer]);

  const set = (k: keyof MaintainerFormValues, v: any) => {
    setValues((p) => ({ ...p, [k]: v }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateMaintainer(values);
      } else {
        await createMaintainer(values);
      }

      onClose();
    } catch {
      // Toast handled by API manager.
    }
  };

  const busy = creating || updating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Maintainer' : 'Create Maintainer'}
      size="lg"
    >
      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="grid grid-cols-2 gap-x-5 gap-y-4"
      >
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">
            First name
          </span>
          <input
            required
            className={inputCls}
            value={values.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </label>

        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">
            Last name
          </span>
          <input
            required
            className={inputCls}
            value={values.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </label>

        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">Email</span>
          <input
            required
            type="email"
            name="maintainer-email"
            autoComplete="off"
            className={inputCls}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>

        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">
            Phone number
          </span>
          <input
            required
            className={inputCls}
            value={values.phoneNumber}
            onChange={(e) => set('phoneNumber', e.target.value)}
          />
        </label>

        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">
            Password{' '}
            {isEdit && (
              <span className="text-muted-foreground">
                (leave blank to keep)
              </span>
            )}
          </span>
          <input
            type="password"
            name="maintainer-new-password"
            autoComplete="new-password"
            required={!isEdit}
            className={inputCls}
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
          />
        </label>

        {/* Dynamic Maintainer Type */}
        <label className="text-sm space-y-2 block">
          <span className="block font-medium text-muted-foreground">
            Maintainer type
          </span>

          <Select
            required
            className={inputCls}
            value={values.maintainerTypeId}
            disabled={loadingTypes || maintainerTypes.length === 0}
            onChange={(e) => set('maintainerTypeId', e.target.value)}
          >
            <option value="">
              {loadingTypes
                ? 'Loading maintainer types...'
                : maintainerTypes.length === 0
                  ? 'No maintainer types available'
                  : 'Select maintainer type'}
            </option>

            {maintainerTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </Select>
        </label>

        <div className="text-sm space-y-2 col-span-2">
          <span className="block font-medium text-muted-foreground">
            Profile image
          </span>

          <FileUpload
            file={values.profileImage}
            aria-label="Maintainer profile image"
            accept="image/*"
            disabled={busy}
            onChange={(event) =>
              set('profileImage', event.target.files?.[0] ?? null)
            }
          />
        </div>

        <div className="col-span-2 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={busy || loadingTypes || maintainerTypes.length === 0}
            className="px-5 py-2.5 text-sm text-white rounded-lg disabled:opacity-60"
            style={{ backgroundColor: '#f30100' }}
          >
            {busy ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintainerFormModal;
