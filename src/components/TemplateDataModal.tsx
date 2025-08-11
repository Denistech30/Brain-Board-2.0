import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface SubjectLite {
  name: string;
  total: number;
}

export interface TemplateExtraData {
  // Student fields not currently guaranteed in app
  matricule?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  className?: string;
  branchOfStudy?: string;
  option?: string;
  studentPhotoUrl?: string;

  // School header fields
  schoolName?: string;
  poBox?: string;
  telephone?: string;
  logoUrl?: string;

  // Term/meta
  termTitleEn?: string;
  termTitleFr?: string;
  teacherComment?: string;
  principalComment?: string;
  performanceFactors?: string;
  mention?: string;

  // Per subject
  subjectsMeta?: Array<{
    name: string;
    teacher?: string;
    coefficient?: number;
    performance?: string;
    remark?: string;
  }>;
}

interface TemplateDataModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
  subjects?: SubjectLite[];
  onSave: (data: TemplateExtraData) => void;
  // Optional dynamic fields to render (computed by the caller based on template + available app data)
  fields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'url';
    section?: 'student' | 'school' | 'term' | 'subject' | 'other';
    placeholder?: string;
    optional?: boolean;
  }>;
}

const DEFAULTS: Partial<TemplateExtraData> = {
  termTitleEn: 'FIRST TERM REPORT CARD',
  termTitleFr: 'BULLETIN DU PREMIER TRIMESTRE',
  schoolName: 'GOVERNMENT BILINGUAL HIGH SCHOOL YAOUNDE',
  poBox: 'P.O. BOX 1743 YAOUNDE',
  telephone: 'TEL: 222 23 45 67',
  mention: ''
};

const storageKey = (templateId: string) => `bb_template_extra_${templateId}`;

