import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Company } from '../../types';
import apiService from '../../services/api';
import { Card } from './Card';
import { Button } from './Button';

interface CompanySelectorProps {
  onCompanySelect: (company: Company | null) => void;
  selectedCompany: Company | null;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  onCompanySelect,
  selectedCompany,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async (query: string) => {
    if (query.length < 2) {
      setCompanies([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedCompanies = await apiService.getCompanies(query);
      setCompanies(fetchedCompanies);
    } catch (err: any) {
      setError('Failed to fetch companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompanies(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectCompany = (company: Company) => {
    onCompanySelect(company);
    setSearchQuery('');
    setCompanies([]);
  };

  const handleClearSelection = () => {
    onCompanySelect(null);
    setSearchQuery('');
    setCompanies([]);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return '#10b981';
      case 'professional':
        return '#3b82f6';
      case 'enterprise':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <TouchableOpacity onPress={() => handleSelectCompany(item)}>
      <Card style={styles.companyCard} variant="outlined">
        <View style={styles.companyHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.companyDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.planBadge,
              { backgroundColor: getPlanColor(item.subscription_plan) },
            ]}
          >
            <Text style={styles.planText}>{item.subscription_plan}</Text>
          </View>
        </View>
        
        <View style={styles.companyDetails}>
          <Text style={styles.companyEmail}>{item.email}</Text>
          {item.is_trial_active && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>Trial Active</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (selectedCompany) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Selected Company</Text>
        <Card style={styles.selectedCard} variant="elevated">
          <View style={styles.selectedHeader}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedCompany.name}</Text>
              <Text style={styles.selectedEmail}>{selectedCompany.email}</Text>
            </View>
            <TouchableOpacity onPress={handleClearSelection}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedDetails}>
            <View
              style={[
                styles.selectedPlanBadge,
                { backgroundColor: getPlanColor(selectedCompany.subscription_plan) },
              ]}
            >
              <Text style={styles.selectedPlanText}>
                {selectedCompany.subscription_plan}
              </Text>
            </View>
            {selectedCompany.is_trial_active && (
              <View style={styles.selectedTrialBadge}>
                <Text style={styles.selectedTrialText}>Trial Active</Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Your Company</Text>
      <Text style={styles.description}>
        Search for your company to join
      </Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your company..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {loading && (
          <ActivityIndicator size="small" color="#3b82f6" style={styles.loadingIcon} />
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {companies.length > 0 && (
        <View style={styles.companiesList}>
          <FlatList
            data={companies}
            renderItem={renderCompanyItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
          />
        </View>
      )}

      {searchQuery.length >= 2 && companies.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No companies found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  companiesList: {
    maxHeight: 300,
  },
  flatList: {
    flexGrow: 0,
  },
  companyCard: {
    marginBottom: 12,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  companyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyEmail: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  trialBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trialText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  selectedCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  selectedEmail: {
    fontSize: 14,
    color: '#1e40af',
  },
  selectedDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPlanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedPlanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  selectedTrialBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedTrialText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
