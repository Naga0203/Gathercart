import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  AlertTriangle,
  Pencil,
  Save,
  X,
  ChevronRight,
  Plus,
  Trash2,
  Star,
  Home,
} from 'lucide-react';
import { Card, Button, Input, Badge, Breadcrumb, Alert, Modal, EmptyState, ConfirmDialog } from '../../components/common';
import { useAuth } from '../../features/auth/useAuth';
import { authService } from '../../services/authService';
import { addressService } from '../../services/addressService';
import type { AuthUser } from '../../types/auth';
import type { Address, AddressPayload } from '../../services/addressService';

export const ProfilePage: React.FC = () => {
  const { isLoading: authLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    authService.getMe()
      .then((data) => {
        setProfile(data);
        setEditName(data.fullName);
        setEditPhone(data.phone || '');
      })
      .catch(() => setError('Failed to load profile'));

    addressService.getAddresses()
      .then(setAddresses)
      .catch(() => { });
  }, []);

  const handleEdit = () => {
    if (profile) {
      setEditName(profile.fullName);
      setEditPhone(profile.phone || '');
      setIsEditing(true);
      setError(null);
      setSuccess(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      setError('Name and phone are required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const updated = await authService.updateProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
      });
      setProfile(updated);
      updateUser(updated);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || (err instanceof Error ? err.message : 'Update failed'));
    } finally {
      setIsSaving(false);
    }
  };

  // Address CRUD
  const openAddressModal = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrLabel(addr.label || '');
      setAddrLine1(addr.addressLine1);
      setAddrLine2(addr.addressLine2 || '');
      setAddrPincode(addr.pincode);
      setAddrIsDefault(addr.isDefault);
    } else {
      setEditingAddress(null);
      setAddrLabel('');
      setAddrLine1('');
      setAddrLine2('');
      setAddrPincode('');
      setAddrIsDefault(addresses.length === 0);
    }
    setError(null);
    setSuccess(null);
    setAddressModalOpen(true);
  };

  const handleAddressSave = async () => {
    if (!addrLine1.trim() || !addrPincode.trim()) {
      setError('Address and pincode are required');
      return;
    }
    setAddrSaving(true);
    setError(null);
    try {
      const payload: AddressPayload = {
        label: addrLabel.trim() || undefined,
        addressLine1: addrLine1.trim(),
        addressLine2: addrLine2.trim() || undefined,
        pincode: addrPincode.trim(),
        isDefault: addrIsDefault,
      };
      if (editingAddress) {
        const updated = await addressService.updateAddress(editingAddress.id, payload);
        setAddresses((prev) => prev.map((a) =>
          a.id === updated.id ? updated : (updated.isDefault ? { ...a, isDefault: false } : a)
        ));
      } else {
        const created = await addressService.createAddress(payload);
        setAddresses((prev) =>
          created.isDefault ? [...prev.map((a) => ({ ...a, isDefault: false })), created] : [...prev, created]
        );
      }
      setAddressModalOpen(false);
      setSuccess(editingAddress ? 'Address updated' : 'Address added');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to save address');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleAddressDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await addressService.deleteAddress(deleteConfirmId);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setSuccess('Address deleted');
    } catch {
      setError('Failed to delete address');
      setDeleteConfirmId(null);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
      </div>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'My Profile' },
        ]}
      />

      {/* Profile Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-bold shadow-md flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {profile.fullName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={profile.role === 'ADMIN' ? 'amber' : 'green'} size="sm">
              {profile.role}
            </Badge>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Pencil className="w-3.5 h-3.5" />}
            onClick={handleEdit}
          >
            Edit
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Profile Details Card */}
      <Card padding="lg" className="space-y-5">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Personal Information
        </h2>

        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              leftAddon={<User className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+919876543210"
              leftAddon={<Phone className="w-4 h-4" />}
            />
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ProfileRow icon={<User className="w-4 h-4" />} label="Full Name" value={profile.fullName} />
            <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
            <ProfileRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone || '—'} />
            <ProfileRow icon={<Shield className="w-4 h-4" />} label="Role" value={profile.role} />
            <ProfileRow icon={<MapPin className="w-4 h-4" />} label="Cluster" value={profile.clusterName || `Cluster #${profile.clusterId || '—'}`} />
            {(profile.penaltyCount ?? 0) > 0 && (
              <ProfileRow
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                label="Penalties"
                value={`${profile.penaltyCount} (late payment timeouts)`}
              />
            )}
          </div>
        )}
      </Card>

      {/* Addresses Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Delivery Addresses
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openAddressModal()}
            disabled={addresses.length >= 5}
          >
            Add
          </Button>
        </div>

        {addresses.length === 0 ? (
          <EmptyState
            title="No addresses saved"
            description="Add a delivery address for your neighbourhood hub pickups."
            actionLabel="Add Address"
            onAction={() => openAddressModal()}
          />
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                  <Home className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {addr.label && (
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {addr.label}
                      </span>
                    )}
                    {addr.isDefault && (
                      <Badge variant="green" size="sm">
                        <Star className="w-3 h-3 mr-0.5 inline" />Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{addr.addressLine1}</div>
                  {addr.addressLine2 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{addr.addressLine2}</div>
                  )}
                  <div className="text-xs text-slate-400 dark:text-slate-500">{addr.pincode}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openAddressModal(addr)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(addr.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <Card padding="md" className="space-y-1">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Links
        </h2>
        <QuickLink to="/orders" label="My Orders & Pledges" />
        <QuickLink to="/" label="Browse Active Offers" />
      </Card>

      {/* Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add Address'}
      >
        <div className="space-y-4">
          <Input
            label="Label (optional)"
            value={addrLabel}
            onChange={(e) => setAddrLabel(e.target.value)}
            placeholder="e.g. Home, Office"
          />
          <Input
            label="Address Line 1 *"
            value={addrLine1}
            onChange={(e) => setAddrLine1(e.target.value)}
            placeholder="Flat No., Floor & Apartment"
          />
          <Input
            label="Address Line 2"
            value={addrLine2}
            onChange={(e) => setAddrLine2(e.target.value)}
            placeholder="Street, Area, Landmark"
          />
          <Input
            label="Pincode *"
            value={addrPincode}
            onChange={(e) => setAddrPincode(e.target.value)}
            placeholder="560038"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addrIsDefault}
              onChange={(e) => setAddrIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Set as default address
            </span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleAddressSave}
              disabled={addrSaving}
            >
              {addrSaving ? 'Saving...' : editingAddress ? 'Update' : 'Add Address'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddressModalOpen(false)}
              disabled={addrSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleAddressDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

const ProfileRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
        {value}
      </div>
    </div>
  </div>
);

const QuickLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
  >
    <span>{label}</span>
    <ChevronRight className="w-4 h-4 text-slate-400" />
  </Link>
);
