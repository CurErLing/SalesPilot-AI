import React, { useState } from 'react';
import { Customer, VisitRecord } from '../types';
import { VisitRecordList } from './visit/VisitRecordList';
import { VisitRecordDetail } from './visit/VisitRecordDetail';

interface Props {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

const VisitRecordsView: React.FC<Props> = ({ customer, onUpdate }) => {
  const [editingRecord, setEditingRecord] = useState<VisitRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // --- Handlers ---
  const handleAddNew = () => {
    const newRecord: VisitRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'Meeting',
      status: 'Planned',
      title: '',
      content: '',
      nextSteps: '',
      sentiment: 'Neutral',
      images: [],
      transcript: '',
      audioUrl: '',
      speakerMapping: {},
      stakeholderIds: []
    };
    setEditingRecord(newRecord);
    setIsCreating(true);
  };

  const handleSelectRecord = (record: VisitRecord) => {
    setEditingRecord(record);
    setIsCreating(false);
  };

  const handleBack = () => {
    setEditingRecord(null);
    setIsCreating(false);
  };

  const handleSaveRecord = (record: VisitRecord) => {
    const existingIndex = customer.visits.findIndex(v => v.id === record.id);
    let updatedVisits = [...(customer.visits || [])];

    if (existingIndex >= 0) {
        updatedVisits[existingIndex] = record;
    } else {
        updatedVisits = [record, ...updatedVisits];
    }
    
    // Sort by date descending
    updatedVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    onUpdate({ ...customer, visits: updatedVisits });
    
    // If we were creating, we are no longer "new", but we stay on detail view
    if (isCreating) setIsCreating(false);
    
    // Update local view state to reflect saved changes immediately
    setEditingRecord(record);
  };

  // --- Render ---
  if (editingRecord) {
      return (
          <VisitRecordDetail 
              record={editingRecord}
              customer={customer}
              isNew={isCreating}
              onSave={handleSaveRecord}
              onBack={handleBack}
          />
      );
  }

  return (
      <VisitRecordList 
          visits={customer.visits}
          customer={customer}
          onSelect={handleSelectRecord}
          onAdd={handleAddNew}
      />
  );
};

export default VisitRecordsView;