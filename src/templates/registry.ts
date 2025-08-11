export type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'url';

export interface TemplateField {
  key: string; // unique identifier, used in form storage
  label: string;
  type: FieldType;
  section?: 'student' | 'school' | 'term' | 'subject' | 'other';
  placeholder?: string;
  optional?: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  requiredFields: TemplateField[];
}

// Registry of templates with their required fields.
export const templatesRegistry: Record<string, TemplateDefinition> = {
  'classic-a4': {
    id: 'classic-a4',
    name: 'Classic A4 Portrait',
    requiredFields: [
      // student
      { key: 'matricule', label: 'Matricule', type: 'text', section: 'student' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'text', section: 'student', placeholder: 'DD/MM/YYYY' },
      { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', section: 'student' },
      { key: 'className', label: 'Class Name', type: 'text', section: 'student' },
      { key: 'branchOfStudy', label: 'Branch of Study', type: 'text', section: 'student' },
      { key: 'option', label: 'Option', type: 'text', section: 'student' },
      { key: 'studentPhotoUrl', label: 'Student Photo URL', type: 'url', section: 'student', optional: true },

      // school header
      { key: 'schoolName', label: 'School Name', type: 'text', section: 'school' },
      { key: 'poBox', label: 'P.O. Box', type: 'text', section: 'school' },
      { key: 'telephone', label: 'Telephone', type: 'text', section: 'school' },
      { key: 'logoUrl', label: 'Logo URL', type: 'url', section: 'school', optional: true },

      // term/meta
      { key: 'termTitleEn', label: 'Term Title (EN)', type: 'text', section: 'term' },
      { key: 'termTitleFr', label: 'Term Title (FR)', type: 'text', section: 'term' },
      { key: 'performanceFactors', label: "Performance Factors", type: 'text', section: 'term', optional: true },
      { key: 'teacherComment', label: "Class Teacher's Comment", type: 'textarea', section: 'term', optional: true },
      { key: 'principalComment', label: "Principal's Comment", type: 'textarea', section: 'term', optional: true },
      { key: 'mention', label: 'Mention', type: 'text', section: 'term', optional: true },

      // per-subject dynamic handled separately (teacher, coefficient)
    ],
  },
};
