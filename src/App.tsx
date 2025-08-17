import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Menu,
  MenuItem as MuiMenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import LogoutIcon from '@mui/icons-material/Logout';
import { StudentMarks, SequenceResult, TermResult, AnnualResult } from './types';
import StudentModal from './components/StudentModal';
import SubjectModal from './components/SubjectModal';
import MarksTable from './components/MarksTable';
import ResultsTable from './components/ResultsTable';
import ReportModal from './components/ReportModal';
import BulkMarksEntry from './components/BulkMarksEntry';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import GradesPage from './components/GradesPage';
import EnhancedCalculatePage from './components/EnhancedCalculatePage';
import EnhancedResultsPage from './components/EnhancedResultsPage';
import TemplateGalleryPage from './components/TemplateGalleryPage';
import { generateStudentReport, generateResultsPDF } from './utils/pdfGenerator';
// Supabase for image storage
import { supabase, SUPABASE_BUCKET } from './supabaseClient';
import { useAuth } from './context/AuthContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import { collection, doc, addDoc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from './firebaseConfig';

interface FirestoreStudent {
  id: string;
  name: string;
  imageUrl?: string;
  imagePath?: string; // Supabase object path for cleanup
}

interface FirestoreSubject {
  id: string;
  name: string;
  total: number;
  teacher?: string;
}

