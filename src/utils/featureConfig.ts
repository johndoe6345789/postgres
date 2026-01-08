import featuresConfig from '@/config/features.json';

export type Feature = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: string;
  endpoints: Array<{
    path: string;
    methods: string[];
    description: string;
  }>;
  ui: {
    showInNav: boolean;
    icon: string;
    actions: string[];
  };
};

export type DataType = {
  name: string;
  category: string;
  requiresLength: boolean;
  defaultLength?: number;
  autoIncrement?: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  featureId: string;
};

export type ConstraintType = {
  name: string;
  description: string;
  requiresColumn: boolean;
  requiresExpression: boolean;
};

export type QueryOperator = {
  value: string;
  label: string;
};

// Type definition for the features config structure
type FeaturesConfig = {
  features: Feature[];
  dataTypes: DataType[];
  constraintTypes?: ConstraintType[];
  navItems: NavItem[];
  queryOperators?: QueryOperator[];
};

const config = featuresConfig as FeaturesConfig;

export function getFeatures(): Feature[] {
  return config.features.filter(f => f.enabled);
}

export function getFeatureById(id: string): Feature | undefined {
  return config.features.find(f => f.id === id && f.enabled);
}

export function getDataTypes(): DataType[] {
  return config.dataTypes;
}

export function getConstraintTypes(): ConstraintType[] {
  return config.constraintTypes || [];
}

export function getQueryOperators(): QueryOperator[] {
  return config.queryOperators || [];
}

export function getNavItems(): NavItem[] {
  return config.navItems.filter((item) => {
    const feature = getFeatureById(item.featureId);
    return feature && feature.enabled;
  });
}

export function getEnabledFeaturesByPriority(priority: string): Feature[] {
  return config.features.filter(
    f => f.enabled && f.priority === priority,
  );
}
