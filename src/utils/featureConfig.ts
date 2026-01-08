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

export function getFeatures(): Feature[] {
  return featuresConfig.features.filter(f => f.enabled);
}

export function getFeatureById(id: string): Feature | undefined {
  return featuresConfig.features.find(f => f.id === id && f.enabled);
}

export function getDataTypes(): DataType[] {
  return featuresConfig.dataTypes;
}

export function getConstraintTypes(): ConstraintType[] {
  return (featuresConfig as any).constraintTypes || [];
}

export function getNavItems(): NavItem[] {
  return featuresConfig.navItems.filter(item => {
    const feature = getFeatureById(item.featureId);
    return feature && feature.enabled;
  });
}

export function getEnabledFeaturesByPriority(priority: string): Feature[] {
  return featuresConfig.features.filter(
    f => f.enabled && f.priority === priority,
  );
}
