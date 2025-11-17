/**
 * UICP Component Registry
 * Pre-register all UICP components here for Next.js
 */

import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

// Register all components on module import
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// Export a function to ensure registration happens
export function initializeUICPComponents() {
  // Components are already registered on module load
  return true;
}