const TemplateDataModal: React.FC<TemplateDataModalProps> = ({ open, onClose, templateId, subjects = [], onSave, fields }) => {
  const [form, setForm] = useState<TemplateExtraData>({});

  const initialSubjectsMeta = useMemo(() => {
    return subjects.map(s => ({ name: s.name, teacher: '', coefficient: Math.max(1, Math.round((s.total || 20) / 5)), performance: '', remark: '' }));
  }, [subjects]);

  useEffect(() => {
    if (!open) return;
    // Load from localStorage if exists
    const stored = localStorage.getItem(storageKey(templateId));
    if (stored) {
      try {
        const parsed: TemplateExtraData = JSON.parse(stored);
        setForm({ ...initialSubjectsMeta.length ? { subjectsMeta: initialSubjectsMeta } : {}, ...DEFAULTS, ...parsed });
        return;
      } catch {}
    }
    setForm({ ...DEFAULTS, subjectsMeta: initialSubjectsMeta });
  }, [open, templateId, initialSubjectsMeta]);

  const handleChange = (field: keyof TemplateExtraData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubjectMetaChange = (index: number, field: 'teacher' | 'coefficient' | 'performance' | 'remark') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => {
      const list = prev.subjectsMeta ? [...prev.subjectsMeta] : [];
      list[index] = { ...list[index], [field]: field === 'coefficient' ? Number(e.target.value) : e.target.value };
      return { ...prev, subjectsMeta: list };
    });
  };

  const handleSave = () => {
    localStorage.setItem(storageKey(templateId), JSON.stringify(form));
    onSave(form);
    onClose();
  };

  // Helper to render a single dynamic field
  const renderDynamicField = (f: NonNullable<typeof fields>[number]) => {
    const commonProps = {
      fullWidth: true,
      size: 'small' as const,
      label: f.label + (f.optional ? ' (optional)' : ''),
      placeholder: f.placeholder,
      value: (form as any)[f.key] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))
    };
    if (f.type === 'textarea') {
      return <TextField {...commonProps} multiline minRows={2} />;
    }
    return <TextField {...commonProps} type={f.type === 'number' ? 'number' : (f.type === 'date' ? 'date' : (f.type === 'url' ? 'url' : 'text'))} />;
  };

  const groupedFields = useMemo(() => {
    const groups: Record<string, NonNullable<typeof fields>> = { student: [], school: [], term: [], other: [] } as any;
    (fields || []).forEach(f => {
      const s = f.section || 'other';
      (groups[s] = groups[s] || []).push(f);
    });
    return groups;
  }, [fields]);

  const hasDynamic = !!fields && fields.length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Template required info</Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {hasDynamic ? (
            <>
              {groupedFields.student && groupedFields.student.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Student information</Typography>
                  </Grid>
                  {groupedFields.student.map(f => (
                    <Grid item xs={12} sm={6} key={f.key}>
                      {renderDynamicField(f)}
                    </Grid>
                  ))}
                  <Grid item xs={12} mt={1}><Divider /></Grid>
                </>
              )}

              {groupedFields.school && groupedFields.school.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>School header</Typography>
                  </Grid>
                  {groupedFields.school.map(f => (
                    <Grid item xs={12} sm={6} key={f.key}>
                      {renderDynamicField(f)}
                    </Grid>
                  ))}
                  <Grid item xs={12} mt={1}><Divider /></Grid>
                </>
              )}

              {groupedFields.term && groupedFields.term.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Term and remarks</Typography>
                  </Grid>
                  {groupedFields.term.map(f => (
                    <Grid item xs={12} sm={f.type === 'textarea' ? 12 : 6} key={f.key}>
                      {renderDynamicField(f)}
                    </Grid>
                  ))}
                  <Grid item xs={12} mt={1}><Divider /></Grid>
                </>
              )}
            </>
          ) : (
            <>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Student information (missing fields)</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Matricule" fullWidth size="small" value={form.matricule || ''} onChange={handleChange('matricule')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Date of Birth" placeholder="DD/MM/YYYY" fullWidth size="small" value={form.dateOfBirth || ''} onChange={handleChange('dateOfBirth')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Place of Birth" fullWidth size="small" value={form.placeOfBirth || ''} onChange={handleChange('placeOfBirth')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Class Name" placeholder="e.g., Upper Sixth Sci." fullWidth size="small" value={form.className || ''} onChange={handleChange('className')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Branch of Study" placeholder="e.g., General Education" fullWidth size="small" value={form.branchOfStudy || ''} onChange={handleChange('branchOfStudy')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Option" placeholder="e.g., Science" fullWidth size="small" value={form.option || ''} onChange={handleChange('option')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Student Photo URL (optional)" fullWidth size="small" value={form.studentPhotoUrl || ''} onChange={handleChange('studentPhotoUrl')} />
          </Grid>

          <Grid item xs={12} mt={1}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>School header</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="School Name" fullWidth size="small" value={form.schoolName || ''} onChange={handleChange('schoolName')} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="P.O. Box" fullWidth size="small" value={form.poBox || ''} onChange={handleChange('poBox')} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Telephone" fullWidth size="small" value={form.telephone || ''} onChange={handleChange('telephone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Logo URL (optional)" fullWidth size="small" value={form.logoUrl || ''} onChange={handleChange('logoUrl')} />
          </Grid>

          <Grid item xs={12} mt={1}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Term and remarks</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Term Title (EN)" fullWidth size="small" value={form.termTitleEn || ''} onChange={handleChange('termTitleEn')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Term Title (FR)" fullWidth size="small" value={form.termTitleFr || ''} onChange={handleChange('termTitleFr')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Performance Factors" fullWidth size="small" value={form.performanceFactors || ''} onChange={handleChange('performanceFactors')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Class Teacher's Comment" fullWidth size="small" multiline minRows={2} value={form.teacherComment || ''} onChange={handleChange('teacherComment')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Principal's Comment" fullWidth size="small" multiline minRows={2} value={form.principalComment || ''} onChange={handleChange('principalComment')} />
          </Grid>

          <Grid item xs={12} mt={1}>
            <Divider />
          </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Subjects meta</Typography>
              {!subjects.length && (
                <Chip label="No subjects available in this view" size="small" />
              )}
            </Box>
          </Grid>
          {subjects.length > 0 && (form.subjectsMeta || []).map((s, idx) => (
            <React.Fragment key={s.name}>
              <Grid item xs={12} sm={6}>
                <TextField label={`Teacher for ${s.name}`} fullWidth size="small" value={s.teacher || ''} onChange={handleSubjectMetaChange(idx, 'teacher')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="number" inputProps={{ min: 1 }} label={`Coefficient for ${s.name}`} fullWidth size="small" value={s.coefficient ?? ''} onChange={handleSubjectMetaChange(idx, 'coefficient')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={`Performance for ${s.name}`} fullWidth size="small" value={s.performance || ''} onChange={handleSubjectMetaChange(idx, 'performance')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={`Remark for ${s.name}`} fullWidth size="small" value={s.remark || ''} onChange={handleSubjectMetaChange(idx, 'remark')} />
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" variant="text">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDataModal;
