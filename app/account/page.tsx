'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Users, 
  Flame, 
  Zap, 
  Tag, 
  CreditCard,
  TrendingUp,
  Edit2,
  CheckCircle,
  Shield,
  ArrowLeft,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConversationalProfileEditor from '@/components/account/ConversationalProfileEditor';
import { UserAccount, UserProfile } from '@/lib/types/accountTypes';
import { getFieldConfig } from '@/lib/editableFields';

// Mock data - replace with actual API calls
const MOCK_USER_ACCOUNT: UserAccount = {
  id: 'user-123',
  email: 'sarah@example.com',
  name: 'Sarah Johnson',
  phone: '+44 7700 900123',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-03-20'),
  emailVerified: true,
  twoFactorEnabled: false,
};

const MOCK_USER_PROFILE: UserProfile = {
  userId: 'user-123',
  postcode: 'SW1A 1AA',
  homeType: 'semi-detached',
  occupants: 3,
  heatingType: 'gas',
  supplier: 'octopus',
  tariffName: 'Flexible Octopus',
  tariffType: 'variable',
  dayRate: 28.5,
  standingCharge: 45,
  paymentMethod: 'direct-debit',
  smartMeterType: 'SMETS2',
  estimatedAnnualUsage: 3200,
  hasElectricVehicle: false,
  hasSolarPanels: false,
  profileCompleteness: 85,
  lastUpdated: new Date('2024-03-20'),
  dataSource: {
    postcode: 'onboarding',
    homeType: 'onboarding',
    occupants: 'onboarding',
    heatingType: 'bill',
    supplier: 'bill',
    tariffName: 'bill',
    dayRate: 'bill',
    standingCharge: 'bill',
    paymentMethod: 'manual',
    smartMeterType: 'photo',
    estimatedAnnualUsage: 'photo',
  },
};

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load profile from Firestore
        const profile = await getUserProfile(user.uid);
        
        if (!profile) {
          // Redirect to onboarding if no profile exists
          router.push('/onboarding-conversational');
          return;
        }

        // Convert profile to account and profile format
        const account: UserAccount = {
          id: profile.uid,
          email: profile.email,
          name: profile.displayName,
          phone: undefined, // Not in current UserProfile schema
          createdAt: profile.createdAt,
          updatedAt: profile.lastLoginAt,
          emailVerified: true, // From Firebase auth
          twoFactorEnabled: false,
        };

        const userProfileData: UserProfile = {
          userId: profile.uid,
          postcode: profile.postcode || '',
          homeType: (profile.homeType as UserProfile['homeType']) || 'semi-detached',
          occupants: profile.occupants || 2,
          heatingType: (profile.heatingType as UserProfile['heatingType']) || 'gas',
          supplier: undefined,
          tariffName: undefined,
          tariffType: undefined,
          dayRate: undefined,
          standingCharge: undefined,
          paymentMethod: undefined,
          smartMeterType: undefined,
          estimatedAnnualUsage: undefined,
          hasElectricVehicle: false,
          hasSolarPanels: false,
          profileCompleteness: profile.profileCompleteness,
          lastUpdated: profile.lastLoginAt,
          dataSource: {
            postcode: 'onboarding',
            homeType: 'onboarding',
            occupants: 'onboarding',
            heatingType: 'onboarding',
          },
        };

        setUserAccount(account);
        setUserProfile(userProfileData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user, router]);

  const handleEditField = (fieldKey: string) => {
    setEditingField(fieldKey);
  };

  const handleSaveField = async (fieldKey: string, newValue: any) => {
    if (!user || !userProfile) return;

    try {
      setSaving(true);
      setError(null);

      // Save to Firestore
      await updateUserProfile(user.uid, {
        [fieldKey]: newValue,
      });

      // Update local state
      setUserProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [fieldKey]: newValue,
          lastUpdated: new Date(),
          dataSource: {
            ...prev.dataSource,
            [fieldKey]: 'manual',
          },
        };
      });

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Close editor after brief delay
      setTimeout(() => {
        setEditingField(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving field:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No profile state
  if (!userAccount || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile found</p>
        </div>
      </div>
    );
  }

  // If editing a field, show conversational editor
  if (editingField) {
    const fieldConfig = getFieldConfig(editingField);
    if (fieldConfig) {
      return (
        <ConversationalProfileEditor
          field={fieldConfig}
          currentValue={userProfile[editingField as keyof UserProfile]}
          userProfile={userProfile}
          onSave={handleSaveField}
          onCancel={handleCancelEdit}
          saving={saving}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard-new')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Account</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-slide-down">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Changes saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <div className="text-red-600 text-xl">⚠️</div>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Completeness */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Hi, {userAccount.name.split(' ')[0]}! 👋</h2>
              <p className="text-blue-100 mt-1">
                Your profile is {userProfile.profileCompleteness}% complete
              </p>
            </div>
            {userAccount.emailVerified && (
              <CheckCircle className="w-8 h-8 text-green-300" />
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${userProfile.profileCompleteness}%` }}
            />
          </div>

          {userProfile.profileCompleteness < 100 && (
            <p className="text-sm text-blue-100 mt-3">
              💡 Complete your profile to get more accurate savings estimates
            </p>
          )}
        </Card>

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <InfoCard
              icon={<User className="w-5 h-5 text-blue-600" />}
              label="Name"
              value={userAccount.name}
              onEdit={() => handleEditField('name')}
              dataSource="Account"
            />
            <InfoCard
              icon={<Mail className="w-5 h-5 text-blue-600" />}
              label="Email"
              value={userAccount.email}
              verified={userAccount.emailVerified}
              onEdit={() => handleEditField('email')}
              dataSource="Account"
            />
            <InfoCard
              icon={<Phone className="w-5 h-5 text-blue-600" />}
              label="Phone"
              value={userAccount.phone || 'Not set'}
              onEdit={() => handleEditField('phone')}
              dataSource="Account"
            />
            <InfoCard
              icon={<MapPin className="w-5 h-5 text-blue-600" />}
              label="Postcode"
              value={userProfile.postcode}
              onEdit={() => handleEditField('postcode')}
              dataSource={userProfile.dataSource?.postcode}
            />
          </div>
        </section>

        {/* Household Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Household Details
          </h3>
          <div className="space-y-3">
            <InfoCard
              icon={<Home className="w-5 h-5 text-green-600" />}
              label="Home Type"
              value={formatHomeType(userProfile.homeType)}
              onEdit={() => handleEditField('homeType')}
              dataSource={userProfile.dataSource?.homeType}
            />
            <InfoCard
              icon={<Users className="w-5 h-5 text-green-600" />}
              label="Occupants"
              value={`${userProfile.occupants} ${userProfile.occupants === 1 ? 'person' : 'people'}`}
              onEdit={() => handleEditField('occupants')}
              dataSource={userProfile.dataSource?.occupants}
            />
            <InfoCard
              icon={<Flame className="w-5 h-5 text-green-600" />}
              label="Heating Type"
              value={formatHeatingType(userProfile.heatingType)}
              onEdit={() => handleEditField('heatingType')}
              dataSource={userProfile.dataSource?.heatingType}
            />
            {userProfile.hasElectricVehicle && (
              <InfoCard
                icon={<Zap className="w-5 h-5 text-green-600" />}
                label="Electric Vehicle"
                value="Yes"
                badge="EV"
                dataSource="Manual"
              />
            )}
            {userProfile.hasSolarPanels && (
              <InfoCard
                icon={<Zap className="w-5 h-5 text-green-600" />}
                label="Solar Panels"
                value="Yes"
                badge="Solar"
                dataSource="Manual"
              />
            )}
          </div>
        </section>

        {/* Energy Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Energy Details
          </h3>
          <div className="space-y-3">
            {userProfile.supplier && (
              <InfoCard
                icon={<Tag className="w-5 h-5 text-purple-600" />}
                label="Supplier"
                value={formatSupplier(userProfile.supplier)}
                onEdit={() => handleEditField('supplier')}
                dataSource={userProfile.dataSource?.supplier}
              />
            )}
            {userProfile.tariffName && (
              <InfoCard
                icon={<Tag className="w-5 h-5 text-purple-600" />}
                label="Tariff"
                value={userProfile.tariffName}
                onEdit={() => handleEditField('tariffName')}
                dataSource={userProfile.dataSource?.tariffName}
              />
            )}
            {userProfile.dayRate && (
              <InfoCard
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                label="Unit Rate"
                value={`${userProfile.dayRate}p/kWh`}
                onEdit={() => handleEditField('dayRate')}
                dataSource={userProfile.dataSource?.dayRate}
              />
            )}
            {userProfile.standingCharge && (
              <InfoCard
                icon={<CreditCard className="w-5 h-5 text-purple-600" />}
                label="Standing Charge"
                value={`${userProfile.standingCharge}p/day`}
                onEdit={() => handleEditField('standingCharge')}
                dataSource={userProfile.dataSource?.standingCharge}
              />
            )}
            {userProfile.paymentMethod && (
              <InfoCard
                icon={<CreditCard className="w-5 h-5 text-purple-600" />}
                label="Payment Method"
                value={formatPaymentMethod(userProfile.paymentMethod)}
                onEdit={() => handleEditField('paymentMethod')}
                dataSource={userProfile.dataSource?.paymentMethod}
              />
            )}
            {userProfile.smartMeterType && (
              <InfoCard
                icon={<Zap className="w-5 h-5 text-purple-600" />}
                label="Smart Meter"
                value={userProfile.smartMeterType}
                onEdit={() => handleEditField('smartMeterType')}
                dataSource={userProfile.dataSource?.smartMeterType}
              />
            )}
            {userProfile.estimatedAnnualUsage && (
              <InfoCard
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                label="Annual Usage"
                value={`${userProfile.estimatedAnnualUsage.toLocaleString()} kWh`}
                onEdit={() => handleEditField('estimatedAnnualUsage')}
                dataSource={userProfile.dataSource?.estimatedAnnualUsage}
              />
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="py-6 text-left justify-start"
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">Settings</div>
              <div className="text-xs text-gray-500">Notifications, privacy, preferences</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="py-6 text-left justify-start"
            onClick={() => router.push('/account/privacy')}
          >
            <Shield className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">Privacy & Data</div>
              <div className="text-xs text-gray-500">Export data, delete account, GDPR rights</div>
            </div>
          </Button>
        </section>

        {/* Account Created */}
        <div className="text-center text-sm text-gray-500 pt-4">
          Account created {formatDate(userAccount.createdAt)}
        </div>
      </div>
    </div>
  );
}

/**
 * InfoCard Component
 */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit?: () => void;
  verified?: boolean;
  badge?: string;
  dataSource?: string;
}

function InfoCard({ icon, label, value, onEdit, verified, badge, dataSource }: InfoCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="mr-3">{icon}</div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {value}
              {verified && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {badge && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {dataSource && (
              <div className="text-xs text-gray-400 mt-1">
                Source: {formatDataSource(dataSource)}
              </div>
            )}
          </div>
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * Formatting helpers
 */
function formatHomeType(type: string): string {
  const map: Record<string, string> = {
    flat: 'Flat',
    terraced: 'Terraced House',
    'semi-detached': 'Semi-Detached House',
    detached: 'Detached House',
  };
  return map[type] || type;
}

function formatHeatingType(type: string): string {
  const map: Record<string, string> = {
    gas: 'Gas Central Heating',
    electricity: 'Electric Heating',
    'heat-pump': 'Heat Pump',
    mixed: 'Mixed (Gas + Electric)',
  };
  return map[type] || type;
}

function formatSupplier(supplier: string): string {
  const map: Record<string, string> = {
    octopus: 'Octopus Energy',
    'british-gas': 'British Gas',
    edf: 'EDF Energy',
    eon: 'E.ON',
    'scottish-power': 'Scottish Power',
    ovo: 'OVO Energy',
    bulb: 'Bulb',
    shell: 'Shell Energy',
    other: 'Other',
  };
  return map[supplier] || supplier;
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    'direct-debit': 'Direct Debit',
    prepayment: 'Prepayment Meter',
    'standard-credit': 'Standard Credit',
  };
  return map[method] || method;
}

function formatDataSource(source: string): string {
  const map: Record<string, string> = {
    manual: 'Manually entered',
    bill: 'Extracted from bill',
    photo: 'Extracted from photo',
    onboarding: 'Onboarding',
  };
  return map[source] || source;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
