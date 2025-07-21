import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children 
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children,
  className = ''
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isActive = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={className}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children,
  className = ''
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }
  
  const { value: selectedValue } = context;
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div 
      role="tabpanel"
      data-state={'active'}
      className={className}
    >
      {children}
    </div>
  );
};