function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { currentUser, loading, logout } = useAuth();
  
  // State management
  const [students, setStudents] = useState<FirestoreStudent[]>([]);
  const [subjects, setSubjects] = useState<FirestoreSubject[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  // Template generation flow state
  const [reportForTemplate, setReportForTemplate] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [pendingTemplateData, setPendingTemplateData] = useState<any | null>(null);
  const [bulkMarksModalOpen, setBulkMarksModalOpen] = useState(false);
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<keyof StudentMarks>('firstSequence');
  const [selectedResultView, setSelectedResultView] = useState<'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual'>('sequence');
  const [studentComments, setStudentComments] = useState<{[key: number]: {[key: string]: string}}>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'grades' | 'calculate' | 'results' | 'print'>('home');
  const isMenuOpen = Boolean(menuAnchorEl);

  // Results state
  const [sequenceResults, setSequenceResults] = useState<SequenceResult[]>([]);
  const [firstTermResults, setFirstTermResults] = useState<TermResult[]>([]);
  const [secondTermResults, setSecondTermResults] = useState<TermResult[]>([]);
  const [thirdTermResults, setThirdTermResults] = useState<TermResult[]>([]);
  const [annualResults, setAnnualResults] = useState<AnnualResult[]>([]);
  
  // Statistics state
  const [sequenceClassAverage, setSequenceClassAverage] = useState<number | null>(null);
  const [firstTermClassAverage, setFirstTermClassAverage] = useState<number | null>(null);
  const [secondTermClassAverage, setSecondTermClassAverage] = useState<number | null>(null);
  const [thirdTermClassAverage, setThirdTermClassAverage] = useState<number | null>(null);
  const [annualClassAverage, setAnnualClassAverage] = useState<number | null>(null);
  const [sequencePassPercentage, setSequencePassPercentage] = useState<number | null>(null);
  const [firstTermPassPercentage, setFirstTermPassPercentage] = useState<number | null>(null);
  const [secondTermPassPercentage, setSecondTermPassPercentage] = useState<number | null>(null);
  const [thirdTermPassPercentage, setThirdTermPassPercentage] = useState<number | null>(null);
  const [annualPassPercentage, setAnnualPassPercentage] = useState<number | null>(null);

  const PASSING_MARK = 10;

  // Refs for debounced writes and latest state snapshots
  const marksRef = useRef<StudentMarks[]>([]);
  const commentsRef = useRef<{ [key: number]: { [key: string]: string } }>({});
  const markSaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const commentSaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Keep refs in sync with state
  useEffect(() => {
    marksRef.current = marks;
  }, [marks]);

  useEffect(() => {
    commentsRef.current = studentComments;
  }, [studentComments]);

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      Object.values(markSaveTimeoutsRef.current).forEach((t) => clearTimeout(t));
      Object.values(commentSaveTimeoutsRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  // Load cached quick stats early so Home shows something immediately
  useEffect(() => {
    const loadSavedStats = async () => {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, `users/${currentUser.uid}/stats/current`));
        if (snap.exists()) {
          const s: any = snap.data();
          if (typeof s.firstTermClassAverage === 'number') setFirstTermClassAverage(s.firstTermClassAverage);
          if (typeof s.secondTermClassAverage === 'number') setSecondTermClassAverage(s.secondTermClassAverage);
          if (typeof s.thirdTermClassAverage === 'number') setThirdTermClassAverage(s.thirdTermClassAverage);
          if (typeof s.annualClassAverage === 'number') setAnnualClassAverage(s.annualClassAverage);

          if (typeof s.firstTermPassPercentage === 'number') setFirstTermPassPercentage(s.firstTermPassPercentage);
          if (typeof s.secondTermPassPercentage === 'number') setSecondTermPassPercentage(s.secondTermPassPercentage);
          if (typeof s.thirdTermPassPercentage === 'number') setThirdTermPassPercentage(s.thirdTermPassPercentage);
          if (typeof s.annualPassPercentage === 'number') setAnnualPassPercentage(s.annualPassPercentage);
        }
      } catch (e) {
        // Non-blocking
        console.warn('Failed to load cached stats:', e);
      }
    };
    loadSavedStats();
  }, [currentUser]);

  // Persist quick stats so Home can show immediately on next load
  const saveStats = async () => {
    if (!currentUser) return;
    try {
      const payload = {
        firstTermClassAverage,
        secondTermClassAverage,
        thirdTermClassAverage,
        annualClassAverage,
        firstTermPassPercentage,
        secondTermPassPercentage,
        thirdTermPassPercentage,
        annualPassPercentage,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, `users/${currentUser.uid}/stats/current`), payload, { merge: true });
    } catch (e) {
      // Non-blocking
      console.warn('Failed to save quick stats:', e);
    }
  };

  // Auto-calculate summaries on data load so Home quick stats are ready at app open
  useEffect(() => {
    if (dataLoading) return;
    if (!students.length || !subjects.length) return;
    // Attempt each term calculation; functions internally check mark availability
    calculateFirstTerm();
    calculateSecondTerm();
    calculateThirdTerm();
    // Calculate annual after terms
    setTimeout(() => {
      calculateAnnualResults();
    }, 0);
  }, [dataLoading, students, subjects, marks]);

  // Load data from Firestore
  useEffect(() => {
    if (!currentUser) {
      setStudents([]);
      setSubjects([]);
      setMarks([]);
      setStudentComments({});
      setDataLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/students`));
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreStudent[];
        setStudents(studentsData);

        // Fetch subjects
        const subjectsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/subjects`));
        const subjectsData = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreSubject[];
        setSubjects(subjectsData);

        // Fetch marks and comments
        const marksSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/marks`));
        const marksData = marksSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            firstSequence: data.firstSequence || {},
            secondSequence: data.secondSequence || {},
            thirdSequence: data.thirdSequence || {},
            fourthSequence: data.fourthSequence || {},
            fifthSequence: data.fifthSequence || {},
            sixthSequence: data.sixthSequence || {},
          };
        });
        setMarks(marksData as StudentMarks[]);

        const commentsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/comments`));
        const commentsData = commentsSnapshot.docs.reduce((acc, doc) => {
          acc[Number(doc.id)] = doc.data();
          return acc;
        }, {} as {[key: number]: {[key: string]: string}});
        setStudentComments(commentsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Language handler
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Student handlers
  const handleAddStudent = async (name: string, file?: File) => {
    if (!currentUser) return;

    try {
      const studentRef = await addDoc(collection(db, `users/${currentUser.uid}/students`), {
        name,
        createdAt: new Date().toISOString()
      });

      let imageUrl: string | undefined;
      let imagePath: string | undefined;
      if (file) {
        try {
          imagePath = `users/${currentUser.uid}/students/${studentRef.id}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase
            .storage
            .from(SUPABASE_BUCKET)
            .upload(imagePath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
          if (uploadErr) {
            console.error("Error uploading student image:", uploadErr);
            alert(`Failed to upload image. Please verify the Supabase Storage configuration and try again.\n\n${(uploadErr as any).message || String(uploadErr)}`);
          } else {
            const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(imagePath);
            if (data?.publicUrl) {
              imageUrl = data.publicUrl;
              await updateDoc(doc(db, `users/${currentUser.uid}/students/${studentRef.id}`), { imageUrl, imagePath });
            } else {
              console.warn("No public URL returned. Ensure the bucket is set to Public in Supabase.");
              alert("Image uploaded, but the app couldn't obtain a public URL. Make sure the bucket is set to Public.");
            }
          }
        } catch (uploadErr) {
          console.error("Error uploading student image:", uploadErr);
        }
      }

      const newStudent = { id: studentRef.id, name, ...(imageUrl ? { imageUrl } : {}), ...(imagePath ? { imagePath } : {}) } as FirestoreStudent;
      setStudents(prev => [...prev, newStudent]);

      // Initialize marks for new student
      const newMarks = {
        id: studentRef.id,
        firstSequence: {},
        secondSequence: {},
        thirdSequence: {},
        fourthSequence: {},
        fifthSequence: {},
        sixthSequence: {},
      };

      await setDoc(doc(db, `users/${currentUser.uid}/marks/${studentRef.id}`), newMarks);
      setMarks(prev => [...prev, newMarks]);

    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleEditStudent = async (index: number, name: string, file?: File) => {
    if (!currentUser) return;

    const student = students[index];
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/students/${student.id}`), { name });

      let imageUrl: string | undefined;
      let imagePath: string | undefined;
      const oldImagePath = student.imagePath;
      if (file) {
        try {
          imagePath = `users/${currentUser.uid}/students/${student.id}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase
            .storage
            .from(SUPABASE_BUCKET)
            .upload(imagePath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
          if (uploadErr) {
            console.error("Error uploading student image:", uploadErr);
            alert(`Failed to upload image. Please verify the Supabase Storage configuration and try again.\n\n${(uploadErr as any).message || String(uploadErr)}`);
          } else {
            const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(imagePath);
            if (data?.publicUrl) {
              imageUrl = data.publicUrl;
              await updateDoc(doc(db, `users/${currentUser.uid}/students/${student.id}`), { imageUrl, imagePath });

              // Best-effort cleanup of old image only after successful upload
              if (oldImagePath) {
                try {
                  await supabase.storage.from(SUPABASE_BUCKET).remove([oldImagePath]);
                } catch (e) {
                  // Ignore cleanup errors
                }
              }
            } else {
              console.warn("No public URL returned. Ensure the bucket is set to Public in Supabase.");
              alert("Image uploaded, but the app couldn't obtain a public URL. Make sure the bucket is set to Public.");
            }
          }
        } catch (uploadErr) {
          console.error("Error uploading student image:", uploadErr);
        }
      }

      const updatedStudents = [...students];
      updatedStudents[index] = { ...student, name, ...(imageUrl ? { imageUrl } : {}), ...(imagePath ? { imagePath } : {}) };
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async (index: number) => {
    if (!currentUser) return;

    const student = students[index];
    try {
      const batch = writeBatch(db);
      
      // Delete student
      batch.delete(doc(db, `users/${currentUser.uid}/students/${student.id}`));
      
      // Delete associated marks
      batch.delete(doc(db, `users/${currentUser.uid}/marks/${student.id}`));
      
      // Delete associated comments
      batch.delete(doc(db, `users/${currentUser.uid}/comments/${index}`));
      
      await batch.commit();

      // Delete associated image from Supabase if present
      if (student.imagePath) {
        try {
          await supabase.storage.from(SUPABASE_BUCKET).remove([student.imagePath]);
        } catch (imgErr) {
          // Ignore if not found or any storage-specific error
        }
      }

      setStudents(students.filter((_, i) => i !== index));
      setMarks(marks.filter((_, i) => i !== index));
      
      const updatedComments = { ...studentComments };
      delete updatedComments[index];
      setStudentComments(updatedComments);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Subject handlers
  const handleAddSubject = async (name: string, total: number, teacher?: string) => {
    if (!currentUser) return;
    try {
      const payload: any = {
        name,
        total,
        createdAt: new Date().toISOString(),
      };
      if (typeof teacher === 'string' && teacher.trim() !== '') {
        payload.teacher = teacher.trim();
      }
      const subjectRef = await addDoc(collection(db, `users/${currentUser.uid}/subjects`), payload);
      const newSubject: FirestoreSubject = { id: subjectRef.id, name, total, teacher: payload.teacher };
      setSubjects(prev => [...prev, newSubject]);
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const handleEditSubject = async (index: number, name: string, total: number, teacher?: string) => {
    if (!currentUser) return;
    const subject = subjects[index];
    if (!subject) return;
    try {
      const update: any = { name, total };
      // Only update teacher if provided and non-empty to avoid overwriting existing value unintentionally
      if (typeof teacher !== 'undefined' && teacher.trim() !== '') {
        update.teacher = teacher.trim();
      }
      await updateDoc(doc(db, `users/${currentUser.uid}/subjects/${subject.id}`), update);
      const updated: FirestoreSubject = { ...subject, name, total };
      if (update.teacher) updated.teacher = update.teacher;
      setSubjects(prev => {
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const handleDeleteSubject = async (index: number) => {
    if (!currentUser) return;
    const subject = subjects[index];
    if (!subject) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/subjects/${subject.id}`));
      setSubjects(subjects.filter((_, i) => i !== index));

      // Remove the deleted subject's marks from all students locally
      const updatedMarks = marks.map(studentMarks => {
        const newMarks = { ...studentMarks } as StudentMarks;
        (['firstSequence','secondSequence','thirdSequence','fourthSequence','fifthSequence','sixthSequence'] as const).forEach(seq => {
          if (newMarks[seq]) {
            const seqObj = { ...newMarks[seq] } as Record<string, any>;
            delete seqObj[subject.name];
            (newMarks as any)[seq] = seqObj;
          }
        });
        return newMarks;
      });
      setMarks(updatedMarks);

      // Persist marks cleanup in Firestore
      const batch = writeBatch(db);
      students.forEach((stu, studentIndex) => {
        batch.update(doc(db, `users/${currentUser.uid}/marks/${stu.id}`), updatedMarks[studentIndex] as any);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // Mark handlers
  const handleMarkChange = async (
    studentIndex: number,
    subject: string,
    mark: string,
    maxTotal: number
  ) => {
    if (!currentUser) return;

    const numericMark = mark === "" ? "" : Number(mark);
    if (
      mark === "" || 
      (typeof numericMark === "number" && !isNaN(numericMark) && numericMark >= 0 && numericMark <= maxTotal)
    ) {
      try {
        const student = students[studentIndex];
        const currentMarks = marksRef.current[studentIndex] || {
          firstSequence: {},
          secondSequence: {},
          thirdSequence: {},
          fourthSequence: {},
          fifthSequence: {},
          sixthSequence: {},
        };

        const updatedMarksForStudent = {
          ...currentMarks,
          [selectedSequence]: {
            ...currentMarks[selectedSequence],
            [subject]: numericMark,
          },
        };

        // Immediate UI update
        setMarks((prev) => {
          const next = [...prev];
          next[studentIndex] = updatedMarksForStudent as any;
          return next;
        });

        // Debounced Firestore write per student
        const key = String(studentIndex);
        if (markSaveTimeoutsRef.current[key]) {
          clearTimeout(markSaveTimeoutsRef.current[key]);
        }
        markSaveTimeoutsRef.current[key] = setTimeout(async () => {
          try {
            const latest = marksRef.current[studentIndex] || updatedMarksForStudent;
            await setDoc(doc(db, `users/${currentUser.uid}/marks/${student.id}`), latest);
          } catch (err) {
            console.error("Error updating mark:", err);
          }
        }, 500);
      } catch (error) {
        console.error("Error updating mark:", error);
      }
    }
  };

  // Comment handler
  const handleCommentChange = async (
    studentIndex: number,
    sequence: string,
    comment: string
  ) => {
    if (!currentUser) return;

    try {
      const existing = commentsRef.current[studentIndex] || {};
      const updatedComments = {
        ...existing,
        [sequence]: comment,
      };

      // Immediate UI update
      setStudentComments((prev) => ({
        ...prev,
        [studentIndex]: updatedComments,
      }));

      // Debounced Firestore write per student comments
      const key = String(studentIndex);
      if (commentSaveTimeoutsRef.current[key]) {
        clearTimeout(commentSaveTimeoutsRef.current[key]);
      }
      commentSaveTimeoutsRef.current[key] = setTimeout(async () => {
        try {
          const latest = commentsRef.current[studentIndex] || updatedComments;
          await setDoc(doc(db, `users/${currentUser.uid}/comments/${studentIndex}`), latest);
        } catch (err) {
          console.error("Error updating comment:", err);
        }
      }, 500);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Helper function to check if marks exist for a sequence
  const hasMarksForSequence = (sequenceName: keyof StudentMarks) => {
    return students.some((_, index) => 
      subjects.some(subject => {
        const mark = marks[index]?.[sequenceName]?.[subject.name];
        return mark !== undefined && mark !== null && mark !== '';
      })
    );
  };

  // Individual term calculation functions
  const calculateFirstTerm = () => {
    if (!hasMarksForSequence('firstSequence') || !hasMarksForSequence('secondSequence')) {
      return;
    }

    const firstTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq1Mark = Number(marks[index]?.firstSequence?.[subject.name] ?? 0);
        const seq2Mark = Number(marks[index]?.secondSequence?.[subject.name] ?? 0);
        totalMarks += (seq1Mark + seq2Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    const sortedFirstTerm = [...firstTermResults].sort((a, b) => b.average - a.average);
    const firstTermWithRank = sortedFirstTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const firstTermClassAvg = firstTermResults.reduce((sum, { average }) => sum + average, 0) / firstTermResults.length;
    const firstTermPassCount = firstTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const firstTermPassPerc = (firstTermPassCount / firstTermResults.length) * 100;

    setFirstTermResults(firstTermWithRank);
    setFirstTermClassAverage(firstTermClassAvg);
    setFirstTermPassPercentage(firstTermPassPerc);
    void saveStats();
  };

  const calculateSecondTerm = () => {
    if (!hasMarksForSequence('thirdSequence') || !hasMarksForSequence('fourthSequence')) {
      return;
    }

    const secondTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq3Mark = Number(marks[index]?.thirdSequence?.[subject.name] ?? 0);
        const seq4Mark = Number(marks[index]?.fourthSequence?.[subject.name] ?? 0);
        totalMarks += (seq3Mark + seq4Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    const sortedSecondTerm = [...secondTermResults].sort((a, b) => b.average - a.average);
    const secondTermWithRank = sortedSecondTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const secondTermClassAvg = secondTermResults.reduce((sum, { average }) => sum + average, 0) / secondTermResults.length;
    const secondTermPassCount = secondTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const secondTermPassPerc = (secondTermPassCount / secondTermResults.length) * 100;

    setSecondTermResults(secondTermWithRank);
    setSecondTermClassAverage(secondTermClassAvg);
    setSecondTermPassPercentage(secondTermPassPerc);
    void saveStats();
  };

  const calculateThirdTerm = () => {
    if (!hasMarksForSequence('fifthSequence') || !hasMarksForSequence('sixthSequence')) {
      return;
    }

    const thirdTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq5Mark = Number(marks[index]?.fifthSequence?.[subject.name] ?? 0);
        const seq6Mark = Number(marks[index]?.sixthSequence?.[subject.name] ?? 0);
        totalMarks += (seq5Mark + seq6Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    const sortedThirdTerm = [...thirdTermResults].sort((a, b) => b.average - a.average);
    const thirdTermWithRank = sortedThirdTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const thirdTermClassAvg = thirdTermResults.reduce((sum, { average }) => sum + average, 0) / thirdTermResults.length;
    const thirdTermPassCount = thirdTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const thirdTermPassPerc = (thirdTermPassCount / thirdTermResults.length) * 100;

    setThirdTermResults(thirdTermWithRank);
    setThirdTermClassAverage(thirdTermClassAvg);
    setThirdTermPassPercentage(thirdTermPassPerc);
    void saveStats();
  };

  const calculateAnnualResults = () => {
    // Only calculate annual results if all three terms have been calculated
    if (firstTermResults.length === 0 || secondTermResults.length === 0 || thirdTermResults.length === 0) {
      return;
    }

    const annualResults = students.map((student) => {
      const firstTermAvg = firstTermResults.find(r => r.student === student.name)?.average || 0;
      const secondTermAvg = secondTermResults.find(r => r.student === student.name)?.average || 0;
      const thirdTermAvg = thirdTermResults.find(r => r.student === student.name)?.average || 0;
      const finalAverage = (firstTermAvg + secondTermAvg + thirdTermAvg) / 3;

      return {
        student: student.name,
        firstTermAverage: firstTermAvg,
        secondTermAverage: secondTermAvg,
        thirdTermAverage: thirdTermAvg,
        finalAverage
      };
    });

    const sortedAnnual = [...annualResults].sort((a, b) => b.finalAverage - a.finalAverage);
    const annualWithRank = sortedAnnual.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const annualClassAvg = annualResults.reduce((sum, { finalAverage }) => sum + finalAverage, 0) / annualResults.length;
    const annualPassCount = annualResults.filter(({ finalAverage }) => finalAverage >= PASSING_MARK).length;
    const annualPassPerc = (annualPassCount / annualResults.length) * 100;

    setAnnualResults(annualWithRank);
    setAnnualClassAverage(annualClassAvg);
    setAnnualPassPercentage(annualPassPerc);

    // Persist quick stats so Home can show immediately on next load
    void saveStats();
  };

  // Calculate results with auto-term calculation
  const calculateSequenceResults = () => {
    const results = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const mark = Number(marks[index]?.[selectedSequence]?.[subject.name] ?? 0);
        totalMarks += mark;
        totalPossible += subject.total;
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    const sortedResults = [...results].sort((a, b) => b.average - a.average);
    const resultsWithRank = sortedResults.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const classAvg = results.reduce((sum, { average }) => sum + average, 0) / results.length;
    const passCount = results.filter(({ average }) => average >= PASSING_MARK).length;
    const passPerc = (passCount / results.length) * 100;

    setSequenceResults(resultsWithRank);
    setSequenceClassAverage(classAvg);
    setSequencePassPercentage(passPerc);
    setSelectedResultView('sequence');

    // Auto-calculate terms based on the current sequence
    if (selectedSequence === 'firstSequence' || selectedSequence === 'secondSequence') {
      calculateFirstTerm();
    } else if (selectedSequence === 'thirdSequence' || selectedSequence === 'fourthSequence') {
      calculateSecondTerm();
    } else if (selectedSequence === 'fifthSequence' || selectedSequence === 'sixthSequence') {
      calculateThirdTerm();
    }

    // Auto-calculate annual results if all terms are available
    setTimeout(() => {
      calculateAnnualResults();
    }, 100); // Small delay to ensure term calculations complete first
  };

  // Calculate term results (existing function for manual calculation)
  const calculateTermResults = () => {
    // First Term (Sequences 1 & 2)
    const firstTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq1Mark = Number(marks[index]?.firstSequence?.[subject.name] ?? 0);
        const seq2Mark = Number(marks[index]?.secondSequence?.[subject.name] ?? 0);
        totalMarks += (seq1Mark + seq2Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    // Second Term (Sequences 3 & 4)
    const secondTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq3Mark = Number(marks[index]?.thirdSequence?.[subject.name] ?? 0);
        const seq4Mark = Number(marks[index]?.fourthSequence?.[subject.name] ?? 0);
        totalMarks += (seq3Mark + seq4Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    // Third Term (Sequences 5 & 6)
    const thirdTermResults = students.map((student, index) => {
      let totalMarks = 0;
      let totalPossible = 0;

      subjects.forEach(subject => {
        const seq5Mark = Number(marks[index]?.fifthSequence?.[subject.name] ?? 0);
        const seq6Mark = Number(marks[index]?.sixthSequence?.[subject.name] ?? 0);
        totalMarks += (seq5Mark + seq6Mark);
        totalPossible += (subject.total * 2);
      });

      const average = (totalMarks / totalPossible) * 20;
      return { student: student.name, totalMarks, average };
    });

    // Add ranks to term results
    const sortedFirstTerm = [...firstTermResults].sort((a, b) => b.average - a.average);
    const firstTermWithRank = sortedFirstTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const sortedSecondTerm = [...secondTermResults].sort((a, b) => b.average - a.average);
    const secondTermWithRank = sortedSecondTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    const sortedThirdTerm = [...thirdTermResults].sort((a, b) => b.average - a.average);
    const thirdTermWithRank = sortedThirdTerm.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    // Calculate annual results
    const annualResults = students.map((student, index) => {
      const firstTermAvg = firstTermResults[index].average;
      const secondTermAvg = secondTermResults[index].average;
      const thirdTermAvg = thirdTermResults[index].average;
      const finalAverage = (firstTermAvg + secondTermAvg + thirdTermAvg) / 3;

      return {
        student: student.name,
        firstTermAverage: firstTermAvg,
        secondTermAverage: secondTermAvg,
        thirdTermAverage: thirdTermAvg,
        finalAverage
      };
    });

    // Sort and add ranks to annual results
    const sortedAnnual = [...annualResults].sort((a, b) => b.finalAverage - a.finalAverage);
    const annualWithRank = sortedAnnual.map((result, idx) => ({
      ...result,
      rank: idx + 1
    }));

    // Calculate class averages and pass percentages
    const firstTermClassAvg = firstTermResults.reduce((sum, { average }) => sum + average, 0) / firstTermResults.length;
    const secondTermClassAvg = secondTermResults.reduce((sum, { average }) => sum + average, 0) / secondTermResults.length;
    const thirdTermClassAvg = thirdTermResults.reduce((sum, { average }) => sum + average, 0) / thirdTermResults.length;
    const annualClassAvg = annualResults.reduce((sum, { finalAverage }) => sum + finalAverage, 0) / annualResults.length;

    const firstTermPassCount = firstTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const secondTermPassCount = secondTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const thirdTermPassCount = thirdTermResults.filter(({ average }) => average >= PASSING_MARK).length;
    const annualPassCount = annualResults.filter(({ finalAverage }) => finalAverage >= PASSING_MARK).length;

    const firstTermPassPerc = (firstTermPassCount / firstTermResults.length) * 100;
    const secondTermPassPerc = (secondTermPassCount / secondTermResults.length) * 100;
    const thirdTermPassPerc = (thirdTermPassCount / thirdTermResults.length) * 100;
    const annualPassPerc = (annualPassCount / annualResults.length) * 100;

    // Update state
    setFirstTermResults(firstTermWithRank);
    setSecondTermResults(secondTermWithRank);
    setThirdTermResults(thirdTermWithRank);
    setAnnualResults(annualWithRank);

    setFirstTermClassAverage(firstTermClassAvg);
    setSecondTermClassAverage(secondTermClassAvg);
    setThirdTermClassAverage(thirdTermClassAvg);
    setAnnualClassAverage(annualClassAvg);

    setFirstTermPassPercentage(firstTermPassPerc);
    setSecondTermPassPercentage(secondTermPassPerc);
    setThirdTermPassPercentage(thirdTermPassPerc);
    setAnnualPassPercentage(annualPassPerc);

    // Set view to first term by default
    setSelectedResultView('firstTerm');

    // Persist quick stats so Home can show immediately on next load
    void saveStats();
  };

  // Generate reports
  const handleGenerateStudentReport = (studentIndex: number) => {
    const student = students[studentIndex].name;
    generateStudentReport(
      student,
      studentIndex,
      marks[studentIndex],
      subjects.map(s => ({ name: s.name, total: s.total })),
      studentComments,
      selectedSequence,
      selectedResultView,
      firstTermResults,
      secondTermResults,
      thirdTermResults,
      annualResults,
      t
    );
  };

  const handleGenerateAllReports = () => {
    students.forEach((_, index) => handleGenerateStudentReport(index));
  };

  // Template generation helpers (single/batch)
  const getTemplatePath = (templateId?: string | null) => {
    return templateId === 'classic-a4'
      ? '/templates/classic-a4-template.html'
      : '/templates/classic-a4-template.html';
  };

  // Truncate to 2 decimals without rounding
  const toFixedTrunc2 = (val: number): string => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);
    const truncated = Math.floor(abs * 100) / 100;
    return (sign * truncated).toFixed(2);
  };

  const buildTemplatePayloadForStudent = (studentIndex: number) => {
    const extra = pendingTemplateData || {};
    const studentName = students[studentIndex]?.name || '';

    // Map selectedResultView to the correct sequences
    const getSeqNamesForView = (view: string) => {
      if (view === 'firstTerm') return ['firstSequence', 'secondSequence'] as const;
      if (view === 'secondTerm') return ['thirdSequence', 'fourthSequence'] as const;
      if (view === 'thirdTerm') return ['fifthSequence', 'sixthSequence'] as const;
      return [] as const; // annual handled separately
    };

    // Subjects data based on selected term
    const subjectsData = subjects.map(sub => {
      let seq1: number | '' = '';
      let seq2: number | '' = '';
      let average: number | '' = '';

      if (selectedResultView === 'annual') {
        const seqNames = ['firstSequence','secondSequence','thirdSequence','fourthSequence','fifthSequence','sixthSequence'] as const;
        const vals: number[] = [];
        seqNames.forEach(sq => {
          const v = (marks[studentIndex]?.[sq] || {})[sub.name] as number | '' | undefined;
          if (typeof v === 'number') vals.push(v);
        });
        if (vals.length > 0) average = vals.reduce((a,b)=>a+b,0) / vals.length; // no rounding
      } else {
        const [a, b] = getSeqNamesForView(selectedResultView);
        const seq1Raw = a ? (marks[studentIndex]?.[a] || {})[sub.name] as number | '' | undefined : undefined;
        const seq2Raw = b ? (marks[studentIndex]?.[b] || {})[sub.name] as number | '' | undefined : undefined;
        seq1 = typeof seq1Raw === 'number' ? seq1Raw : '';
        seq2 = typeof seq2Raw === 'number' ? seq2Raw : '';
        if (typeof seq1 === 'number' && typeof seq2 === 'number') average = (seq1 + seq2) / 2; // no rounding
        else if (typeof seq1 === 'number') average = seq1;
        else if (typeof seq2 === 'number') average = seq2;
      }

      const meta = extra?.subjectsMeta?.find((m: any) => m.name === sub.name) || {};
      const averageFormatted = typeof average === 'number' ? toFixedTrunc2(average) : '';
      return {
        name: sub.name,
        teacher: meta.teacher || '',
        coefficient: meta.coefficient ?? '',
        seq1: seq1 === '' ? '' : seq1,
        seq2: seq2 === '' ? '' : seq2,
        average: averageFormatted,
        performance: meta.performance || '',
        remark: meta.remark || ''
      };
    });

    // Term data from results by selectedResultView
    const titleDefault = selectedResultView === 'firstTerm' ? 'FIRST TERM REPORT CARD'
      : selectedResultView === 'secondTerm' ? 'SECOND TERM REPORT CARD'
      : selectedResultView === 'thirdTerm' ? 'THIRD TERM REPORT CARD'
      : selectedResultView === 'annual' ? 'ANNUAL REPORT CARD'
      : 'REPORT CARD';
    const titleFrDefault = selectedResultView === 'firstTerm' ? 'BULLETIN DU PREMIER TRIMESTRE'
      : selectedResultView === 'secondTerm' ? 'BULLETIN DU DEUXIÈME TRIMESTRE'
      : selectedResultView === 'thirdTerm' ? 'BULLETIN DU TROISIÈME TRIMESTRE'
      : selectedResultView === 'annual' ? 'BULLETIN ANNUEL'
      : 'BULLETIN SCOLAIRE';

    let resultRow: TermResult | undefined;
    if (selectedResultView === 'firstTerm') {
      resultRow = firstTermResults.find(r => r.student === studentName);
    } else if (selectedResultView === 'secondTerm') {
      resultRow = secondTermResults.find(r => r.student === studentName);
    } else if (selectedResultView === 'thirdTerm') {
      resultRow = thirdTermResults.find(r => r.student === studentName);
    }

    const annualRow = annualResults.find(r => r.student === studentName);

    // Compute annual totals from subject averages if needed
    let annualWeightedTotal: number | '' = '';
    if (selectedResultView === 'annual') {
      let sum = 0;
      subjectsData.forEach(sd => {
        const avg = typeof sd.average === 'number' ? sd.average : NaN;
        const coeff = typeof sd.coefficient === 'number' ? sd.coefficient : Number(sd.coefficient) || 1;
        if (!isNaN(avg)) sum += avg * coeff;
      });
      annualWeightedTotal = sum;
    }

    // Fallback compute for term totals/average if resultRow missing
    let termWeightedTotal: number | '' = '';
    let termOverallAverage: number | '' = '';
    if (selectedResultView !== 'annual') {
      let sum = 0;
      let coeffSum = 0;
      subjectsData.forEach(sd => {
        const avg = typeof sd.average === 'number' ? sd.average : (typeof sd.average === 'string' ? Number(sd.average) : NaN);
        const coeff = typeof sd.coefficient === 'number' ? sd.coefficient : Number(sd.coefficient) || 1;
        if (!isNaN(avg)) {
          sum += avg * coeff;
          coeffSum += coeff;
        }
      });
      if (coeffSum > 0) {
        termWeightedTotal = sum;
        termOverallAverage = sum / coeffSum; // will format below
      }
    }

    const termData: any = {
      title: extra?.termTitleEn || titleDefault,
      titleFr: extra?.termTitleFr || titleFrDefault,
      mention: extra?.mention || '',
      performanceFactors: extra?.performanceFactors || '',
      teacherComment: extra?.teacherComment || '',
      principalComment: extra?.principalComment || '',
      totalMarks: selectedResultView === 'annual'
        ? (annualWeightedTotal === '' ? '' : annualWeightedTotal)
        : (typeof resultRow?.totalMarks === 'number' ? resultRow.totalMarks : (termWeightedTotal === '' ? '' : termWeightedTotal)),
      position: selectedResultView === 'annual' ? (annualRow?.rank ?? '') : (resultRow?.rank ?? ''),
      average: selectedResultView === 'annual'
        ? (typeof annualRow?.finalAverage === 'number' ? toFixedTrunc2(annualRow.finalAverage) : '')
        : (typeof resultRow?.average === 'number'
            ? toFixedTrunc2(resultRow.average)
            : (termOverallAverage === '' ? '' : toFixedTrunc2(termOverallAverage as number))),
      classSize: students.length || '',
      annualAverage: selectedResultView === 'annual'
        ? (typeof annualRow?.finalAverage === 'number' ? toFixedTrunc2(annualRow.finalAverage) : '')
        : ''
    };

    const studentData = {
      name: studentName,
      id: extra?.matricule || '',
      dateOfBirth: extra?.dateOfBirth || '',
      placeOfBirth: extra?.placeOfBirth || '',
      className: extra?.className || '',
      branchOfStudy: extra?.branchOfStudy || '',
      option: extra?.option || '',
    };

    return { studentData, subjectsData, termData };
  };

  const openTemplateTab = (templateId?: string | null, payload?: any) => {
    try {
      localStorage.setItem('bb_template_payload', JSON.stringify(payload || {}));
    } catch (e) {
      console.error('Failed to store template payload:', e);
    }
    const path = getTemplatePath(templateId);
    window.open(path, '_blank');
  };

  const handleGenerateTemplateForStudent = (studentIndex: number) => {
    if (!reportForTemplate) return handleGenerateStudentReport(studentIndex);
    const payload = buildTemplatePayloadForStudent(studentIndex);
    openTemplateTab(pendingTemplateId, payload);
    // Reset flow state and close modal
    setReportModalOpen(false);
    setReportForTemplate(false);
    setPendingTemplateId(null);
    // keep pendingTemplateData for convenience
  };

  const handleGenerateTemplateForAll = () => {
    if (!reportForTemplate) return handleGenerateAllReports();
    students.forEach((_, idx) => {
      setTimeout(() => {
        const payload = buildTemplatePayloadForStudent(idx);
        openTemplateTab(pendingTemplateId, payload);
      }, idx * 200); // 200ms delay between tabs
    });
    // Reset after scheduling
    setReportModalOpen(false);
    setReportForTemplate(false);
    setPendingTemplateId(null);
  };

  // Reset data
  const handleResetData = async () => {
    if (!currentUser || !window.confirm(t('confirm_reset'))) return;

    try {
      const batch = writeBatch(db);

      // Delete all students
      const studentsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/students`));
      studentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all subjects
      const subjectsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/subjects`));
      subjectsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all marks
      const marksSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/marks`));
      marksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all comments
      const commentsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/comments`));
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Reset local state
      setStudents([]);
      setSubjects([]);
      setMarks([]);
      setStudentComments({});
      setSequenceResults([]);
      setFirstTermResults([]);
      setSecondTermResults([]);
      setThirdTermResults([]);
      setAnnualResults([]);
      setSelectedSequence('firstSequence');
      setSelectedResultView('sequence');
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  };

  // Check if there are any marks entered
  const hasMarks = marks.some(studentMarks =>
    studentMarks[selectedSequence] ? Object.values(studentMarks[selectedSequence]).some(mark => mark !== '') : false
  );

  if (loading || dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/pwa-192x192.png"
            alt="BrainBoard Logo"
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              mb: 2,
              zIndex: 1,
              opacity: 0.9,
              display: 'block',
            }}
          />
          <CircularProgress
            size={64}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <AuthWrapper>
      <AppBar position="static" color="default" elevation={0} sx={{ mb: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/pwa-192x192.png"
              alt="BrainBoard Logo"
              sx={{
                height: { xs: 32, sm: 40 },
                width: 'auto',
                mr: 1.5,
                borderRadius: 1,
                boxShadow: 1,
                display: 'block',
              }}
            />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}
            >
              <span style={{ color: theme.palette.primary.main }}>Brain</span>
              <span style={{ color: theme.palette.secondary.main }}>Board</span>
            </Typography>
          </Box>
          {/* Hamburger for mobile, menu for desktop */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
              <LanguageIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MuiMenuItem onClick={() => { handleLanguageChange('en'); setMenuAnchorEl(null); }}>{t('english')}</MuiMenuItem>
              <MuiMenuItem onClick={() => { handleLanguageChange('fr'); setMenuAnchorEl(null); }}>{t('french')}</MuiMenuItem>
            </Menu>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            <ListItem button onClick={() => setMenuAnchorEl(document.body)}>
              <ListItemIcon><LanguageIcon /></ListItemIcon>
              <ListItemText primary={t('language')} />
            </ListItem>
            <List component="div" disablePadding sx={{ pl: 3 }}>
              <ListItem button onClick={() => handleLanguageChange('en')}>
                <ListItemText primary={t('english')} />
              </ListItem>
              <ListItem button onClick={() => handleLanguageChange('fr')}>
                <ListItemText primary={t('french')} />
              </ListItem>
            </List>
            <Divider />
            <ListItem button onClick={logout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary={t('logout')} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4 }, mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      {/* Conditional rendering based on current view */}
      {currentView === 'home' && (
        (() => {
          const isFirstTerm = selectedSequence === 'firstSequence' || selectedSequence === 'secondSequence';
          const isSecondTerm = selectedSequence === 'thirdSequence' || selectedSequence === 'fourthSequence';
          const isThirdTerm = selectedSequence === 'fifthSequence' || selectedSequence === 'sixthSequence';

          const hasFirstTerm = Number.isFinite(Number(firstTermPassPercentage));
          const hasSecondTerm = Number.isFinite(Number(secondTermPassPercentage));
          const hasThirdTerm = Number.isFinite(Number(thirdTermPassPercentage));

          // Resolve the display context: prefer the selected term if it has data; otherwise fall back to sequence
          const context = (isFirstTerm && hasFirstTerm)
            ? 'firstTerm'
            : (isSecondTerm && hasSecondTerm)
            ? 'secondTerm'
            : (isThirdTerm && hasThirdTerm)
            ? 'thirdTerm'
            : 'sequence';

          const rawActivePass = context === 'firstTerm'
            ? firstTermPassPercentage
            : context === 'secondTerm'
            ? secondTermPassPercentage
            : context === 'thirdTerm'
            ? thirdTermPassPercentage
            : sequencePassPercentage;

          const numActivePass = Number(rawActivePass);
          const activePass = Number.isFinite(numActivePass)
            ? Math.min(100, Math.max(0, numActivePass))
            : 0;

          const activeLabel = context === 'firstTerm'
            ? 'First Term Pass Rate'
            : context === 'secondTerm'
            ? 'Second Term Pass Rate'
            : context === 'thirdTerm'
            ? 'Third Term Pass Rate'
            : 'Sequence Pass Rate';

          return (
            <HomePage
              firstTermAverage={context === 'firstTerm' ? firstTermClassAverage : null}
              secondTermAverage={context === 'secondTerm' ? secondTermClassAverage : null}
              thirdTermAverage={context === 'thirdTerm' ? thirdTermClassAverage : null}
              annualAverage={null}
              annualPassPercentage={activePass}
              passRateLabel={activeLabel}
              totalStudents={students.length}
              totalSubjects={subjects.length}
            />
          );
        })()
      )}

      {currentView === 'grades' && (
        <GradesPage
          students={students}
          subjects={subjects}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onOpenStudentModal={() => setStudentsOpen(true)}
            onOpenSubjectModal={() => setSubjectsOpen(true)}
          />
        )}

        {currentView === 'calculate' && (
          <EnhancedCalculatePage
            students={students}
            subjects={subjects}
            marks={marks}
            selectedSequence={selectedSequence}
            studentComments={studentComments}
            hasMarks={hasMarks}
            onSequenceChange={setSelectedSequence}
            onMarkChange={handleMarkChange}
            onCommentChange={handleCommentChange}
            onCalculateSequenceResults={calculateSequenceResults}
            onCalculateTermResults={calculateTermResults}
            onOpenBulkMarksModal={() => setBulkMarksModalOpen(true)}
          />
        )}

        {currentView === 'results' && (
          <EnhancedResultsPage
            selectedResultView={selectedResultView}
            sequenceResults={sequenceResults}
            firstTermResults={firstTermResults}
            secondTermResults={secondTermResults}
            thirdTermResults={thirdTermResults}
            annualResults={annualResults}
            sequenceClassAverage={sequenceClassAverage}
            firstTermClassAverage={firstTermClassAverage}
            secondTermClassAverage={secondTermClassAverage}
            thirdTermClassAverage={thirdTermClassAverage}
            annualClassAverage={annualClassAverage}
            sequencePassPercentage={sequencePassPercentage}
            firstTermPassPercentage={firstTermPassPercentage}
            secondTermPassPercentage={secondTermPassPercentage}
            thirdTermPassPercentage={thirdTermPassPercentage}
            annualPassPercentage={annualPassPercentage}
            passingMark={PASSING_MARK}
            onResultViewChange={setSelectedResultView}
            onDownloadPDF={() => {
              generateResultsPDF(
                t(selectedResultView),
                selectedResultView === 'sequence' ? sequenceResults :
                selectedResultView === 'firstTerm' ? firstTermResults :
                selectedResultView === 'secondTerm' ? secondTermResults :
                selectedResultView === 'thirdTerm' ? thirdTermResults :
                annualResults,
                selectedResultView === 'sequence' ? sequenceClassAverage! :
                selectedResultView === 'firstTerm' ? firstTermClassAverage! :
                selectedResultView === 'secondTerm' ? secondTermClassAverage! :
                selectedResultView === 'thirdTerm' ? thirdTermClassAverage! :
                annualClassAverage!,
                selectedResultView === 'sequence' ? sequencePassPercentage! :
                selectedResultView === 'firstTerm' ? firstTermPassPercentage! :
                selectedResultView === 'secondTerm' ? secondTermPassPercentage! :
                selectedResultView === 'thirdTerm' ? thirdTermPassPercentage! :
                annualPassPercentage!,
                selectedResultView === 'annual',
                t
              );
            }}

          />
        )}

        {currentView === 'print' && (
          <TemplateGalleryPage
            subjects={subjects.map(s => ({ name: s.name, total: s.total }))}
            availableData={{
              // Pre-fill term titles if the current result view suggests a specific term
              termTitleEn:
                selectedResultView === 'firstTerm' ? 'FIRST TERM REPORT CARD' :
                selectedResultView === 'secondTerm' ? 'SECOND TERM REPORT CARD' :
                selectedResultView === 'thirdTerm' ? 'THIRD TERM REPORT CARD' : undefined,
              termTitleFr:
                selectedResultView === 'firstTerm' ? 'BULLETIN DU PREMIER TRIMESTRE' :
                selectedResultView === 'secondTerm' ? 'BULLETIN DU DEUXIÈME TRIMESTRE' :
                selectedResultView === 'thirdTerm' ? 'BULLETIN DU TROISIÈME TRIMESTRE' : undefined,
            }}
            onSelectTemplate={(templateId, extraData) => {
              // Defer student selection to existing ReportModal for single/batch options
              setReportForTemplate(true);
              setPendingTemplateId(templateId);
              setPendingTemplateData(extraData || {});
              setReportModalOpen(true);
            }}
            onBack={() => {
              setCurrentView('home');
              setBottomNavValue(0);
            }}
          />
        )}

        {/* Modals - Always rendered regardless of view */}
        <StudentModal
          open={studentsOpen}
          onClose={() => setStudentsOpen(false)}
          students={students.map(s =>s.name)}
          studentImageUrls={students.map(s => s.imageUrl)}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />

        <SubjectModal
          open={subjectsOpen}
          onClose={() => setSubjectsOpen(false)}
          subjects={subjects.map(s => ({ name: s.name, total: s.total, teacher: s.teacher }))}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
        />

        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          students={students.map(s => s.name)}
          onGenerateReport={reportForTemplate ? handleGenerateTemplateForStudent : handleGenerateStudentReport}
          onGenerateAllReports={reportForTemplate ? handleGenerateTemplateForAll : handleGenerateAllReports}
          selectedSequence={selectedSequence}
          selectedResultView={selectedResultView}
          enableTermChoice={reportForTemplate}
          onChangeResultView={(view) => setSelectedResultView(view as any)}
        />

        <BulkMarksEntry
          open={bulkMarksModalOpen}
          onClose={() => setBulkMarksModalOpen(false)}
          students={students.map(s => s.name)}
          subjects={subjects.map(s => ({ name: s.name, total: s.total }))}
          selectedSequence={selectedSequence}
          onSave={handleMarkChange}
        />

        <BottomNav
          value={bottomNavValue}
          onChange={(_, newValue) => {
            setBottomNavValue(newValue);
            switch (newValue) {
              case 0:
                setCurrentView('home');
                break;
              case 1:
                setCurrentView('grades');
                break;
              case 2:
                setCurrentView('calculate');
                break;
              case 3:
                setCurrentView('results');
                break;
              case 4:
                setCurrentView('print');
                break;
              default:
                setCurrentView('home');
            }
          }}
        />
      </Container>
    </AuthWrapper>
  );
}

export default App;