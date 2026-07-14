export interface Resource {
    id: string;
    name: string;
    description: string;
    category: 'lab' | 'equipment' | 'room';
    location: string;
    capacity: number;
    requiresApproval: boolean;
    isActive: boolean;
}
