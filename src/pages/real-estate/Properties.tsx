import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { useGetProperties, useCreateProperty, useUpdateProperty, useGetPropertyById, useDeleteProperty, type Property, type PropertyInput } from '@/api/api_controllers/property';

import type { FormEvent } from 'react';
import Modal, { Field, inputCls } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
type PropertyMode = 'create' | 'edit' | 'view';
const message = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

function PropertyForm({ property, mode, onClose, onBusyChange }: {
  property?: Property;
  mode: PropertyMode;
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [name, setName] = useState(property?.name ?? '');
  const [description, setDescription] = useState(property?.description ?? '');
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? '');
  const [location, setLocation] = useState({ address: property?.address ?? '', city: property?.city ?? '', state: property?.state ?? '', country: property?.country ?? '', zipCode: property?.zipCode ?? '' });
  const [thumbnailImage, setThumbnailImage] = useState<File | undefined>();
  const [propertyImage, setPropertyImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!propertyImage) { setImagePreview(''); return; }
    const url = URL.createObjectURL(propertyImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [propertyImage]);
  const [error, setError] = useState('');
  const create = useCreateProperty();
  const update = useUpdateProperty(property?.id);
  const busy = create.isLoading || update.isLoading;
  const readOnly = mode === 'view';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly || busy) return;
    setError('');
    if (!name.trim()) { setError('Property name is required.'); return; }
    if (!propertyType.trim()) { setError('Property type is required.'); return; }
    const values: PropertyInput = { name: name.trim(), description: description.trim(), propertyType: propertyType.trim().toUpperCase(), ...Object.fromEntries(Object.entries(location).map(([key, value]) => [key, value.trim()])), ...(thumbnailImage ? { thumbnailImage } : {}), ...(propertyImage ? { propertyImage } : {}) };
    const changes = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== (property?.[key] ?? ''))) as PropertyInput;
    if (mode === 'edit' && Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    onBusyChange(true);
    try {
      if (mode === 'create') await create.createProperty(values);
      else {
        // PATCH only fields that changed, leaving server-managed values intact.
        await update.updateProperty(changes);
      }
      onClose();
    } catch (err) {
      setError(message(err));
    } finally {
      onBusyChange(false);
    }
  };

  if (mode !== 'view') {
    const editing = mode === 'edit';
    const gallery = imagePreview ? [imagePreview] : [...new Set([property?.propertyImage, ...(property?.images ?? [])].filter((image): image is string => typeof image === 'string' && Boolean(image)))];
    const controlClass = 'h-12 border-[#eaeaea] bg-white px-5 pr-12 text-base leading-[1.4] text-[#4c4c4c] placeholder:text-[#a1a1a1]';
    const arrow = (visible = false) => <img src={visible ? '/assets/property-create-chevron.svg' : '/assets/property-create-field-arrow.svg'} alt="" width={18} height={18} className="pointer-events-none absolute right-5 top-[15px]" />;
    const locationField = (key: keyof typeof location, label: string, placeholder: string, country = false) => (
      <Field label={label}>
        <div className="relative">
          <Input value={location[key]} placeholder={placeholder} list={country ? 'property-countries' : undefined} onChange={(event) => setLocation((previous) => ({ ...previous, [key]: event.target.value }))} className={`${controlClass} [&::-webkit-calendar-picker-indicator]:opacity-0`} />
          {arrow(country)}
        </div>
      </Field>
    );
    const fileClass = 'block h-12 w-full overflow-hidden rounded-lg border border-[#eaeaea] bg-white text-base leading-[46px] text-[#898989] file:mr-6 file:h-[46px] file:w-[126px] file:border-0 file:border-x file:border-[#eceff1] file:bg-[#eaeaea] file:px-4 file:text-base file:text-[#727272]';
    return (
      <form onSubmit={submit}>
        {error && <p role="alert" className="mb-5 text-sm text-red-600">{error}</p>}
        <fieldset disabled={busy} className="[&_label>span]:mb-2 [&_label>span]:text-sm [&_label>span]:font-medium [&_label>span]:leading-5 [&_label>span]:text-[#4c4c4c]">
          <h3 className="mb-8 text-base font-medium leading-[22px] text-[#393939]">Property Details</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Type">
                <div className="relative">
                  <select autoFocus required value={propertyType.toLowerCase()} onChange={(event) => setPropertyType(event.target.value)} className={`w-full appearance-none rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-text/20 ${controlClass} ${propertyType ? '' : 'text-[#a1a1a1]'}`}>
                    <option value="" disabled>Select property type</option>
                    {propertyType && !['duplex', 'detached', 'condo', 'terrace', 'other'].includes(propertyType.toLowerCase()) && <option value={propertyType.toLowerCase()}>{propertyType}</option>}
                    <option value="duplex">Duplex</option>
                    <option value="detached">Detached</option>
                    <option value="condo">Condo</option>
                    <option value="terrace">Terrace</option>
                    <option value="other">Other</option>
                  </select>
                  {arrow(true)}
                </div>
              </Field>
              <Field label="Name">
                <div className="relative">
                  <Input required value={name} placeholder="Enter property name" onChange={(event) => setName(event.target.value)} className={controlClass} />
                  {arrow()}
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {locationField('country', 'Country', 'Select country', true)}
              {locationField('state', 'State', 'Select state')}

            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {locationField('city', 'City', 'Select city')}
              {locationField('zipCode', 'Zip Code', 'Enter Zipcode')}
            </div>
            <div className={editing ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-1 gap-5 sm:grid-cols-2'}>
              {locationField('address', 'Address', 'Enter address')}

            </div>
            <label className="block">
              <span className="!mb-5 block !text-base !leading-[22px] !text-[#393939]">Thumbnail Image</span>
              <input type="file" accept="image/*" onChange={(event) => setThumbnailImage(event.target.files?.[0])} className={fileClass} />
            </label>
            <Field label="Description">
              <div className="relative">
                <textarea value={description} placeholder="Enter property description" onChange={(event) => setDescription(event.target.value)} className="block h-[126px] w-full resize-none rounded-lg border border-[#eaeaea] bg-white px-5 py-3 pr-12 text-base leading-[1.4] text-[#4c4c4c] placeholder:text-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-brand-text/20" />
                <img src="/assets/property-create-field-arrow.svg" alt="" width={18} height={18} className="pointer-events-none absolute right-5 top-3" />
              </div>
            </Field>
          </div>
          <label className="mt-16 block">
            <span className="!mb-8 block !text-base !leading-[22px] !text-[#393939]">Add Property Image</span>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={(event) => setPropertyImage(event.target.files?.[0])} className={fileClass} />
          </label>
          {editing && <div className="mt-8 flex min-h-24 flex-wrap gap-3">
            {gallery.map((image, index) => <div key={image} className="relative h-24 w-[97px] shrink-0 pt-[11px]">
              <div className="relative h-[85px] w-[90px] overflow-hidden rounded-md">
                <img src={image} alt={`Property image ${index + 1}`} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-black/30" />
              </div>
              {imagePreview && <button type="button" aria-label="Cancel replacement image" onClick={() => { setPropertyImage(undefined); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="absolute right-0 top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#ffedee]">
                <img src="/assets/property-create-close.svg" alt="" width={14} height={14} />
              </button>}
            </div>)}
          </div>}
          <datalist id="property-countries"><option value="Nigeria" /></datalist>
        </fieldset>
        <div className={`mt-12 flex justify-end ${editing ? 'sm:mt-[203px]' : 'sm:mt-[217px]'}`}>
          <Button type="submit" disabled={busy} className="h-[35px] w-[168px] bg-brand-text px-[15px] py-[5px] font-['Plus_Jakarta_Sans'] text-sm font-semibold leading-[26px] text-white hover:bg-brand-text/90">{busy ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Edit Property' : 'Add Property')}</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <fieldset disabled={busy || readOnly} className="space-y-4">
        <Field label="Property Name">
          <input autoFocus={!readOnly} required value={name} onChange={(event) => setName(event.target.value)} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className={inputCls} />
        </Field>
        <Field label="Property Type">
          <input required list="property-type-options" placeholder="e.g. DUPLEX" value={propertyType} onChange={(event) => setPropertyType(event.target.value.toUpperCase())} className={inputCls} />
          <datalist id="property-type-options"><option value="DUPLEX" /></datalist>
        </Field>
        <Field label="Address"><input value={location.address} onChange={(event) => setLocation((previous) => ({ ...previous, address: event.target.value }))} className={inputCls} /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['city', 'state', 'country', 'zipCode'] as const).map((key) => <Field key={key} label={key === 'zipCode' ? 'ZIP Code' : key[0].toUpperCase() + key.slice(1)}><input value={location[key]} onChange={(event) => setLocation((previous) => ({ ...previous, [key]: event.target.value }))} className={inputCls} /></Field>)}
        </div>
        {!readOnly && <>
          <Field label="Thumbnail Image"><input type="file" accept="image/*" onChange={(event) => setThumbnailImage(event.target.files?.[0])} className={inputCls} /></Field>
          <Field label="Property Image"><input type="file" accept="image/*" onChange={(event) => setPropertyImage(event.target.files?.[0])} className={inputCls} /></Field>
        </>}
      </fieldset>
      {readOnly && (
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Units</dt><dd>{property?.unitCount ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Rooms</dt><dd>{property?.roomCount ?? '—'}</dd></div>
        </dl>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
        {!readOnly && <Button type="submit" disabled={busy} className="bg-brand-text text-white hover:bg-brand-text/90">{busy ? 'Saving...' : 'Update Property'}</Button>}
      </div>
    </form>
  );
}

function PropertyModal({ mode, id, onClose }: { mode: PropertyMode; id?: string; onClose: () => void }) {
  const detail = useGetPropertyById(id, mode !== 'create');
  const [busy, setBusy] = useState(false);
  const title = mode === 'create' ? 'Add Property' : mode === 'edit' ? 'Edit Property' : 'View Property';
  const property = detail.data?.data;
  return (
    <Modal isOpen onClose={() => { if (!busy) onClose(); }} title={title}
      presentation={mode !== 'view' ? 'drawer' : 'modal'}
      closeIcon={mode !== 'view' ? <img src="/assets/property-create-close.svg" alt="" width={14} height={14} /> : undefined}
      bodyClassName={mode !== 'view' ? 'relative bg-white px-5 pb-8 pt-[35px] sm:px-8' : undefined}
    >
      {mode !== 'view' && <div className="pointer-events-none absolute right-0 top-[376.76px] h-[69.418px] w-[16.04px] overflow-hidden"><img src="/assets/property-create-edge.svg" alt="" width={32} height={32} /></div>}
      {mode !== 'create' && detail.isLoading && <p role="status" className="text-sm">Loading property...</p>}
      {mode !== 'create' && detail.error && (
        <div role="alert" className="space-y-3 text-sm text-red-600">
          <p>{message(detail.error)}</p>
          <Button variant="outline" disabled={detail.isFetching} onClick={() => void detail.refetch()}>Try again</Button>
        </div>
      )}
      {(mode === 'create' || (property && !detail.error)) && <PropertyForm key={property?.id ?? 'new'} property={property} mode={mode} onClose={onClose} onBusyChange={setBusy} />}
    </Modal>
  );
}

function DeletePropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const remove = useDeleteProperty(property.id);
  const [error, setError] = useState('');
  const confirm = async () => {
    if (remove.isLoading) return;
    setError('');
    try { await remove.deleteProperty(); onClose(); }
    catch (err) { setError(message(err)); }
  };
  return (
    <Modal isOpen title="Delete Property" size="sm" onClose={() => { if (!remove.isLoading) onClose(); }}>
      <p className="mb-5 text-sm">Are you sure you want to delete {property.name ? `“${property.name}”` : 'this property'}? This action cannot be undone.</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={remove.isLoading} onClick={onClose}>Cancel</Button>
        <Button disabled={remove.isLoading} onClick={() => void confirm()} className="bg-brand-text text-white hover:bg-brand-text/90">{remove.isLoading ? 'Deleting...' : 'Delete'}</Button>
      </div>
    </Modal>
  );
}

function PropertyIcon({ name, size, className = '' }: { name: string; size: number; className?: string }) {
  return <img src={`/assets/${name}.svg`} alt="" width={size} height={size} className={`shrink-0 ${className}`} />;
}

function PropertyImages({ images, name }: { images?: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const sources = Array.isArray(images) ? [...new Set(images.filter((value) => typeof value === 'string' && value.trim()))] : [];
  const active = sources.length ? index % sources.length : 0;
  return <>
    {sources.length ? <img src={sources[active]} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-muted"><Home className="h-12 w-12 text-muted-foreground" /></div>}
    {sources.length > 0 && <>
      <button type="button" aria-label={`Previous image of ${name}`} disabled={sources.length < 2} onClick={() => setIndex((value) => (value - 1 + sources.length) % sources.length)} className="absolute left-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white disabled:cursor-default"><PropertyIcon name="image-left" size={12} /></button>
      <button type="button" aria-label={`Next image of ${name}`} disabled={sources.length < 2} onClick={() => setIndex((value) => (value + 1) % sources.length)} className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white disabled:cursor-default"><PropertyIcon name="image-right" size={12} /></button>
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-b from-transparent to-black/50 p-4">{sources.map((source, imageIndex) => <button key={source} type="button" aria-label={`Show image ${imageIndex + 1} of ${name}`} aria-pressed={imageIndex === active} onClick={() => setIndex(imageIndex)} className={`h-[3px] w-3 rounded-full bg-white ${imageIndex === active ? '' : 'opacity-30'}`} />)}</div>
    </>}
  </>;
}

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [modal, setModal] = useState<{ mode: PropertyMode; id?: string } | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const code = localStorage.getItem('code')?.trim() ?? '';
  const query = useGetProperties({ page: currentPage, perPage: pageSize, search: searchQuery });
  const properties = query.data?.data ?? [];
  const meta = query.data?.meta;
  const loadError = !code ? 'Estate code is missing. Sign in to your estate first.' : query.error?.message;
  const filtered = properties.filter((property) => (property.name ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase()));
  const totalPages = Math.max(1, meta ? meta.totalPages : Math.ceil(filtered.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const currentProperties = loadError ? [] : meta ? properties : filtered.slice(start, start + pageSize);
  const navigationDisabled = query.isFetching || Boolean(loadError);
  const pageButton = 'flex h-[26px] items-center justify-center rounded border border-[#eaeaea] bg-white text-xs leading-[18px] text-[#4c4c4c] disabled:opacity-40';
  useEffect(() => { if (query.data && currentPage > totalPages) setCurrentPage(totalPages); }, [query.data, currentPage, totalPages]);
  const openProperty = (mode: PropertyMode, id?: string) => setModal({ mode, id });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <nav aria-label="Breadcrumb" className="flex h-[25px] items-center gap-1 text-xs leading-[1.4] text-[#5f5f5f]">
        <span>Real Estate</span><PropertyIcon name="breadcrumb" size={20} /><span aria-current="page" className="px-2 py-1 font-medium text-brand-text">Properties</span>
      </nav>
      <div className="mt-[26px] flex min-h-11 items-center justify-between gap-4">
        <h1 className="text-lg font-semibold leading-[1.4] text-[#393939]">Property List</h1>
        <button type="button" disabled={!code} onClick={() => openProperty('create')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-text px-4 py-3 text-sm font-medium leading-5 text-white hover:bg-brand-text/90 disabled:opacity-50"><PropertyIcon name="plus" size={18} />Create Property</button>
      </div>
      <section aria-label="Property list" className="mt-8 rounded-[10px] border border-[#eaeaea] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#eaeaea] px-4 py-6 sm:px-6">
          <div className="relative w-full max-w-[226px]">
            <div className="pointer-events-none absolute left-4 top-[13px]"><PropertyIcon name="search" size={18} /></div>
            <input aria-label="Search properties" placeholder="Search by name..." value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} className="h-11 w-full rounded-lg border border-[#eaeaea] bg-white pl-[42px] pr-4 text-sm leading-5 text-[#4c4c4c] placeholder:text-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-brand-text/20" />
          </div>
        </div>
        {loadError && <div role="alert" className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-600"><p>{loadError}</p>{code && <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()} className="mt-2 underline disabled:opacity-50">Try again</button>}</div>}
        {code && query.isLoading && <p role="status" className="p-8 text-sm text-muted-foreground">Loading properties...</p>}
        {!loadError && !query.isLoading && currentProperties.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">{searchQuery.trim() ? 'No matching properties found.' : 'No properties yet. Create your first property to get started.'}</p>}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 px-4 pb-12 pt-8 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          {currentProperties.map((property) => {
            const name = property.name || 'Unnamed property';
            const badge = typeof property.ownershipType === 'string' ? property.ownershipType : property.propertyType;
            return <article key={property.id} className="relative min-w-0 overflow-hidden rounded-lg bg-white shadow-[0_26px_100px_rgba(0,0,0,0.12)]">
              <div className="relative h-[200px] overflow-hidden">
                <PropertyImages name={name} images={[property.thumbnailImage, property.propertyImage, ...(property.images ?? [])].filter((image): image is string => typeof image === 'string' && Boolean(image))} />
                {badge && <span className="absolute right-4 top-[15px] rounded-lg border-[0.5px] border-brand-text bg-[#ffdcdc] p-[6px] text-[10px] font-medium leading-[14px] text-[#393939]">{badge}</span>}
              </div>
              <div className="relative flex h-[130px] flex-col gap-2 p-4">
                <h2 className="truncate pr-[30px] text-base font-semibold leading-[22px] text-[#393939]" title={name}>{name}</h2>
                <div className="absolute right-3 top-2">
                  <RowActionsMenu label={`Actions for ${name}`} panelWidth={171} triggerClassName="h-[30px] w-[30px] rounded-full" triggerIcon={<PropertyIcon name="ellipsis" size={24} />} panelClassName="flex flex-col gap-2 rounded-[5px] border-[0.5px] bg-white px-3 py-[15px] shadow-[0_10px_20px_rgba(0,0,0,0.05)]" panelStyle={{ borderRadius: 5, borderColor: '#eaecf0' }}>
                    {(close) => <>
                      <RowAction className="h-9 shrink-0 rounded-[5px] px-4 py-2 text-sm font-normal leading-5 text-[#5f5f5f]" onClick={() => { close(); openProperty('view', property.id); }}><PropertyIcon name="view" size={14} />View</RowAction>
                      <RowAction className="h-9 shrink-0 rounded-[5px] px-4 py-2 text-sm font-normal leading-5 text-[#5f5f5f]" onClick={() => { close(); openProperty('edit', property.id); }}><PropertyIcon name="edit" size={14} />Edit</RowAction>
                      <RowAction className="h-9 shrink-0 rounded-[5px] bg-[#ffedee] px-4 py-2 text-sm font-normal leading-5 text-[#ff383c] hover:bg-[#ffdde0]" onClick={() => { close(); setDeleting(property); }}><PropertyIcon name="delete" size={14} />Delete</RowAction>
                    </>}
                  </RowActionsMenu>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#4c4c4c]">{property.description}</p>
                <div className="flex gap-[10px] text-sm leading-5 text-[#727272]">
                  <span className="flex min-w-0 flex-1 items-center gap-1"><PropertyIcon name="building" size={14} />{property.unitCount ?? '—'} Unit</span>
                  <span className="flex min-w-0 flex-1 items-center gap-1"><PropertyIcon name="building" size={14} />{property.roomCount ?? '—'} Rooms</span>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>
      <div className="mt-[60px] flex flex-wrap items-center justify-between gap-4 font-['Plus_Jakarta_Sans']">
        <label className="flex items-center gap-2 text-sm leading-[26px] text-[#4c4c4c]">Show
          <span className="relative"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-[26px] w-[50px] appearance-none rounded border border-[#eaeaea] bg-white pl-2 pr-5 text-xs leading-[18px]">{[8, 10, 12, 20].map((size) => <option key={size} value={size}>{size}</option>)}</select><span className="pointer-events-none absolute right-1 top-[5px]"><PropertyIcon name="page-size" size={16} /></span></span>
          entries per page
        </label>
        <nav aria-label="Property pagination" className="flex items-center gap-3">
          <button type="button" className={`${pageButton} w-10 font-['Inter']`} disabled={currentPage <= 1 || navigationDisabled} onClick={() => setCurrentPage(1)}>First</button>
          <div className="flex items-center gap-[10px]">
            <button type="button" aria-label="Previous page" disabled={currentPage <= 1 || navigationDisabled} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="disabled:opacity-40"><PropertyIcon name="previous" size={26} /></button>
            <div className="flex gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, index) => { const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index; return <button type="button" key={page} aria-label={`Page ${page}`} aria-current={currentPage === page ? 'page' : undefined} disabled={navigationDisabled} onClick={() => setCurrentPage(page)} className={`${pageButton} w-7 font-medium ${currentPage === page ? '!border-brand-text !bg-brand-text !text-white' : ''}`}>{page}</button>; })}</div>
            <button type="button" aria-label="Next page" disabled={currentPage >= totalPages || navigationDisabled} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="disabled:opacity-40"><PropertyIcon name="next" size={26} className="rotate-180" /></button>
          </div>
          <button type="button" className={`${pageButton} w-10 font-medium`} disabled={currentPage >= totalPages || navigationDisabled} onClick={() => setCurrentPage(totalPages)}>Last</button>
        </nav>
      </div>
      {modal && <PropertyModal key={`${modal.mode}-${modal.id ?? 'new'}`} mode={modal.mode} id={modal.id} onClose={() => setModal(null)} />}
      {deleting && <DeletePropertyModal property={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
};

export default Properties;
