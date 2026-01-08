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

export type IndexType = {
  value: string;
  label: string;
  description: string;
};

export type Translation = {
  name: string;
  description: string;
};

export type Translations = {
  en: {
    features: Record<string, Translation>;
    actions: Record<string, string>;
    tables: Record<string, Translation>;
    columns: Record<string, string>;
  };
  fr: {
    features: Record<string, Translation>;
    actions: Record<string, string>;
    tables: Record<string, Translation>;
    columns: Record<string, string>;
  };
};

export type TableLayout = {
  columns: string[];
  columnWidths: Record<string, number>;
  defaultSort: {
    column: string;
    direction: 'asc' | 'desc';
  };
  hiddenColumns: string[];
  frozenColumns: string[];
};

export type ColumnLayout = {
  align: 'left' | 'right' | 'center';
  format: string;
  editable: boolean;
};

export type TableFeatures = {
  enablePagination: boolean;
  enableSearch: boolean;
  enableExport: boolean;
  enableFilters: boolean;
  rowsPerPage: number;
  allowedActions: string[];
};

export type ColumnFeatures = {
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  required: boolean;
  validation?: string;
};

export type ComponentLayout = {
  [key: string]: any;
};

export type FormField = {
  name: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime';
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: string;
  prefix?: string;
  suffix?: string;
};

export type FormSchema = {
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
};

export type ValidationRule = {
  pattern: string;
  message: string;
};

export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
};

export type Permissions = {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
};

export type Relationships = {
  hasMany?: string[];
  belongsTo?: string[];
  hasOne?: string[];
  belongsToMany?: string[];
};

export type UiView = {
  component: string;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showRelated?: boolean;
  tabs?: string[];
  redirect?: string;
};

export type ComponentNode = {
  component: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
  condition?: string;
  forEach?: string;
  dataSource?: string;
  comment?: string;
};

export type ComponentTree = ComponentNode;

// Type definition for the features config structure
type FeaturesConfig = {
  translations?: Translations;
  actions?: Record<string, Record<string, string>>;
  tableLayouts?: Record<string, TableLayout>;
  columnLayouts?: Record<string, ColumnLayout>;
  tableFeatures?: Record<string, TableFeatures>;
  columnFeatures?: Record<string, ColumnFeatures>;
  componentLayouts?: Record<string, ComponentLayout>;
  formSchemas?: Record<string, FormSchema>;
  validationRules?: Record<string, ValidationRule>;
  apiEndpoints?: Record<string, Record<string, ApiEndpoint>>;
  permissions?: Record<string, Permissions>;
  relationships?: Record<string, Relationships>;
  uiViews?: Record<string, Record<string, UiView>>;
  componentTrees?: Record<string, ComponentTree>;
  features: Feature[];
  dataTypes: DataType[];
  constraintTypes?: ConstraintType[];
  navItems: NavItem[];
  queryOperators?: QueryOperator[];
  indexTypes?: IndexType[];
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

export function getIndexTypes(): IndexType[] {
  return config.indexTypes || [];
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

export function getTranslations(locale: 'en' | 'fr' = 'en'): Translations[typeof locale] | undefined {
  return config.translations?.[locale];
}

export function getFeatureTranslation(featureId: string, locale: 'en' | 'fr' = 'en'): Translation | undefined {
  return config.translations?.[locale]?.features[featureId];
}

export function getActionTranslation(actionName: string, locale: 'en' | 'fr' = 'en'): string | undefined {
  return config.translations?.[locale]?.actions[actionName];
}

export function getTableTranslation(tableName: string, locale: 'en' | 'fr' = 'en'): Translation | undefined {
  return config.translations?.[locale]?.tables[tableName];
}

export function getColumnTranslation(columnName: string, locale: 'en' | 'fr' = 'en'): string | undefined {
  return config.translations?.[locale]?.columns[columnName];
}

export function getActionFunctionName(featureId: string, actionName: string): string | undefined {
  return config.actions?.[featureId]?.[actionName];
}

export function getTableLayout(tableName: string): TableLayout | undefined {
  return config.tableLayouts?.[tableName];
}

export function getColumnLayout(columnName: string): ColumnLayout | undefined {
  return config.columnLayouts?.[columnName];
}

export function getTableFeatures(tableName: string): TableFeatures | undefined {
  return config.tableFeatures?.[tableName];
}

export function getColumnFeatures(columnName: string): ColumnFeatures | undefined {
  return config.columnFeatures?.[columnName];
}

export function getComponentLayout(componentName: string): ComponentLayout | undefined {
  return config.componentLayouts?.[componentName];
}

export function getFormSchema(tableName: string): FormSchema | undefined {
  return config.formSchemas?.[tableName];
}

export function getValidationRule(ruleName: string): ValidationRule | undefined {
  return config.validationRules?.[ruleName];
}

export function getApiEndpoints(resourceName: string): Record<string, ApiEndpoint> | undefined {
  return config.apiEndpoints?.[resourceName];
}

export function getApiEndpoint(resourceName: string, action: string): ApiEndpoint | undefined {
  return config.apiEndpoints?.[resourceName]?.[action];
}

export function getPermissions(resourceName: string): Permissions | undefined {
  return config.permissions?.[resourceName];
}

export function hasPermission(resourceName: string, action: string, userRole: string): boolean {
  const permissions = config.permissions?.[resourceName];
  const allowedRoles = permissions?.[action as keyof Permissions];
  return allowedRoles?.includes(userRole) ?? false;
}

export function getRelationships(tableName: string): Relationships | undefined {
  return config.relationships?.[tableName];
}

export function getUiViews(resourceName: string): Record<string, UiView> | undefined {
  return config.uiViews?.[resourceName];
}

export function getUiView(resourceName: string, viewName: string): UiView | undefined {
  return config.uiViews?.[resourceName]?.[viewName];
}

export function getComponentTree(treeName: string): ComponentTree | undefined {
  return config.componentTrees?.[treeName];
}

export function getAllComponentTrees(): Record<string, ComponentTree> {
  return config.componentTrees || {};
}
