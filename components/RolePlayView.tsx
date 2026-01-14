
import React, { useState } from 'react';
import { Customer, Stakeholder } from '../types';
import { RolePlaySelection } from './roleplay/RolePlaySelection';
import { RolePlaySession } from './roleplay/RolePlaySession';

interface Props {
  customer: Customer;
}

const RolePlayView: React.FC<Props> = ({ customer }) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  if (selectedStakeholder) {
    return (
      <RolePlaySession 
        customer={customer}
        stakeholder={selectedStakeholder}
        onEndSession={() => setSelectedStakeholder(null)}
      />
    );
  }

  return (
    <RolePlaySelection 
      customer={customer} 
      onSelect={setSelectedStakeholder} 
    />
  );
};

export default RolePlayView;
